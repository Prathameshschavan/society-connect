/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMaintenanceStore } from "../../libs/stores/useMaintenanceStore";
import {
  useOrganizationStore,
  type ExtraItem,
} from "../../libs/stores/useOrganizationStore";
import { useProfileStore } from "../../libs/stores/useProfileStore";
import { supabase } from "../../libs/supabase/supabaseClient";
import toast from "react-hot-toast";
import { currMonth, currYear } from "../../utility/dateTimeServices";

export type DuesLine = {
  month: string; // "01".."12"
  year: string; // "YYYY"
  status: "overdue";
  amount: number; // that month’s base (from prior bill.amount)
  extras: ExtraItem[]; // that month’s extra (from prior bill.extra)
  penalty: number; // fixed penalty applied per overdue month
  subtotal: number; // amount + previousExtra + penalty
  note?: string;
};

export type BillBreakdown = {
  base: number;
  extras: ExtraItem[];
  extra_total: number;
  dues: DuesLine[];
};

interface FetchResidentsParams {
  orgId?: string;
  page?: number;
  pageSize?: number;
  searchQuery?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: {
    city?: string;
    role?: string;
    unitNumber?: string;
    minAge?: number;
    maxAge?: number;
  };
}

export interface FetchMaintenanceBillsParams {
  orgId?: string;
  residentId?: string;
  page?: number;
  pageSize?: number;
  searchQuery?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: {
    status?: string;
    billMonth?: string;
    billYear?: string;
    residentId?: string;
    minAmount?: number;
    maxAmount?: number;
    dueDateFrom?: string;
    dueDateTo?: string;
  };
}

export interface FetchMaintenanceBillsResponse {
  data: any[];
  pagination: PaginationInfo;
  totalBills: number;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface FetchResidentsResponse {
  data: any[];
  pagination: PaginationInfo;
  totalResidents: number;
}
type UpdateStatusInput = {
  id: string; // bill id to update
  status: "pending" | "paid" | "overdue" | "cancelled";
  notes?: string | null;
  transaction_id?: string | null; // only for "paid"
  payment_date?: string | null; // yyyy-mm-dd (ISO date-only) only for "paid"
};

const useAdminService = () => {
  const { profile, setResidents } = useProfileStore();
  const { setMaintenanceBills } = useMaintenanceStore();
  const { residentOrganization } = useOrganizationStore();

  const updateMaintenanceStatus = async (input: UpdateStatusInput) => {
    // Build partial payload, only include payment fields when paid
    const payload: Record<string, any> = {
      status: input.status,
    };

    if (input.status === "paid") {
      // payload.transaction_id = input.transaction_id ?? null;
      // payload.payment_date = input.payment_date ?? null; // e.g., "2025-08-30"
    } else {
      // Clear payment fields if not paid (optional; remove if you prefer to keep previous values)
      // payload.transaction_id = null;
      // payload.payment_date = null;
    }

    const { data, error } = await supabase
      .from("maintenance_bills")
      .update(payload)
      .eq("id", input.id) // filter by primary key
      .select("*") // return updated row
      .single();

    if (error) throw error;
    return data;
  };

  const fetchResidents = async ({
    orgId = profile?.organization_id,
    page = 1,
    pageSize = 10,
    searchQuery = "",
    sortBy = "created_at",
    sortOrder = "desc",
    filters = {},
  }: FetchResidentsParams = {}): Promise<FetchResidentsResponse | null> => {
    try {
      // Calculate offset for pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Build base query
      let query = supabase
        .from("profiles")
        .select("*", { count: "exact" })
        .eq("is_deleted", false);

      // Apply organization filter
      if (orgId) {
        query = query.eq("organization_id", orgId);
      }

      // Apply search filter
      if (searchQuery.trim()) {
        query = query.or(
          `full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`
        );
      }

      // Apply filters
      if (filters.city) {
        query = query.eq("city", filters.city);
      }

      if (filters.role) {
        query = query.eq("role", filters.role);
      }

      if (filters.unitNumber) {
        query = query.eq("unit_number", filters.unitNumber);
      }

      if (filters.minAge !== undefined) {
        query = query.gte("age", filters.minAge);
      }

      if (filters.maxAge !== undefined) {
        query = query.lte("age", filters.maxAge);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === "asc" });

      // Apply pagination
      query = query.range(from, to);

      // Execute query
      const { data, error, count } = await query;

      if (error) {
        console.error("Supabase error:", error);
        toast.error("Failed to fetch residents");
        return null;
      }

      if (!data) {
        toast.error("No data received");
        return null;
      }

      // Calculate pagination info
      const totalItems = count || 0;
      const totalPages = Math.ceil(totalItems / pageSize);
      const currentPage = page;
      const hasNextPage = currentPage < totalPages;
      const hasPrevPage = currentPage > 1;

      const paginationInfo: PaginationInfo = {
        currentPage,
        totalPages,
        totalItems,
        pageSize,
        hasNextPage,
        hasPrevPage,
      };

      // Update store
      setResidents(data as never);

      const response: FetchResidentsResponse = {
        data,
        pagination: paginationInfo,
        totalResidents: totalItems,
      };

      return response;
    } catch (error) {
      console.error("Fetch residents error:", error);
      toast.error("Something went wrong while fetching residents");
      return null;
    }
  };

  const permanentlyDeleteResident = async (
    residentId: string
  ): Promise<boolean> => {
    try {
      // Hard delete - permanently removes record
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", residentId);

      if (error) {
        console.error("Failed to delete resident:", error);
        toast.error("Failed to delete resident");
        return false;
      }

      toast.success("Resident permanently deleted");
      return true;
    } catch (error) {
      console.error("Error deleting resident:", error);
      toast.error("An unexpected error occurred");
      return false;
    }
  };

  // helper to compute previous YYYY-MM
  const prevPeriod = (yearStr: string, monthStr: string) => {
    const y = Number(yearStr);
    const m = Number(monthStr);
    if (m > 1) {
      return { year: String(y), month: String(m - 1).padStart(2, "0") };
    }
    return { year: String(y - 1), month: "12" };
  };

  const createBillsWithPenaltyForAllResidents = async () => {
    if (!profile?.organization_id)
      return { error: "Missing organization context" };

    console.log("===> 1", profile?.organization_id);

    const numOrErr = (v: any, label: string) =>
      Number.isNaN(Number(v)) ? `${label} must be a number` : null;

    for (const [v, label] of [
      [residentOrganization?.maintenance_amount, "maintenanceFixedAmount"],
      [residentOrganization?.maintenance_rate, "maintenanceRate"],
      [residentOrganization?.penalty_amount, "penaltyFixedAmount"],
      [residentOrganization?.penalty_rate, "penaltyRate"],
      [
        residentOrganization?.tenant_maintenance_amount,
        "tenantMaintenanceFixedAmount",
      ],
      [residentOrganization?.tenant_maintenance_rate, "tenantMaintenanceRate"],
    ] as const) {
      const err = numOrErr(v, label);
      if (err) return { error: err }; // [memory:12]
    }

    console.log("===> 2");

    // Validate extras shape: id, name non-empty, amount > 0
    const badExtra = (residentOrganization?.extras ?? []).find(
      (e) =>
        !e ||
        !e.id ||
        !e.name?.trim() ||
        Number(e.amount) <= 0 ||
        Number.isNaN(Number(e.amount))
    );
    if (badExtra)
      return { error: "Invalid extras: id, name and positive amount required" }; // [memory:12]

    console.log("===> 3");

    // 1) resident scope
    const { data: residents, error: errRes } = await supabase
      .from("profiles")
      .select("id, role, square_footage")
      .eq("organization_id", profile.organization_id);

    console.log("===> 4");

    if (errRes || !residents?.length)
      return { error: errRes || "No residents found" }; // [memory:12]
    const residentIds = residents.map((r: any) => r.id); // [memory:12]

    // 2) period parsing
    const toMonthIndex = (m: string) => {
      const map: Record<string, number> = {
        jan: 1,
        feb: 2,
        mar: 3,
        apr: 4,
        may: 5,
        jun: 6,
        jul: 7,
        aug: 8,
        sep: 9,
        oct: 10,
        nov: 11,
        dec: 12,
      };
      const lower = m.toLowerCase();
      if (map[lower]) return map[lower];
      const n = Number(m);
      return n >= 1 && n <= 12 ? n : NaN;
    }; // [memory:12]

    const monthIndex = toMonthIndex(currMonth);
    const yearNum = Number(currYear);
    if (Number.isNaN(monthIndex) || Number.isNaN(yearNum)) {
      return { error: "Invalid billMonth or billYear" }; // [memory:12]
    }
    const currMonthStr = String(monthIndex).padStart(2, "0");
    const currYearStr = String(yearNum);
    const periodKey = (y: string, m: string) => `${y}-${m}`; // [memory:12]
    const targetKey = periodKey(currYearStr, currMonthStr); // [memory:12]
    const { year: prevYearStr, month: prevMonthStr } = prevPeriod(
      currYearStr,
      currMonthStr
    ); // [memory:12]

    // 3) prior overdue (read breakdown JSON, not numeric extras)
    const { data: overdueBills, error: errOverdue } = await supabase
      .from("maintenance_bills")
      .select("resident_id, amount, status, bill_month, bill_year, breakdown")
      .in("resident_id", residentIds)
      .eq("status", "overdue");
    if (errOverdue) return { error: errOverdue }; // [memory:12]

    const overdueByResident = new Map<
      string,
      Array<{
        month: string;
        year: string;
        amount: number;
        extras: ExtraItem[];
      }>
    >();

    (overdueBills ?? []).forEach((b: any) => {
      const y = String(b.bill_year ?? "");
      const m = String(b.bill_month ?? "");
      if (!y || !m) return;
      const key = periodKey(y, m);
      if (key >= targetKey) return;
      const amount =
        typeof b.amount === "number" ? b.amount : Number(b.amount) || 0;
      const prevExtrasArr: ExtraItem[] = Array.isArray(b.breakdown?.extras)
        ? b.breakdown.extras
        : [];
      const list = overdueByResident.get(b.resident_id) ?? [];
      list.push({ month: m, year: y, amount, extras: prevExtrasArr });
      overdueByResident.set(b.resident_id, list);
    }); // [memory:12]

    for (const [rid, list] of overdueByResident) {
      list.sort((a, b) => (a.year + a.month).localeCompare(b.year + b.month));
      overdueByResident.set(rid, list);
    } // [memory:12]

    // 4) existing current-period bills
    const { data: existingBills, error: errExisting } = await supabase
      .from("maintenance_bills")
      .select("resident_id")
      .in("resident_id", residentIds)
      .eq("bill_month", currMonthStr)
      .eq("bill_year", currYearStr);
    if (errExisting) return { error: errExisting }; // [memory:12]
    const already = new Set(
      existingBills?.map((b: any) => b.resident_id) ?? []
    ); // [memory:12]

    // 5) last month statuses
    const { data: previousStatuses, error: errPrev } = await supabase
      .from("maintenance_bills")
      .select("resident_id, status")
      .in("resident_id", residentIds)
      .eq("bill_month", prevMonthStr)
      .eq("bill_year", prevYearStr);
    if (errPrev) return { error: errPrev }; // [memory:12]
    const prevStatusByResident = new Map<string, string>(
      (previousStatuses ?? []).map((row: any) => [row.resident_id, row.status])
    ); // [memory:12]

    // 6) compose rows
    const rows = residents
      .filter((r: any) => !already.has(r.id))
      .map((r: any) => {
        const base =
          residentOrganization?.calculate_maintenance_by === "fixed"
            ? r.role == "tenant"
              ? Number(residentOrganization?.tenant_maintenance_amount)
              : Number(residentOrganization?.maintenance_amount)
            : r.role == "tenant"
            ? Number(residentOrganization?.tenant_maintenance_rate) *
              r.square_footage
            : Number(residentOrganization?.maintenance_rate) * r.square_footage;

        // current period extras (array)
        const currentExtras: ExtraItem[] = (
          residentOrganization?.extras ?? []
        ).map((e) => ({
          id: String(e.id),
          name: String(e.name),
          amount: Number(e.amount) || 0,
          month: currMonth,
          year: currYear as string,
        }));

        const extraTotal = currentExtras.reduce(
          (s, e) => s + (e.amount || 0),
          0
        );

        const lastMonthStatus = prevStatusByResident.get(r.id);
        const shouldCarry = lastMonthStatus === "overdue"; // [memory:12]
        const prior = shouldCarry ? overdueByResident.get(r.id) ?? [] : [];

        console.log(prior);

        const dues: DuesLine[] = prior.map((p) => {
          console.log(p);
          const penalty =
            residentOrganization?.calculate_maintenance_by === "fixed"
              ? Number(residentOrganization?.penalty_amount)
              : Number(residentOrganization?.penalty_rate) * r.square_footage;

          // Carry prior extras as arrays; if none recorded previously, carry none
          const previousExtras: ExtraItem[] = Array.isArray(p.extras)
            ? p.extras
            : [];

          const extrasSum = previousExtras.reduce(
            (s, e) => s + (e.amount || 0),
            0
          );
          const subtotal = base + extrasSum + penalty;

          return {
            month: p.month,
            year: p.year,
            status: "overdue",
            amount: base || p.amount,
            extras: previousExtras,
            penalty,
            subtotal,
            note: "Overdue carried because previous month is overdue; fixed penalty applied",
          };
        });

        const duesTotal = dues.reduce((s, d) => s + d.subtotal, 0);
        const total = base + extraTotal + duesTotal;

        const breakdown: BillBreakdown = {
          base,
          extras: currentExtras,
          dues,
          extra_total: extraTotal,
        };

        return {
          resident_id: r.id,
          organization_id: profile.organization_id,
          amount: total,
          due_date: `${currYear}-${currMonth}-${15}`,
          bill_month: currMonthStr,
          bill_year: currYearStr,
          status: "pending",
          penalty: dues.length
            ? residentOrganization?.calculate_maintenance_by === "fixed"
              ? Number(residentOrganization?.penalty_amount)
              : Number(residentOrganization?.penalty_rate) * r.square_footage
            : 0,
          breakdown,
        };
      });

    if (!rows.length) return { data: [], error: null }; // [memory:12]

    const { data, error } = await supabase
      .from("maintenance_bills")
      .upsert(rows, {
        onConflict: "resident_id,bill_month,bill_year",
        ignoreDuplicates: false,
      })
      .select();

    return { data, error };
  };

  async function markAllMaintenancePaid() {
    const payload = {
      status: "paid",
    };

    const { data, error } = await supabase
      .from("maintenance_bills")
      .update(payload) // applies to all rows without filters
      .eq("bill_month", currMonth)
      .select("id, status"); // return affected ids and status

    if (error) throw error;
    return data;
  }

  const fetchMaintenanceBills = async ({
    orgId = profile?.organization_id,
    page = 1,
    pageSize = 10,
    searchQuery = "",
    // sortBy = "created_at",
    // sortOrder = "desc",
    filters = {},
  }: FetchMaintenanceBillsParams = {}): Promise<FetchMaintenanceBillsResponse | null> => {
    try {
      // Calculate offset for pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Build base query with join to get resident details
      let query = supabase.from("maintenance_bills").select(
        `
        *, 
        resident:profiles(
          full_name,
          id,
          unit_number,
          phone
        )        
      `,
        { count: "exact" }
      );

      // Apply organization filter
      if (orgId) {
        query = query.eq("organization_id", orgId);
      }

      // Apply search filter (search in resident details)
      if (searchQuery.trim()) {
        query = query.or(
          `resident.full_name.ilike.%${searchQuery}%,resident.email.ilike.%${searchQuery}%,resident.phone.ilike.%${searchQuery}%,resident.unit_number.ilike.%${searchQuery}%,razorpay_payment_id.ilike.%${searchQuery}%`
        );
      }

      // Apply filters
      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.billMonth) {
        query = query.eq("bill_month", filters.billMonth);
      }

      if (filters.billYear) {
        query = query.eq("bill_year", filters.billYear);
      }

      if (filters.residentId) {
        query = query.eq("resident_id", filters.residentId);
      }

      if (filters.minAmount !== undefined) {
        query = query.gte("amount", filters.minAmount);
      }

      if (filters.maxAmount !== undefined) {
        query = query.lte("amount", filters.maxAmount);
      }

      if (filters.dueDateFrom) {
        query = query.gte("due_date", filters.dueDateFrom);
      }

      if (filters.dueDateTo) {
        query = query.lte("due_date", filters.dueDateTo);
      }

      // Apply sorting
      // query = query.order(sortBy, { ascending: sortOrder === "asc" });

      // Apply pagination
      query = query.range(from, to);

      query = query.order("resident(unit_number)", {
        ascending: true,
      });
      // Execute query
      const { data, error, count } = await query;

      if (error) {
        console.error("Supabase error:", error);
        toast.error("Failed to fetch maintenance bills");
        return null;
      }

      if (!data) {
        toast.error("No data received");
        return null;
      }

      // Calculate pagination info
      const totalItems = count || 0;
      const totalPages = Math.ceil(totalItems / pageSize);
      const currentPage = page;
      const hasNextPage = currentPage < totalPages;
      const hasPrevPage = currentPage > 1;

      const paginationInfo: PaginationInfo = {
        currentPage,
        totalPages,
        totalItems,
        pageSize,
        hasNextPage,
        hasPrevPage,
      };

      setMaintenanceBills(data);

      const response: FetchMaintenanceBillsResponse = {
        data,
        pagination: paginationInfo,
        totalBills: totalItems,
      };

      return response;
    } catch (error) {
      console.error("Fetch maintenance bills error:", error);
      toast.error("Something went wrong while fetching maintenance bills");
      return null;
    }
  };

  return {
    fetchResidents,
    permanentlyDeleteResident,
    createBillsWithPenaltyForAllResidents,
    fetchMaintenanceBills,
    updateMaintenanceStatus,
    markAllMaintenancePaid,
  };
};

export default useAdminService;
