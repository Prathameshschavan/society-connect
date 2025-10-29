/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  IndianRupeeIcon,
  Search,
  SortAsc,
  SortDesc,
} from "lucide-react";

import { GenericSelect, type OptionValue } from "./ui/GenericSelect";
import TopNav from "./TopNav";
import GenericTable from "./ui/GenericTable";

import usePaginationService from "../hooks/serviceHooks/usePaginationService";
import useIncomeService from "../hooks/serviceHooks/useIncomeService";
import useExpenseService from "../hooks/serviceHooks/useExpenseService";

import { useOrganizationStore } from "../libs/stores/useOrganizationStore";

import {
  currMonth,
  currYear,
  shortMonth,
  longMonth,
  formatMonthNum,
} from "../utility/dateTimeServices";

// Custom hook for debounced search
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

interface MonthlyData {
  month: number;
  year: number;
  income: number;
  expenses: number;
  difference: number;
  monthName: string;
  runningBalance?: number; // Cumulative balance from start of year
}

// Sort options
const sortOptions = [
  { label: "Month", value: "month" },
  { label: "Income", value: "income" },
  { label: "Expenses", value: "expenses" },
  { label: "Difference", value: "difference" },
  { label: "Running Balance", value: "runningBalance" },
];

// Filter options
const filterOptions = [
  { label: "All", value: "all" },
  { label: "Surplus Only", value: "surplus" },
  { label: "Deficit Only", value: "deficit" },
  { label: "Balanced", value: "balanced" },
];

// Filter interface
interface FilterState {
  month?: string;
  year?: string;
}

// Sort interface
interface SortState {
  sortBy: string;
  sortOrder: "asc" | "desc";
}

const Reports = () => {
  // States
  const [filters, setFilters] = useState<FilterState>({
    month: currMonth,
    year: currYear,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const [sortState, setSortState] = useState<SortState>({
    sortBy: "month",
    sortOrder: "asc",
  });

  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");

  // Stores & Services
  const { residentOrganization } = useOrganizationStore();
  const {
    setCurrentPage,
    handlePageChange,
    handlePageSizeChange,
    pagination,
    currentPage,
    pageSize,
  } = usePaginationService();
  const { fetchIncomes } = useIncomeService();
  const { fetchExpenses } = useExpenseService();

  // Processed data
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [yearlyTotals, setYearlyTotals] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    difference: 0,
  });

  // Load data function (similar to expense)
  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch both income and expenses
      const [incomeResult, expenseResult] = await Promise.all([
        fetchIncomes({
          page: 1,
          pageSize: 1000, // Get all records
          searchQuery: "",
          sortBy: "date",
          sortOrder: "desc",
          filters: {
            year: filters.year,
          },
          orgId: residentOrganization?.id as string,
        }),
        fetchExpenses({
          page: 1,
          pageSize: 1000, // Get all records
          searchQuery: "",
          sortBy: "date",
          sortOrder: "desc",
          filters: {
            year: filters.year,
          },
          orgId: residentOrganization?.id as string,
        }),
      ]);

      if (incomeResult && expenseResult) {
        // Process monthly data
        const monthlyBreakdown: MonthlyData[] = [];
        let totalIncome = 0;
        let totalExpenses = 0;
        let runningBalance = 0; // Cumulative balance tracker

        for (let month = 1; month <= 12; month++) {
          const monthIncome = incomeResult.data
            .filter((income) => income.month === month)
            .reduce((sum, income) => sum + Number(income.amount), 0);

          const monthExpenses = expenseResult.data
            .filter(
              (expense) => parseInt(formatMonthNum(expense.month)) === month
            )
            .reduce((sum, expense) => sum + Number(expense.amount), 0);

          const difference = monthIncome - monthExpenses;
          
          // Add to running balance
          runningBalance += difference;

          monthlyBreakdown.push({
            month,
            year: parseInt(filters.year || currYear),
            income: monthIncome,
            expenses: monthExpenses,
            difference,
            monthName: longMonth[month - 1],
            runningBalance, // Cumulative balance up to this month
          });

          totalIncome += monthIncome;
          totalExpenses += monthExpenses;
        }

        setMonthlyData(monthlyBreakdown);
        setYearlyTotals({
          totalIncome,
          totalExpenses,
          difference: totalIncome - totalExpenses,
        });
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
  }, [currentPage, pageSize, filters, debouncedSearchQuery]);

  // Selected month data
  const selectedMonthData = useMemo(() => {
    if (!monthlyData.length) return null;
    return monthlyData.find((m) => m.month === Number(filters.month));
  }, [filters.month, monthlyData]);

  // Filtered and sorted data
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...monthlyData];

    // Apply search filter
    if (debouncedSearchQuery.trim()) {
      filtered = filtered.filter((month) =>
        month.monthName
          .toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filterType !== "all") {
      filtered = filtered.filter((month) => {
        if (filterType === "surplus") return month.difference > 0;
        if (filterType === "deficit") return month.difference < 0;
        if (filterType === "balanced") return month.difference === 0;
        return true;
      });
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let compareValue = 0;

      switch (sortState.sortBy) {
        case "month":
          compareValue = a.month - b.month;
          break;
        case "income":
          compareValue = a.income - b.income;
          break;
        case "expenses":
          compareValue = a.expenses - b.expenses;
          break;
        case "difference":
          compareValue = a.difference - b.difference;
          break;
        case "runningBalance":
          compareValue = (a.runningBalance || 0) - (b.runningBalance || 0);
          break;
        default:
          compareValue = 0;
      }

      return sortState.sortOrder === "asc" ? compareValue : -compareValue;
    });

    return sorted;
  }, [monthlyData, debouncedSearchQuery, filterType, sortState]);

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterState, value: string) => {
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
    setFilterType("all");
    setSortState({
      sortBy: "month",
      sortOrder: "asc",
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = debouncedSearchQuery || filterType !== "all";

  // Table data
  const tableData =
    filteredAndSortedData.map((month) => ({
      id: month.month.toString(),
      monthName: month.monthName,
      year: month.year,
      income: month.income,
      expenses: month.expenses,
      difference: month.difference,
      runningBalance: month.runningBalance || 0,
      status:
        month.difference > 0
          ? "Surplus"
          : month.difference < 0
          ? "Deficit"
          : "Balanced",
    })) || [];

  const tableColumns = [
    {
      key: "monthName",
      header: "Month/Year",
      render: (row: MonthlyData) => (
        <div>
          <p className="font-medium text-gray-900">
            {row.monthName} {row.year}
          </p>
        </div>
      ),
    },
    {
      key: "income",
      header: "Income",
      render: (row: MonthlyData) => (
        <div>
          <p className="font-medium text-green-600">
            ₹{row.income.toLocaleString("en-IN")}
          </p>
        </div>
      ),
    },
    {
      key: "expenses",
      header: "Expenses",
      render: (row: MonthlyData) => (
        <div>
          <p className="font-medium text-red-600">
            ₹{row.expenses.toLocaleString("en-IN")}
          </p>
        </div>
      ),
    },
    {
      key: "difference",
      header: "Difference",
      render: (row: MonthlyData) => (
        <div>
          <p
            className={`font-bold ${
              row.difference >= 0 ? "text-blue-600" : "text-orange-600"
            }`}
          >
            {row.difference >= 0 ? "+" : "-"}₹
            {Math.abs(row.difference).toLocaleString("en-IN")}
          </p>
        </div>
      ),
    },
    {
      key: "runningBalance",
      header: "Running Balance",
      render: (row: MonthlyData & { runningBalance: number }) => (
        <div>
          <p
            className={`font-bold ${
              row.runningBalance >= 0 ? "text-purple-600" : "text-red-600"
            }`}
          >
            {row.runningBalance >= 0 ? "+" : ""}₹
            {row.runningBalance.toLocaleString("en-IN")}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: MonthlyData & { status: string }) => (
        <div>
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              row.difference > 0
                ? "bg-green-100 text-green-800"
                : row.difference < 0
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {row.status}
          </span>
        </div>
      ),
    },
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
                Financial Reports - {residentOrganization?.name}
              </h1>
              <p className="text-gray-600 text-sm font-light">
                Income vs Expense analysis for your organization
              </p>
            </div>
          </div>

          {/* Summary Cards */}
          {monthlyData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">
                      Total Income
                    </p>
                    <p className="text-2xl font-bold text-green-800">
                      ₹{yearlyTotals.totalIncome.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-600 text-sm font-medium">
                      Total Expenses
                    </p>
                    <p className="text-2xl font-bold text-red-800">
                      ₹{yearlyTotals.totalExpenses.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-red-600" />
                </div>
              </div>

              <div
                className={`${
                  yearlyTotals.difference >= 0
                    ? "bg-blue-50 border-blue-200"
                    : "bg-orange-50 border-orange-200"
                } border rounded-lg p-6`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`${
                        yearlyTotals.difference >= 0
                          ? "text-blue-600"
                          : "text-orange-600"
                      } text-sm font-medium`}
                    >
                      Net {yearlyTotals.difference >= 0 ? "Surplus" : "Deficit"}
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        yearlyTotals.difference >= 0
                          ? "text-blue-800"
                          : "text-orange-800"
                      }`}
                    >
                      ₹
                      {Math.abs(yearlyTotals.difference).toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>
                  <IndianRupeeIcon
                    className={`w-8 h-8 ${
                      yearlyTotals.difference >= 0
                        ? "text-blue-600"
                        : "text-orange-600"
                    }`}
                  />
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Year</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {filters.year}
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-gray-600" />
                </div>
              </div>
            </div>
          )}

          {/* Selected Month Details */}
          {selectedMonthData && filters.month !== "" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {selectedMonthData.monthName} {filters.year} Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-blue-700">Income</p>
                  <p className="text-xl font-bold text-green-600">
                    ₹{selectedMonthData.income.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-blue-700">Expenses</p>
                  <p className="text-xl font-bold text-red-600">
                    ₹{selectedMonthData.expenses.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-blue-700">
                    {selectedMonthData.difference >= 0 ? "Surplus" : "Deficit"}
                  </p>
                  <p
                    className={`text-xl font-bold ${
                      selectedMonthData.difference >= 0
                        ? "text-blue-600"
                        : "text-orange-600"
                    }`}
                  >
                    ₹
                    {Math.abs(selectedMonthData.difference).toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-blue-700">Running Balance</p>
                  <p
                    className={`text-xl font-bold ${
                      (selectedMonthData.runningBalance || 0) >= 0
                        ? "text-purple-600"
                        : "text-red-600"
                    }`}
                  >
                    ₹
                    {Math.abs(selectedMonthData.runningBalance || 0).toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Filters Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Date Filters */}
              <div className="flex gap-4">
                <GenericSelect
                  id="months"
                  onChange={(value) => handleFilterChange("month", value)}
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
                  onChange={(value) => handleFilterChange("year", value)}
                  options={[
                    // { label: "All Years", value: "" },
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

              {/* Filter Type */}
              <div className="flex gap-4">
                <GenericSelect
                  id="filterType"
                  onChange={(value) => setFilterType(value)}
                  options={filterOptions}
                  value={filterType}
                  label="Filter By Status"
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
                  placeholder="Search by month name..."
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

          {/* Results Summary */}
          {!loading && (
            <div className="text-sm text-gray-600">
              {filteredAndSortedData.length} report records found
              {debouncedSearchQuery && (
                <span> for "{debouncedSearchQuery}"</span>
              )}
            </div>
          )}

          {/* Monthly Breakdown Table */}
          <GenericTable
            title={`Monthly Financial Report - ${filters.year || "All Years"}`}
            columns={tableColumns as any}
            data={tableData as any}
            actions={[]}
            loading={loading}
            emptyMessage={
              hasActiveFilters
                ? "No months found matching your criteria"
                : "No financial data available for this year"
            }
            searchPlaceholder=""
            showPagination={false}
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[12]}
            onSearch={() => {}}
          />

          {/* Yearly Summary Footer */}
          {monthlyData.length > 0 && (
            <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">Year</p>
                  <p className="text-lg font-bold text-gray-900">
                    {filters.year}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Income</p>
                  <p className="text-lg font-bold text-green-600">
                    ₹{yearlyTotals.totalIncome.toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Expenses</p>
                  <p className="text-lg font-bold text-red-600">
                    ₹{yearlyTotals.totalExpenses.toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Net {yearlyTotals.difference >= 0 ? "Surplus" : "Deficit"}
                  </p>
                  <p
                    className={`text-lg font-bold ${
                      yearlyTotals.difference >= 0
                        ? "text-blue-600"
                        : "text-orange-600"
                    }`}
                  >
                    ₹{Math.abs(yearlyTotals.difference).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Reports;
