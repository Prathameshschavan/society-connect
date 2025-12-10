import toast from "react-hot-toast";
import type { IncomeFormValues } from "../../libs/stores/useReportStore";
import { supabase } from "../../libs/supabase/supabaseClient";
import { useReportStore } from "../../libs/stores/useReportStore";
import { getMonthAndYearFromDate } from "../../utility/dateTimeServices";
import { useProfileStore } from "../../libs/stores/useProfileStore";

export type IncomeSortByOptions =
  | "date"
  | "amount"
  | "description"
  | "created_at"
  | "name";

interface FetchIncomesParams {
  orgId?: string;
  page?: number;
  pageSize?: number;
  searchQuery?: string;
  sortBy?: IncomeSortByOptions;
  sortOrder?: "asc" | "desc";
  filters?: {
    month?: string;
    year?: string;
    incomeType?: string;
    minAmount?: number;
    maxAmount?: number;
  };
}

interface FetchIncomesResponse {
  data: IncomeRow[];
  pagination: PaginationInfo;
  totalIncomes: number;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

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

const useIncomeService = () => {
  const { setIncomes } = useReportStore();
  const { profile } = useProfileStore();

  async function addIncome(data: IncomeFormValues) {
    const { month, year } = getMonthAndYearFromDate(data.date);
    // Optional: coerce and guard values
    const payload = {
      name: data.name.trim(),
      description: data.description?.trim() || null,
      amount: Number(data.amount),
      month,
      year,
      organization_id: profile?.organization?.id,
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
      organization_id: profile?.organization?.id,
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
    sortBy = "date", // Default sort by date
    sortOrder = "desc", // Default descending order
    filters = {},
  }: FetchIncomesParams = {}): Promise<FetchIncomesResponse | null> => {
    try {
      const { data, error } = await supabase.functions.invoke("fetchIncome", {
        body: {
          orgId,
          page,
          pageSize,
          searchQuery,
          sortBy,
          sortOrder,
          filters,
        },
      });

      // Better error handling [web:117]
      if (error) {
        console.error("Edge function error:", error);
        toast.error("Failed to fetch incomes");
        return null;
      }

      // Type the response and update store
      const response = data as FetchIncomesResponse;

      setIncomes(response.data); // Don't forget to update the store!

      return response; // Return the full response with pagination
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
