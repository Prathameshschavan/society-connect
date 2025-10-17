import toast from "react-hot-toast";
import type { IncomeFormValues } from "../../components/Modals/AddIncomeModal";
import { supabase } from "../../libs/supabase/supabaseClient";
import { useReportStore } from "../../libs/stores/useReportStore";
import { getMonthAndYearFromDate } from "../../utility/dateTimeServices";
import { useOrganizationStore } from "../../libs/stores/useOrganizationStore";

type FetchIncomesParams = {
  orgId?: string | null;
  page?: number; // default 1
  pageSize?: number; // default 10
  searchQuery?: string; // matches name/description
  filters?: {
    month?: string; // 1-12
    year?: string; // e.g., 2025
    minAmount?: number;
    maxAmount?: number;
  };
  // sortBy?: "created_at" | "amount" | "name" | "year" | "month";
  // sortOrder?: "asc" | "desc";
};

type PaginationInfo = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type IncomeRow = {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  amount: number;
  month: number;
  year: number;
  date: string;
  created_at: string;
  created_by: string | null;
};

type FetchIncomesResponse = {
  data: IncomeRow[];
  pagination: PaginationInfo;
  totalIncomes: number;
};

const useIncomeService = () => {
  const { setIncomes } = useReportStore();
  const { residentOrganization  } = useOrganizationStore();

  async function addIncome(data: IncomeFormValues) {
    const { month, year } = getMonthAndYearFromDate(data.date);
    // Optional: coerce and guard values
    const payload = {
      name: data.name.trim(),
      description: data.description?.trim() || null,
      amount: Number(data.amount),
      month,
      year,
      organization_id: residentOrganization?.id,
      date: data?.date,
    };
    const { error } = await supabase.from("income").insert(payload);
    if (error) throw error;
  }

  async function updateIncome(id: string, data: IncomeFormValues) {
    const { month, year } = getMonthAndYearFromDate(data.date);
    // Optional: coerce and guard values
    const payload = {
      name: data.name.trim(),
      description: data.description?.trim() || null,
      amount: Number(data.amount),
      month,
      year,
      organization_id: residentOrganization?.id,
      date: data?.date,
    };

    const { error } = await supabase
      .from("income")
      .update(payload)
      .eq("id", id);

    if (error) throw error;
  }

  const fetchIncomes = async ({
    orgId,
    page = 1,
    pageSize = 10,
    searchQuery = "",
    // sortBy = "created_at",
    // sortOrder = "desc",
    filters = {},
  }: FetchIncomesParams = {}): Promise<FetchIncomesResponse | null> => {
    try {
      // Calculate offset window
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Base select (expand if you decide to join created_by -> profiles)
      let query = supabase.from("income").select(
        `
        id,
        organization_id,
        name,
        description,
        amount,
        month,
        year,
        date,
        created_at,
        created_by
      `,
        { count: "exact" }
      );

      // Organization scope
      if (orgId) {
        query = query.eq("organization_id", orgId);
      }

      // Search by name/description
      if (searchQuery.trim()) {
        const s = `%${searchQuery.trim()}%`;
        query = query.or(`name.ilike.${s},description.ilike.${s}`);
      }

      // Filters
      if (filters.month !== undefined) {
        query = query.eq("month", filters.month);
      }
      if (filters.year !== undefined) {
        query = query.eq("year", filters.year);
      }
      if (filters.minAmount !== undefined) {
        query = query.gte("amount", filters.minAmount);
      }
      if (filters.maxAmount !== undefined) {
        query = query.lte("amount", filters.maxAmount);
      }

      // Sorting (uncomment if you want dynamic sort)
      // query = query.order(sortBy, { ascending: sortOrder === "asc", nullsFirst: sortOrder === "asc" });

      // Default stable sort: newest first, then id for tie-break
      query = query
        .order("created_at", { ascending: false })
        .order("id", { ascending: false });

      // Pagination window
      query = query.range(from, to);

      // Execute
      const { data, error, count } = await query;

      if (error) {
        console.error("Supabase error:", error);
        toast.error("Failed to fetch incomes");
        return null;
      }

      if (!data) {
        toast.error("No data received");
        return null;
      }

      setIncomes(data);

      // Pagination info
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

      const response: FetchIncomesResponse = {
        data: data as IncomeRow[],
        pagination: paginationInfo,
        totalIncomes: totalItems,
      };

      return response;
    } catch (error) {
      console.error("Fetch incomes error:", error);
      toast.error("Something went wrong while fetching incomes");
      return null;
    }
  };

  async function deleteIncome(id: string) {
    const { error } = await supabase.from("income").delete().eq("id", id);

    if (error) throw error;
  }

  return { addIncome, fetchIncomes, updateIncome, deleteIncome };
};

export default useIncomeService;
