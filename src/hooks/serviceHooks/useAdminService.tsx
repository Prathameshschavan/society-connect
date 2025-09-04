/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMaintenanceStore } from "../../libs/stores/useMaintenanceStore";
import { useProfileStore } from "../../libs/stores/useProfileStore";
import { supabase } from "../../libs/supabase/supabaseClient";
import toast from "react-hot-toast";

type CreateBillsArgs = {
  maintenanceFixedAmount: number;
  billMonth: string; // accepts "03" or "3" or "Mar"
  billYear: string; // "2025"
  dueDate: string; // "YYYY-MM-DD"
  penaltyFixedAmount: number; // fixed penalty applied per overdue month carried
  extraCharges?: number; // current period extra, default 0
};

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


  const createBillsWithPenaltyForAllResidents = async ({
    billMonth,
    billYear,
    dueDate,
    maintenanceFixedAmount,
    penaltyFixedAmount,
    extraCharges = 0,
  }: CreateBillsArgs) => {
    // Guards
    if (!profile?.organization_id)
      return { error: "Missing organization context" }; // org context required [1]
    if (Number.isNaN(Number(maintenanceFixedAmount)))
      return { error: "maintenanceFixedAmount must be a number" }; // numeric guard [1]
    if (Number.isNaN(Number(penaltyFixedAmount)))
      return { error: "penaltyFixedAmount must be a number" }; // numeric guard [1]
    if (Number.isNaN(Number(extraCharges)))
      return { error: "extraCharges must be a number" }; // numeric guard [1]

    // 1) Residents in org
    const { data: residents, error: errRes } = await supabase
      .from("profiles")
      .select("id")
      .eq("organization_id", profile.organization_id); // fetch resident ids [3]
    if (errRes || !residents?.length)
      return { error: errRes || "No residents found" }; // handle no residents [3]
    const residentIds = residents.map((r) => r.id); // collect ids [3]

    // 2) Normalize month/year to zero-padded strings
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
    }; // support "03", "3", or "Mar" [2]
    const monthIndex = toMonthIndex(billMonth); // parse month [2]
    const yearNum = Number(billYear); // parse year [2]
    if (Number.isNaN(monthIndex) || Number.isNaN(yearNum)) {
      return { error: "Invalid billMonth or billYear" }; // validate period [2]
    }
    const currMonthStr = String(monthIndex).padStart(2, "0"); // "01".."12" [2]
    const currYearStr = String(yearNum); // "YYYY" [2]

    // Period key for comparison (YYYY-MM)
    const periodKey = (y: string, m: string) => `${y}-${m}`; // lexicographic key [1]
    const targetKey = periodKey(currYearStr, currMonthStr); // target period key [1]

    // 3) Load all overdue bills strictly before the target period (one row = one dues line)
    const { data: overdueBills, error: errOverdue } = await supabase
      .from("maintenance_bills")
      .select("resident_id, amount, extra, status, bill_month, bill_year")
      .in("resident_id", residentIds)
      .eq("status", "overdue")
      // .eq("bill_month", String(Number(currMonthStr) - 1).padStart(2, "0")) // only prior overdue carried [3]
      // .eq("bill_year", currYearStr); // only prior overdue carried [3]
    if (errOverdue) return { error: errOverdue }; // propagate error [3]

    // Group prior overdue rows per resident without cross-month accumulation
    const overdueByResident = new Map<
      string,
      Array<{ month: string; year: string; amount: number; extra: number }>
    >(); // resident → list of prior months [1]
    overdueBills?.forEach((b) => {
      const y = String(b.bill_year ?? ""); // ensure string [1]
      const m = String(b.bill_month ?? ""); // ensure string [1]
      if (!y || !m) return; // skip malformed [1]
      const key = periodKey(y, m); // month key [1]
      if (key >= targetKey) return; // only strictly before current period [1]
      const amount =
        typeof b.amount === "number" ? b.amount : Number(b.amount) || 0; // normalize [1]
      const prevExtra =
        typeof b.extra === "number" ? b.extra : Number(b.extra) || 0; // normalize [1]
      const list = overdueByResident.get(b.resident_id) ?? []; // list [1]
      list.push({ month: m, year: y, amount, extra: prevExtra }); // push per month [1]
      overdueByResident.set(b.resident_id, list); // save [1]
    }); // end mapping [1]

    // Optional: sort dues oldest-first for readability
    for (const [rid, list] of overdueByResident) {
      list.sort((a, b) => (a.year + a.month).localeCompare(b.year + b.month)); // ascending [1]
      overdueByResident.set(rid, list); // save sorted [1]
    }

    // 4) Avoid duplicates for the target period
    const { data: existingBills, error: errExisting } = await supabase
      .from("maintenance_bills")
      .select("resident_id")
      .in("resident_id", residentIds)
      .eq("bill_month", currMonthStr)
      .eq("bill_year", currYearStr); // existing current-period bills [3]
    if (errExisting) return { error: errExisting }; // propagate error [3]
    const already = new Set(existingBills?.map((b) => b.resident_id) ?? []); // resident ids [3]

    // 5) Compose bills with multi-month dues and per-month penalty, then upsert
    const rows = residents
      .filter((r) => !already.has(r.id)) // skip if already billed [3]
      .map((r) => {
        const base = Number(maintenanceFixedAmount); // current base [1]
        const extra = Number(extraCharges); // current extra [1]
        const prior = overdueByResident.get(r.id) ?? []; // all prior months [1]

        // Build dues lines with month’s own base and extra, plus fixed penalty
        const dues: DuesLine[] = prior.map((p) => {
          const penalty = Number(penaltyFixedAmount); // per-month penalty [1]
          const subtotal = maintenanceFixedAmount + extraCharges + penalty; // per-line subtotal [1]
          return {
            month: p.month,
            year: p.year,
            status: "overdue",
            amount: maintenanceFixedAmount || p.amount, // month’s base only [1]
            previousExtra: extraCharges || p.extra, // month’s extra only [1]
            penalty, // per-month penalty [1]
            subtotal, // additive per month [1]
            note: "Overdue carried with fixed penalty and its original extra", // explanation [5]
          };
        }); // end dues [1]

        const duesTotal = dues.reduce((s, d) => s + d.subtotal, 0); // sum dues [1]
        const total = base + extra + duesTotal; // final amount [5]
        const breakdown: BillBreakdown = { base, extra, dues }; // persisted JSON [1]

        return {
          resident_id: r.id,
          organization_id: profile.organization_id,
          amount: total, // transparent sum of parts [5]
          due_date: dueDate,
          bill_month: currMonthStr,
          bill_year: currYearStr,
          status: "pending",
          extra, // store current period extra [1]
          penalty: dues.length ? Number(penaltyFixedAmount) : 0, // optional top-level reference [5]
          breakdown, // JSONB line items [1]
        };
      }); // end map [1]

    if (!rows.length) return { data: [], error: null }; // nothing to insert [4]

    const { data, error } = await supabase
      .from("maintenance_bills")
      .upsert(rows, {
        onConflict: "resident_id,bill_month,bill_year",
        ignoreDuplicates: false,
      })
      .select(); // requires unique (resident_id,bill_month,bill_year) [4]

    return { data, error }; // return result [4]
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
