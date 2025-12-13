import toast from "react-hot-toast";
import { supabase } from "../../libs/supabase/supabaseClient";
import { useProfileStore } from "../../libs/stores/useProfileStore";
import { useResidentStore } from "../../libs/stores/useResidentStore";
import type { PaginationInfo } from "../../components/ui/GenericTable";
import type { FetchMaintenanceBillsParams, FetchMaintenanceBillsResponse } from "../../types/maintenance.types";

const useResidentService = () => {
  const { profile } = useProfileStore();
  const { setBills } = useResidentStore();

  const fetchMaintenanceBills = async ({
    residentId = profile?.id,
    page = 1,
    pageSize = 10,
  }: // searchQuery = "",
  // sortBy = "created_at",
  // sortOrder = "desc",
  FetchMaintenanceBillsParams = {}): Promise<FetchMaintenanceBillsResponse | null> => {
    try {
      // Calculate offset for pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Build base query with join to get resident details
      let query = supabase
        .from("maintenance_bills")
        .select(
          `
        *     
      `
        )
        .eq("resident_id", residentId)
        .order("created_at", { ascending: false, nullsFirst: false });

      // Apply pagination
      query = query.range(from, to);

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
        page: currentPage,
        totalPages,
        total: totalItems,
        limit: pageSize,
        hasNextPage,
        hasPreviousPage: hasPrevPage,
      };

      setBills(data);

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

  return { fetchMaintenanceBills };
};

export default useResidentService;
