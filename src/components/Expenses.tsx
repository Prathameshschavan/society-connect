import { useEffect, useState } from "react";
import {
  ArrowDownWideNarrow,
  Edit,
  Eye,
  Trash2,
  Search,
  SortAsc,
  SortDesc,
} from "lucide-react";

import { GenericSelect, type OptionValue } from "./ui/GenericSelect";
import TopNav from "./TopNav";
import GenericTable, { type TableAction } from "./ui/GenericTable";
import { AddExpenseModal } from "./Modals/AddExpenseModal";
import { ViewExpenseModal } from "./Modals/ViewExpenseModal";
import { EditExpenseModal } from "./Modals/EditExpenseModal";
import ConfirmationAlert from "./Modals/ConfirmationAlert";

import usePaginationService from "../hooks/serviceHooks/usePaginationService";
import useExpenseService, {
  type ExpenseSortByOptions,
} from "../hooks/serviceHooks/useExpenseService";

import { useOrganizationStore } from "../libs/stores/useOrganizationStore";
import { useReportStore, type Expense } from "../libs/stores/useReportStore";

import { currMonth, currYear, shortMonth } from "../utility/dateTimeServices";
import { columns } from "../config/tableConfig/expense";
import { useProfileStore } from "../libs/stores/useProfileStore";

// Custom hook for debounced search
const useDebounce = (value: string | number | undefined, delay: number) => {
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

// Sort options
const sortOptions = [
  { label: "Date", value: "date" },
  { label: "Amount", value: "amount" },
  { label: "Description", value: "description" },
  { label: "Receiver Name", value: "receiver_name" },
  { label: "Created Date", value: "created_at" },
];

// Filter interface
interface FilterState {
  month?: string;
  year?: string;
  minAmount?: number;
  maxAmount?: number;
}

// Sort interface
interface SortState {
  sortBy: string;
  sortOrder: "asc" | "desc";
}

const Expenses = () => {
  // States
  const [filters, setFilters] = useState<FilterState>({
    month: currMonth,
    year: currYear,
  });

  // Separate state for input values (not debounced)
  const [minAmountInput, setMinAmountInput] = useState<string>("");
  const [maxAmountInput, setMaxAmountInput] = useState<string>("");

  // Debounced amount values
  const debouncedMinAmount = useDebounce(
    minAmountInput ? parseFloat(minAmountInput) : undefined,
    500
  );
  const debouncedMaxAmount = useDebounce(
    maxAmountInput ? parseFloat(maxAmountInput) : undefined,
    500
  );

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const [sortState, setSortState] = useState<SortState>({
    sortBy: "date",
    sortOrder: "desc",
  });

  const [loading, setLoading] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Modal states
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isOpenViewExpenseModal, setIsOpenViewExpenseModal] = useState(false);
  const [isOpenUpdateExpenseModal, setIsOpenUpdateExpenseModal] =
    useState(false);
  const [isOpenDeleteExpenseModal, setIsOpenDeleteExpenseModal] =
    useState(false);

  // Stores & Services
  const { residentOrganization } = useOrganizationStore();
  const { expenses } = useReportStore();
  const { profile } = useProfileStore();
  const {
    setCurrentPage,
    pagination,
    handlePageChange,
    handlePageSizeChange,
    currentPage,
    pageSize,
    setPagination,
  } = usePaginationService();
  const { fetchExpenses, deleteExpense } = useExpenseService();

  // Load data function
  const loadData = async () => {
    setLoading(true);
    try {
      const result = await fetchExpenses({
        page: currentPage,
        pageSize,
        searchQuery: debouncedSearchQuery as string,
        sortBy: sortState.sortBy as ExpenseSortByOptions,
        sortOrder: sortState.sortOrder,
        filters: {
          month: filters.month,
          year: filters.year,
          minAmount: debouncedMinAmount as number,
          maxAmount: debouncedMaxAmount as number,
        },
        orgId: residentOrganization?.id as string,
      });

      if (result) {
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load data when dependencies change
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    pageSize,
    filters,
    sortState,
    debouncedSearchQuery,
    debouncedMinAmount,
    debouncedMaxAmount,
  ]);

  // Handle filter changes
  const handleFilterChange = (
    key: keyof FilterState,
    value: string | number
  ) => {
    setCurrentPage(1);
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  // Handle sort changes
  const handleSortChange = (field: string) => {
    setSortState((prev) => ({
      sortBy: field,
      sortOrder:
        prev.sortBy === field && prev.sortOrder === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      month: currMonth,
      year: currYear,
    });
    setSearchQuery("");
    setMinAmountInput("");
    setMaxAmountInput("");
    setSortState({
      sortBy: "date",
      sortOrder: "desc",
    });
    setCurrentPage(1);
  };

  // Table actions
  const actions: TableAction<Expense>[] = [
    {
      icon: <Eye className="w-4 h-4" />,
      onClick: (expense: Expense) => {
        setSelectedExpense(expense);
        setIsOpenViewExpenseModal(true);
      },
      className:
        "cursor-pointer p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors",
      label: "View",
    },
    ...(profile?.role === "admin"
      ? [
        {
          icon: <Edit className="w-4 h-4" />,
          onClick: (expense: Expense) => {
            setSelectedExpense(expense);
            setIsOpenUpdateExpenseModal(true);
          },
          className:
            "cursor-pointer p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors",
          label: "Edit",
        },
        {
          icon: <Trash2 className="w-4 h-4" />,
          onClick: (expense: Expense) => {
            setSelectedExpense(expense);
            setIsOpenDeleteExpenseModal(true);
          },
          className:
            "cursor-pointer p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors",
          label: "Delete",
        },
      ]
      : []),
  ];

  const hasActiveFilters =
    debouncedSearchQuery || debouncedMinAmount || debouncedMaxAmount;

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
                Track and manage your society expenses
              </p>
            </div>
          </div>

          {/* Enhanced Filters Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Date Filters */}
              <div className="flex gap-4">
                <GenericSelect
                  id="months"
                  onChange={(value) => {
                    setCurrentPage(1);
                    handleFilterChange("month", value);
                  }}
                  options={[
                    { label: "All Months", value: "" },
                    ...shortMonth.map((month, i) => ({
                      label: month,
                      value: (i + 1).toString().padStart(2, "0"),
                    })),
                  ]}
                  value={filters.month as OptionValue}
                  label="Month"
                />

                <GenericSelect
                  id="years"
                  onChange={(value) => {
                    setCurrentPage(1);
                    handleFilterChange("year", value);
                  }}
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
                  value={filters.year as OptionValue}
                  label="Year"
                />
              </div>

              {/* Sort Controls */}
              <div className="flex items-end gap-4">
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
                  title={`Sort ${sortState.sortOrder === "asc" ? "Descending" : "Ascending"
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
                className="px-4 py-2.5 self-end text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
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
                  placeholder="Search by description or receiver name..."
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

            {/* Amount Range Filters - DEBOUNCED */}
            <div className="mt-4 flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Amount
                </label>
                <input
                  type="number"
                  placeholder="Min"
                  value={minAmountInput}
                  onChange={(e) => {
                    setMinAmountInput(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Amount
                </label>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxAmountInput}
                  onChange={(e) => {
                    setMaxAmountInput(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Add Expense Button */}
          {profile?.role === "admin" && <button
            onClick={() => setIsAddExpenseModalOpen(true)}
            className="w-full sm:w-fit flex items-center whitespace-nowrap justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors hover:bg-blue-700"
          >
            <ArrowDownWideNarrow className="w-5 h-5" />
            Add Expense
          </button>}

          {/* Results Summary */}
          {!loading && (
            <div className="text-sm text-gray-600">
              {pagination?.totalItems || 0} expense records found
              {debouncedSearchQuery && (
                <span> for "{debouncedSearchQuery}"</span>
              )}
            </div>
          )}

          {/* Table */}
          <GenericTable
            title="Expenses"
            columns={columns}
            data={expenses}
            actions={actions}
            loading={loading}
            emptyMessage={
              hasActiveFilters
                ? "No expense records found matching your criteria"
                : "No expense records this month"
            }
            searchPlaceholder=""
            showPagination
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[5, 10, 20, 50]}
            onSearch={() => { }}
          />
        </div>
      </main>

      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
      />
      <ViewExpenseModal
        isOpen={isOpenViewExpenseModal}
        onClose={() => setIsOpenViewExpenseModal(false)}
        expense={selectedExpense}
      />
      <EditExpenseModal
        isOpen={isOpenUpdateExpenseModal}
        onClose={() => setIsOpenUpdateExpenseModal(false)}
        expense={selectedExpense}
      />
      <ConfirmationAlert
        isOpen={isOpenDeleteExpenseModal}
        onClose={() => setIsOpenDeleteExpenseModal(false)}
        message="Are you sure you want to delete this expense?"
        onConfirm={async () => {
          await deleteExpense(selectedExpense?.id as string);
          await loadData();
          setIsOpenDeleteExpenseModal(false);
        }}
      />
    </div>
  );
};

export default Expenses;
