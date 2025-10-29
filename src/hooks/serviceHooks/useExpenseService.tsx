import toast from "react-hot-toast";
import type { PaginationInfo } from "../../components/ui/GenericTable";
import { useOrganizationStore } from "../../libs/stores/useOrganizationStore";
import {
  useReportStore,
  type Expense,
  type ExpenseFormValues,
} from "../../libs/stores/useReportStore";
import { supabase } from "../../libs/supabase/supabaseClient";
import { getMonthAndYearFromDate } from "../../utility/dateTimeServices";
import imageCompression from "browser-image-compression";

export type ExpenseSortByOptions =
  | "date"
  | "amount"
  | "description"
  | "receiver_name"
  | "created_at"
  | "name";

interface FetchExpensesParams {
  orgId?: string;
  page?: number;
  pageSize?: number;
  searchQuery?: string;
  sortBy?: ExpenseSortByOptions;
  sortOrder?: "asc" | "desc";
  filters?: {
    month?: string;
    year?: string;
    minAmount?: number;
    maxAmount?: number;
    status?: string;
    receiver_name?: string;
  };
}

interface FetchExpensesResponse {
  data: Expense[];
  pagination: PaginationInfo;
  totalExpenses: number;
}

const useExpenseService = () => {
  const { residentOrganization } = useOrganizationStore();
  const { setExpenses } = useReportStore();

  async function updateExpense(id: string, data: Partial<ExpenseFormValues>) {
    const payload: Partial<Expense> = {};

    if (data.name) payload.name = data.name.trim();
    if (data.description !== null)
      payload.description = data.description?.trim() || null;
    if (data.image_url !== null) payload.image_url = data.image_url;
    if (data.receiver_name) payload.receiver_name = data.receiver_name.trim();
    if (data.amount) payload.amount = Number(data.amount);
    if (data.status) payload.status = data.status;
    if (data.date) {
      const { month, year } = getMonthAndYearFromDate(data.date);
      payload.date = data.date;
      payload.month = month;
      payload.year = year;
    }

    const { error } = await supabase
      .from("expenses")
      .update(payload)
      .eq("id", id);

    if (error) throw error;
  }

  // Upload expense image
  async function uploadExpenseImage(
    file: File,
    expenseId: string
  ): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${residentOrganization?.id}/${
      file.name
    }_${expenseId}_${Date.now()}.${fileExt}`;

    const defaultOptions = {
      maxSizeMB: 1, // Maximum file size in MB
      maxWidthOrHeight: 1920, // Maximum width or height
      useWebWorker: true, // Use web worker for better performance
      fileType: "image/jpeg", // Convert to JPEG for better compression
      initialQuality: 0.8, // Initial quality (0-1)
    };

    const compressedFile = await imageCompression(file, defaultOptions); // Assume compression is done here if needed

    const { error } = await supabase.storage
      .from("organization documents")
      .upload(fileName, compressedFile);

    console.log(error);

    if (error) throw error;

    return fileName;
  }

  // Get expense image URL
  async function getExpenseImageUrl(path: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from("organization documents")
      .createSignedUrl(path, 3600); // URL valid for 1 hour (3600 seconds)

    if (error) {
      console.error("Error creating signed URL:", error);
      return "";
    }

    return data.signedUrl;
  }

  async function addExpense(data: ExpenseFormValues) {
    const { month, year } = getMonthAndYearFromDate(data.date);

    // Optional: coerce and guard values
    const payload = {
      name: data.name.trim(),
      description: data.description?.trim() || null,
      image_url: data.image_url || null,
      receiver_name: data.receiver_name.trim(),
      amount: Number(data.amount),
      month,
      year,
      organization_id: residentOrganization?.id,
      date: data.date,
      status: data.status || "unpaid",
      created_by: (await supabase.auth.getUser()).data.user?.id,
    };

    const { data: insertedData, error } = await supabase
      .from("expenses")
      .insert(payload)
      .select("id")
      .single();

    if (error) throw error;

    return insertedData?.id; // Return the ID for potential image upload
  }

  const fetchExpenses = async ({
    orgId,
    page = 1,
    pageSize = 10,
    searchQuery = "",
    sortBy = "date",
    sortOrder = "desc",
    filters = {},
  }: FetchExpensesParams = {}): Promise<FetchExpensesResponse | null> => {
    try {
      // Call the edge function
      const { data, error } = await supabase.functions.invoke("fetchExpense", {
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

      // Enhanced error handling
      if (error) {
        console.error("Edge function error:", error);
        toast.error("Failed to fetch expenses");
        return null;
      }

      // Type the response and update store
      const response = data as FetchExpensesResponse;

      setExpenses(response.data);

      return response;
    } catch (error) {
      console.error("Fetch expenses error:", error);
      toast.error("Something went wrong while fetching expenses");
      return null;
    }
  };

  async function deleteExpense(id: string) {
    const { error } = await supabase.from("expenses").delete().eq("id", id);

    if (error) throw error;
  }

  return {
    addExpense,
    uploadExpenseImage,
    getExpenseImageUrl,
    updateExpense,
    fetchExpenses,
    deleteExpense,
  };
};

export default useExpenseService;
