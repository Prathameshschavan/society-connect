/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMaintenanceStore } from "../../libs/stores/useMaintenanceStore";
import { useProfileStore } from "../../libs/stores/useProfileStore";
import { supabase } from "../../libs/supabase/supabaseClient";
import toast from "react-hot-toast";

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
    dueDate,
    billYear,
    maintenanceFixedAmount,
    // penaltyFixedAmount,
    extraCharges = 0,
  }: {
    maintenanceFixedAmount: number;
    billMonth: string;
    billYear: string;
    dueDate: string;
    penaltyFixedAmount: number;
    extraCharges?: number;
  }) => {
    // 1. Fetch all residents
    const { data: residents, error: errRes } = await supabase
      .from("profiles")
      .select("id")
      .eq("organization_id", profile?.organization_id);

    if (errRes || !residents) {
      return { error: errRes || "No residents found" };
    }

    // 2. Fetch previous unpaid bills for these residents
    const residentIds =  residents.map((r) => r.id);
    const { data: unpaidBills, error: errBills } = await supabase
      .from("maintenance_bills")
      .select("resident_id, amount")
      .in("resident_id", residentIds)
      .neq("status", "paid");

    if (errBills) return { error: errBills };

    // 3. Map unpaid bills by resident
    const unpaidMap: Record<string, number> = {};
    unpaidBills?.forEach((bill) => {
      if (!unpaidMap[bill.resident_id]) unpaidMap[bill.resident_id] = 0;
      unpaidMap[bill.resident_id] += bill.amount;
    });

    // 4. Create bills with penalty
    const bills = residents.map((resident) => {
      const previousDue = unpaidMap[resident.id] || 0;
      const currentBill = maintenanceFixedAmount + extraCharges;
      const totalAmount = currentBill + previousDue;

      return {
        resident_id: resident.id,
        organization_id: profile?.organization_id,
        amount: totalAmount,
        due_date: dueDate,
        bill_month: billMonth,
        bill_year: billYear,
        status: "pending",
      };
    });

    // 5. Bulk insert all bills
    const { data, error } = await supabase
      .from("maintenance_bills")
      .insert(bills);

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
