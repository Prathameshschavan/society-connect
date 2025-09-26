/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMaintenanceStore } from "../../libs/stores/useMaintenanceStore";
import { useProfileStore } from "../../libs/stores/useProfileStore";
import { supabase } from "../../libs/supabase/supabaseClient";
import toast from "react-hot-toast";

export type DuesLine = {
  month: string; // "01".."12"
  year: string; // "YYYY"
  status: "overdue";
  amount: number; // that month’s base (from prior bill.amount)
  previousExtra: number; // that month’s extra (from prior bill.extra)
  penalty: number; // fixed penalty applied per overdue month
  subtotal: number; // amount + previousExtra + penalty
  note?: string;
};

export type BillBreakdown = {
  base: number; // current period base (maintenanceFixedAmount)
  extra: number; // current period extraCharges
  dues: DuesLine[]; // multiple months supported
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

interface FetchMaintenanceBillsParams {
  orgId?: string;
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

interface FetchMaintenanceBillsResponse {
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

  type DuesLine = {
    month: string;
    year: string;
    status: "overdue";
    amount: number;
    previousExtra: number;
    penalty: number;
    subtotal: number;
    note: string;
  };

  type BillBreakdown = {
    base: number;
    extra: number;
    dues: DuesLine[];
  };

  type CreateBillsArgs = {
    billMonth: string;
    billYear: string | number;
    dueDate: string; // ISO date
    maintenanceFixedAmount: number;
    penaltyFixedAmount: number;
    tenantMaintenanceFixedAmount: number;
    tenantPenaltyFixedAmount: number;
    extraCharges?: number;
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

  const createBillsWithPenaltyForAllResidents = async ({
    billMonth,
    billYear,
    dueDate,
    maintenanceFixedAmount,
    penaltyFixedAmount,
    tenantMaintenanceFixedAmount,
    tenantPenaltyFixedAmount,
    extraCharges = 0,
  }: CreateBillsArgs) => {

    console.log(tenantMaintenanceFixedAmount, tenantPenaltyFixedAmount)
    if (!profile?.organization_id)
      return { error: "Missing organization context" }; // [6]
    if (Number.isNaN(Number(maintenanceFixedAmount)))
      return { error: "maintenanceFixedAmount must be a number" }; // [2]
    if (Number.isNaN(Number(penaltyFixedAmount)))
      return { error: "penaltyFixedAmount must be a number" }; // [2]

    const { data: residents, error: errRes } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("organization_id", profile.organization_id);
    if (errRes || !residents?.length)
      return { error: errRes || "No residents found" }; // [6]
    const residentIds = residents.map((r) => r.id); // [6]

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
    }; // [2]

    const monthIndex = toMonthIndex(String(billMonth));
    const yearNum = Number(billYear);
    if (Number.isNaN(monthIndex) || Number.isNaN(yearNum)) {
      return { error: "Invalid billMonth or billYear" }; // [2]
    }
    const currMonthStr = String(monthIndex).padStart(2, "0");
    const currYearStr = String(yearNum);

    const periodKey = (y: string, m: string) => `${y}-${m}`; // [6]
    const targetKey = periodKey(currYearStr, currMonthStr); // [6]
    const { year: prevYearStr, month: prevMonthStr } = prevPeriod(
      currYearStr,
      currMonthStr
    ); // [2]

    // 1) Pull ALL prior overdue bills but we’ll conditionally include later. [6]
    const { data: overdueBills, error: errOverdue } = await supabase
      .from("maintenance_bills")
      .select("resident_id, amount, extra, status, bill_month, bill_year")
      .in("resident_id", residentIds)
      .eq("status", "overdue");
    if (errOverdue) return { error: errOverdue }; // [6]

    // 2) Build map of prior-overdue by resident strictly before target period. [6]
    const overdueByResident = new Map<
      string,
      Array<{ month: string; year: string; amount: number; extra: number }>
    >();

    overdueBills?.forEach((b) => {
      const y = String(b.bill_year ?? "");
      const m = String(b.bill_month ?? "");
      if (!y || !m) return;
      const key = periodKey(y, m);
      if (key >= targetKey) return; // only strictly before current period [6]
      const amount =
        typeof b.amount === "number" ? b.amount : Number(b.amount) || 0;
      const prevExtra =
        typeof b.extra === "number" ? b.extra : Number(b.extra) || 0;
      const list = overdueByResident.get(b.resident_id) ?? [];
      list.push({ month: m, year: y, amount, extra: prevExtra });
      overdueByResident.set(b.resident_id, list);
    }); // [6]

    for (const [rid, list] of overdueByResident) {
      list.sort((a, b) => (a.year + a.month).localeCompare(b.year + b.month)); // [2]
      overdueByResident.set(rid, list);
    }

    // 3) Detect existing current-period bills to avoid duplicates. [6]
    const { data: existingBills, error: errExisting } = await supabase
      .from("maintenance_bills")
      .select("resident_id")
      .in("resident_id", residentIds)
      .eq("bill_month", currMonthStr)
      .eq("bill_year", currYearStr);
    if (errExisting) return { error: errExisting }; // [6]
    const already = new Set(existingBills?.map((b) => b.resident_id) ?? []); // [6]

    // 4) Fetch latest prior bill status per resident (only previous period). [6]
    const { data: previousStatuses, error: errPrev } = await supabase
      .from("maintenance_bills")
      .select("resident_id, status")
      .in("resident_id", residentIds)
      .eq("bill_month", prevMonthStr)
      .eq("bill_year", prevYearStr);

    if (errPrev) return { error: errPrev }; // [6]
    const prevStatusByResident = new Map<string, string>(
      (previousStatuses ?? []).map((row) => [row.resident_id, row.status])
    ); // [6]

    // 5) Compose rows with conditional carryover: only if last month is overdue. [6]
    const rows = residents
      .filter((r) => !already.has(r.id))
      .map((r) => {
        const base =
          r.role == "tenant"
            ? Number(tenantMaintenanceFixedAmount)
            : Number(maintenanceFixedAmount);
        const extra = Number(extraCharges);

        const lastMonthStatus = prevStatusByResident.get(r.id);
        const shouldCarry = lastMonthStatus === "overdue"; // ONLY carry when immediate last is overdue [6]

        const prior = shouldCarry ? overdueByResident.get(r.id) ?? [] : [];

        const dues: DuesLine[] = prior.map((p) => {
          const penalty =
            r.role == "tenant"
              ? Number(tenantPenaltyFixedAmount)
              : Number(penaltyFixedAmount);
          const subtotal = base + extra + penalty; // one line subtotal for that overdue month [2]
          return {
            month: p.month,
            year: p.year,
            status: "overdue",
            amount: base || p.amount, // keep consistent base policy [2]
            previousExtra: extra || p.extra, // keep consistent extra policy [2]
            penalty,
            subtotal,
            note: "Overdue carried because previous month is overdue; fixed penalty applied", // [6]
          };
        });

        const duesTotal = dues.reduce((s, d) => s + d.subtotal, 0); // explicit initial value [1][2]
        const total = base + extra + duesTotal; // [2]
        const breakdown: BillBreakdown = { base, extra, dues }; // [6]

        return {
          resident_id: r.id,
          organization_id: profile.organization_id,
          amount: total,
          due_date: dueDate,
          bill_month: currMonthStr,
          bill_year: currYearStr,
          status: "pending",
          extra,
          penalty: dues.length ? Number(penaltyFixedAmount) : 0,
          breakdown,
        };
      });

    if (!rows.length) return { data: [], error: null }; // [6]

    const { data, error } = await supabase
      .from("maintenance_bills")
      .upsert(rows, {
        onConflict: "resident_id,bill_month,bill_year",
        ignoreDuplicates: false,
      })
      .select(); // requires unique composite key [6][15]

    return { data, error };
  };

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
  };
};

export default useAdminService;
