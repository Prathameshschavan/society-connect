/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState, useCallback } from "react";
import {
  Edit,
  Eye,
  ReceiptText,
  Search,
  SortAsc,
  SortDesc,
} from "lucide-react";

import TopNav from "./TopNav";
import OnboardResidentModal from "./Modals/OnboardResidentModal";
import ViewMaintananceDetailsModal from "./Modals/ViewMaintananceDetailsModal";
import UpdateMaintananceStatusModal from "./Modals/UpdateMaintananceStatusModal";

import GenericTable, { type TableAction } from "./ui/GenericTable";

import useAdminService from "../hooks/serviceHooks/useAdminService";
import usePaginationService from "../hooks/serviceHooks/usePaginationService";

import { useOrganizationStore } from "../libs/stores/useOrganizationStore";
import {
  useMaintenanceStore,
  type MaintenanceBill,
} from "../libs/stores/useMaintenanceStore";
import { useProfileStore } from "../libs/stores/useProfileStore";

import { currMonth, currYear, shortMonth } from "../utility/dateTimeServices";
import { columns } from "../config/tableConfig/adminDashboard";
import { GenericSelect, type OptionValue } from "./ui/GenericSelect";

// Custom hook for debounced search [web:45]
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Sort options for the dropdown
const sortOptions = [
  { label: "Unit Number", value: "unit_number" },
  { label: "Resident Name", value: "resident_name" },
  { label: "Year", value: "year" },
  { label: "Month", value: "month" },
  { label: "Amount", value: "amount" },
  { label: "Due Date", value: "due_date" },
  { label: "Created Date", value: "created_at" },
];

// Filter interface
interface FilterState {
  billMonth?: string;
  billYear?: string;
  unitNumber?: string;
  status?: string;
}

// Sort interface
interface SortState {
  sortBy: string;
  sortOrder: "asc" | "desc";
}


const AdminDashboard = () => {
  // Services
  const { createBillsWithPenaltyForAllResidents, fetchMaintenanceBills } =
    useAdminService();
  const {
    currentPage,
    pageSize,
    setPagination,
    pagination,
    setCurrentPage,
    handlePageChange,
    handlePageSizeChange,
  } = usePaginationService();

  // Stores
  const { profile, residents } = useProfileStore();
  const { residentOrganization } = useOrganizationStore();
  const { maintenanceBills } = useMaintenanceStore();

  // Modal states
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [isOpenMaintananceDetailsModal, setIsOpenMaintananceDetailsModal] =
    useState(false);
  const [
    isOpenUpdateMaintananceDetailsModal,
    setIsOpenUpdateMaintananceDetailsModal,
  ] = useState(false);
  const [selectedBill, setSelectedBill] = useState<MaintenanceBill | null>(
    null
  );

  // New filter states [web:46]
  const [filters, setFilters] = useState<FilterState>({
    billMonth: currMonth,
    billYear: currYear,
  });

  // Search state with debounce [web:45]
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Sort state [web:47]
  const [sortState, setSortState] = useState<SortState>({
    sortBy: "unit_number",
    sortOrder: "asc",
  });

  // Loading states
  const [loading, setLoading] = useState(false);
  const [generateBillLoading, setGenerateBillLoading] = useState(false);

  /**
   * Load data with all filters, search, and sorting applied
   */
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchMaintenanceBills({
        page: currentPage,
        pageSize: pageSize,
        searchQuery: debouncedSearchQuery,
        sortBy: sortState.sortBy as any,
        sortOrder: sortState.sortOrder,
        filters: {
          ...filters,
          billMonth: filters.billMonth as string,
          billYear: filters.billYear as string,
        },
      });

      if (result) {
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    pageSize,
    debouncedSearchQuery,
    sortState,
    filters,
    fetchMaintenanceBills,
    setPagination,
  ]);

  // Load data when dependencies change
  useEffect(() => {
    loadData();
  }, [currentPage, pageSize, filters, sortState, debouncedSearchQuery]);

  /**
   * Handle filter changes
   */
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setCurrentPage(1); // Reset to first page
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined, // Remove empty values
    }));
  };

  /**
   * Handle sort changes [web:47]
   */
  const handleSortChange = (field: string) => {
    setSortState((prev) => ({
      sortBy: field,
      sortOrder:
        prev.sortBy === field && prev.sortOrder === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  /**
   * Reset all filters
   */
  const resetFilters = () => {
    setFilters({
      billMonth: currMonth,
      billYear: currYear,
    });
    setSearchQuery("");
    setSortState({
      sortBy: "unit_number",
      sortOrder: "asc",
    });
    setCurrentPage(1);
  };

  /**
   * Handle bill generation
   */
  const handleCreateBill = async () => {
    try {
      setGenerateBillLoading(true);
      await createBillsWithPenaltyForAllResidents();
      await loadData();
    } catch (error) {
      console.log(error);
    } finally {
      setGenerateBillLoading(false);
    }
  };

  // Row actions
  const actions: TableAction<MaintenanceBill>[] = [
    {
      icon: <Eye className="w-4 h-4" />,
      onClick: (bill: MaintenanceBill) => {
        setSelectedBill(bill);
        setIsOpenMaintananceDetailsModal(true);
      },
      className:
        "cursor-pointer p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors",
      label: "View",
    },
    ...(filters.billMonth === currMonth && filters.billYear === currYear
      ? [
          {
            icon: <Edit className="w-4 h-4" />,
            onClick: (bill: MaintenanceBill) => {
              setSelectedBill(bill);
              setIsOpenUpdateMaintananceDetailsModal(true);
            },
            className:
              "cursor-pointer p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors",
            label: "Edit",
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav view="admin" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <h1 className="text-2xl poppins-medium">
                {residentOrganization?.name}
              </h1>
              <p className="text-gray-600 text-sm font-light">
                View and track your society maintenance details
              </p>
            </div>
          </div>

          {/* Enhanced Filters Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm ">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Date Filters */}
              <div className="flex gap-4">
                <GenericSelect
                  id="months"
                  onChange={(value) => handleFilterChange("billMonth", value)}
                  options={[
                    { label: "All Months", value: "" },
                    ...shortMonth.map((month, i) => ({
                      label: month,
                      value: (i + 1).toString().padStart(2, "0"),
                    })),
                  ]}
                  value={filters.billMonth as OptionValue}
                  label="Month"
                />

                <GenericSelect
                  id="years"
                  onChange={(value) => handleFilterChange("billYear", value)}
                  options={[
                    { label: "All Years", value: "" },
                    ...Array.from(
                      { length: new Date().getFullYear() - 2000 + 1 },
                      (_, index) => {
                        const year = new Date().getFullYear() - index;
                        return { label: year, value: `${year}` };
                      }
                    ),
                  ]}
                  value={filters.billYear as OptionValue}
                  label="Year"
                />
              </div>

              {/* Additional Filters */}
              <div className="flex gap-4">
                <GenericSelect
                  id="unitFilter"
                  onChange={(value) => handleFilterChange("unitNumber", value)}
                  options={[
                    { label: "All Units", value: "" },
                    ...residents.map((resident) => ({
                      label: resident?.unit_number as OptionValue,
                      value: resident?.unit_number as OptionValue,
                    })),
                  ]}
                  value={filters.unitNumber || ""}
                  label="Unit Number"
                />

                <GenericSelect
                  id="statusFilter"
                  onChange={(value) => handleFilterChange("status", value)}
                  options={[
                    { label: "All Status", value: "" },
                    { label: "Paid", value: "paid" },
                    { label: "Pending", value: "pending" },
                    { label: "Overdue", value: "overdue" },
                  ]}
                  value={filters.status || ""}
                  label="Status"
                />
              </div>

              {/* Sort Controls */}
              <div className="flex items-end  gap-4">
                <GenericSelect
                  id="sortBy"
                  onChange={(value) => handleSortChange(value)}
                  options={sortOptions}
                  value={sortState.sortBy}
                  label="Sort By"
                />

                <button
                  onClick={() =>
                    setSortState((prev) => ({
                      ...prev,
                      sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
                    }))
                  }
                  className="flex self-end items-center gap-2 px-4 py-1.5 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  title={`Sort ${
                    sortState.sortOrder === "asc" ? "Descending" : "Ascending"
                  }`}
                >
                  {sortState.sortOrder === "asc" ? (
                    <SortAsc className="w-4 h-4" />
                  ) : (
                    <SortDesc className="w-4 h-4" />
                  )}
                  {sortState.sortOrder === "asc" ? "Asc" : "Desc"}
                </button>
              </div>

              {/* Reset Button */}
              <button
                onClick={resetFilters}
                className="px-4 py-2.5 self-end  text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
              >
                Reset Filters
              </button>
            </div>

            {/* Search Bar */}
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by resident name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Bill Generation Button */}
          {profile?.role === "admin" &&
            filters.billMonth === currMonth &&
            filters.billYear === currYear &&
            maintenanceBills?.length === 0 && (
              <button
                disabled={generateBillLoading}
                onClick={handleCreateBill}
                className="w-full sm:w-fit flex items-center whitespace-nowrap justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-70"
                aria-busy={generateBillLoading}
              >
                <ReceiptText className="w-5 h-5" />
                {generateBillLoading ? "Generating..." : "Generate Bill"}
              </button>
            )}

          {/* Results Summary */}
          {!loading && (
            <div className="text-sm text-gray-600">
              {pagination?.totalItems || 0} maintenance bills found
              {debouncedSearchQuery && (
                <span> for "{debouncedSearchQuery}"</span>
              )}
            </div>
          )}

          {/* Main Table */}
          <GenericTable
            title="Maintenance Bills"
            columns={columns}
            data={maintenanceBills}
            actions={profile?.role === "admin" ? actions : []}
            loading={loading}
            emptyMessage={
              debouncedSearchQuery || filters.unitNumber || filters.status
                ? "No maintenance bills found matching your criteria"
                : "No maintenance bills generated this month"
            }
            searchPlaceholder="" // Disable table's built-in search
            showPagination
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[5, 10, 20, 50]}
            onSearch={() => {}} // Disabled since we handle search above
          />
        </div>
      </main>

      {/* Modals */}
      <OnboardResidentModal
        isOpen={isOnboardModalOpen}
        onClose={() => setIsOnboardModalOpen(false)}
      />

      <ViewMaintananceDetailsModal
        bill={selectedBill}
        isOpen={isOpenMaintananceDetailsModal}
        onClose={() => setIsOpenMaintananceDetailsModal(false)}
      />

      <UpdateMaintananceStatusModal
        bill={selectedBill}
        isOpen={isOpenUpdateMaintananceDetailsModal}
        onClose={() => setIsOpenUpdateMaintananceDetailsModal(false)}
        onSuccess={loadData}
      />
    </div>
  );
};

export default AdminDashboard;
