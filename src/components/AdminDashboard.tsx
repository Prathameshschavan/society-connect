/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState, useCallback } from "react";
import {
  Edit,
  Eye,
  ReceiptText,
  Search,
  SlidersHorizontal,
  SortAsc,
  SortDesc,
  X,
} from "lucide-react";

import OnboardResidentModal from "./Modals/OnboardResidentModal";

import GenericTable, { type TableAction } from "./ui/GenericTable";

import useAdminService from "../hooks/serviceHooks/useAdminService";
import usePaginationService from "../hooks/serviceHooks/usePaginationService";

import {
  useMaintenanceStore,
  type MaintenanceBill,
} from "../libs/stores/useMaintenanceStore";
import { useProfileStore } from "../libs/stores/useProfileStore";

import { currMonth, currYear, shortMonth } from "../utility/dateTimeServices";
import { columns } from "../config/tableConfig/adminDashboard";
import { GenericSelect, type OptionValue } from "./ui/GenericSelect";
import { siteSetting } from "../config/siteSetting";
import Layout from "./Layout/Layout";
import ViewMaintenanceDetailsModal from "./Modals/ViewMaintenanceDetailsModal";
import UpdateMaintenanceStatusModal from "./Modals/UpdateMaintenanceStatusModal";

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
  const { maintenanceBills } = useMaintenanceStore();

  // Modal states
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [isOpenMaintenanceDetailsModal, setIsOpenMaintenanceDetailsModal] =
    useState(false);
  const [
    isOpenUpdateMaintenanceDetailsModal,
    setIsOpenUpdateMaintenanceDetailsModal,
  ] = useState(false);
  const [selectedBill, setSelectedBill] = useState<MaintenanceBill | null>(
    null
  );
  const [visiblefilters, setVisiblefilters] = useState<boolean>(false);

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
        setPagination(result.pagination as any);
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
        setIsOpenMaintenanceDetailsModal(true);
      },
      className:
        "cursor-pointer p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors",
      label: "View",
    },
    ...(filters.billMonth === currMonth &&
    filters.billYear === currYear &&
    profile?.role === "admin"
      ? [
          {
            icon: <Edit className="w-4 h-4" />,
            onClick: (bill: MaintenanceBill) => {
              setSelectedBill(bill);
              setIsOpenUpdateMaintenanceDetailsModal(true);
            },
            className:
              "cursor-pointer p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors",
            label: "Edit",
          },
        ]
      : []),
  ];

  return (
    <Layout role="admin">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex  items-center justify-between gap-5 w-full sm:w-fit">
          {profile?.role === "admin" &&
            filters.billMonth === currMonth &&
            filters.billYear === currYear &&
            maintenanceBills?.length === 0 && (
              <button
                disabled={generateBillLoading}
                onClick={handleCreateBill}
                className={`bg-[#22C36E] w-full sm:w-fit flex items-center whitespace-nowrap justify-center gap-2 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-70`}
                aria-busy={generateBillLoading}
              >
                <ReceiptText className="w-5 h-5" />
                {generateBillLoading ? "Generating..." : "Generate Bill"}
              </button>
            )}
          <button
            onClick={() => setVisiblefilters(!visiblefilters)}
            className={`w-full sm:w-fit flex items-center whitespace-nowrap justify-center gap-2 text-[${siteSetting?.mainColor}] border-[0.5px] px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-70`}
          >
            {visiblefilters ? (
              <X className="w-5 h-5" />
            ) : (
              <SlidersHorizontal className="w-5 h-5" />
            )}
            Fliters
          </button>
        </div>

        <div className="relative w-full sm:w-[280px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by resident name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:max-w-[280px]  pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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

      {visiblefilters && (
        <div className="bg-white p-6 rounded-lg shadow-sm space-y-4 ">
          <div className=" grid grid-cols-3 lg:grid-cols-7 gap-4">
            <GenericSelect
              id="months"
              onChange={(value) => handleFilterChange("billMonth", value as string)}
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
              onChange={(value) => handleFilterChange("billYear", value as string)}
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

            <GenericSelect
              id="unitFilter"
              onChange={(value) => handleFilterChange("unitNumber", value as string)}
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
            <div className="lg:flex justify-end hidden">
              <button
                onClick={resetFilters}
                className="px-4 py-2.5 self-end whitespace-nowrap text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
          <div className="flex justify-end lg:hidden">
            <button
              onClick={resetFilters}
              className="px-4 py-2.5 self-end whitespace-nowrap text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <GenericTable
        title="Maintenance Bills"
        columns={columns}
        data={maintenanceBills}
        actions={actions}
        loading={loading}
        emptyMessage={
          debouncedSearchQuery || filters.unitNumber || filters.status
            ? "No maintenance bills found matching your criteria"
            : "No maintenance bills generated this month"
        }
        showPagination
        pagination={pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={[5, 10, 20, 50]}
      />

      {/* Modals */}
      <OnboardResidentModal
        isOpen={isOnboardModalOpen}
        onClose={() => setIsOnboardModalOpen(false)}
      />

      <ViewMaintenanceDetailsModal
        bill={selectedBill}
        isOpen={isOpenMaintenanceDetailsModal}
        onClose={() => setIsOpenMaintenanceDetailsModal(false)}
      />

      <UpdateMaintenanceStatusModal
        bill={selectedBill}
        isOpen={isOpenUpdateMaintenanceDetailsModal}
        onClose={() => setIsOpenUpdateMaintenanceDetailsModal(false)}
        onSuccess={loadData}
      />
    </Layout>
  );
};

export default AdminDashboard;
