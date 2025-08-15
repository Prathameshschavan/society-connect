/* eslint-disable @typescript-eslint/no-explicit-any */
import toast from "react-hot-toast";
import {
  useOrganizationStore,
  type Organization,
} from "../../libs/stores/useOrganizationStore";
import { supabase } from "../../libs/supabase/supabaseClient";

interface FetchOrganizationParams {
  orgId?: string;
  page?: number;
  pageSize?: number;
  searchQuery?: string;
  sortBy?: keyof Organization;
  sortOrder?: "asc" | "desc";
  filters?: {
    city?: string;
    minUnits?: number;
    maxUnits?: number;
  };
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface FetchOrganizationResponse {
  data: Organization[];
  pagination: PaginationInfo;
  totalUnitsSum: number;
}

const useOrganizationService = () => {
  const { setOrganizations, setOrganizationsCount, setTotalUnitsCount } =
    useOrganizationStore();

  const fetchOrganization = async ({
    orgId,
    page = 1,
    pageSize = 10,
    searchQuery = "",
    sortBy = "created_at",
    sortOrder = "desc",
    filters = {},
  }: FetchOrganizationParams = {}): Promise<FetchOrganizationResponse | null> => {
    console.log("Fetching organizations with params:", {
      orgId,
      page,
      pageSize,
      searchQuery,
      sortBy,
      sortOrder,
      filters,
    });

    try {
      // Calculate offset for pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Build base query
      let query = supabase.from("organizations").select(
        `
        *, 
        admin:profiles(
          full_name,
          phone
        )        
      `,
        { count: "exact" }
      );

      // Apply search filter - FIXED VERSION
      if (searchQuery.trim()) {
        query = query.or(
          `name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`
        );
      }

      // Apply filters
      if (filters.city) {
        query = query.eq("city", filters.city);
      }

      if (filters.minUnits !== undefined) {
        query = query.gte("total_units", filters.minUnits);
      }

      if (filters.maxUnits !== undefined) {
        query = query.lte("total_units", filters.maxUnits);
      }

      // Apply specific org filter if provided
      if (orgId) {
        query = query.eq("id", orgId);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === "asc" });

      // Apply pagination
      query = query.range(from, to);

      // Execute query
      const { data, error, count } = await query;

      if (error) {
        console.error("Supabase error:", error);
        toast.error("Failed to fetch societies");
        return null;
      }

      if (!data) {
        toast.error("No data received");
        return null;
      }

      // Get total units sum for all organizations (not just current page)
      const { data: allOrgsData } = await supabase
        .from("organizations")
        .select("total_units");

      const totalUnitsSum =
        allOrgsData?.reduce((sum, org) => sum + (org.total_units || 0), 0) || 0;

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
      setOrganizationsCount(totalItems);
      setTotalUnitsCount(totalUnitsSum);
      setOrganizations(data as never);

      const response: FetchOrganizationResponse = {
        data: data as Organization[],
        pagination: paginationInfo,
        totalUnitsSum,
      };

      console.log(
        `Fetched ${data.length} organizations (page ${currentPage}/${totalPages})`
      );
      return response;
    } catch (error) {
      console.error("Fetch organizations error:", error);
      toast.error("Something went wrong while fetching societies");
      return null;
    }
  };

  // Helper function for search with debouncing
  const searchOrganizations = async (
    searchQuery: string,
    options: Omit<FetchOrganizationParams, "searchQuery"> = {}
  ) => {
    return fetchOrganization({
      ...options,
      searchQuery,
      page: 1, // Reset to first page on search
    });
  };

  // Helper function for sorting
  const sortOrganizations = async (
    sortBy: keyof Organization,
    sortOrder: "asc" | "desc" = "asc",
    options: Omit<FetchOrganizationParams, "sortBy" | "sortOrder"> = {}
  ) => {
    return fetchOrganization({
      ...options,
      sortBy,
      sortOrder,
      page: 1, // Reset to first page on sort
    });
  };

  // Helper function for filtering
  const filterOrganizations = async (
    filters: FetchOrganizationParams["filters"],
    options: Omit<FetchOrganizationParams, "filters"> = {}
  ) => {
    return fetchOrganization({
      ...options,
      filters,
      page: 1, // Reset to first page on filter
    });
  };

  // Get next page
  const getNextPage = async (
    currentPage: number,
    options: FetchOrganizationParams = {}
  ) => {
    return fetchOrganization({
      ...options,
      page: currentPage + 1,
    });
  };

  // Get previous page
  const getPreviousPage = async (
    currentPage: number,
    options: FetchOrganizationParams = {}
  ) => {
    return fetchOrganization({
      ...options,
      page: Math.max(1, currentPage - 1),
    });
  };

  return {
    fetchOrganization,
    searchOrganizations,
    sortOrganizations,
    filterOrganizations,
    getNextPage,
    getPreviousPage,
  };
};

export default useOrganizationService;
