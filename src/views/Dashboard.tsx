/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  IndianRupeeIcon,
  LayoutDashboard,
  Plus,
  ArrowRight,
} from "lucide-react";

import usePaginationService from "../hooks/serviceHooks/usePaginationService";
import { currMonth, currYear, shortMonth } from "../utility/dateTimeServices";
import Layout from "../components/Layout/Layout";
import {
  GenericSelect,
  type OptionValue,
} from "../components/ui/GenericSelect";
import GenericTable from "../components/ui/GenericTable";
import {
  useDashboardData,
  type MonthlyData,
} from "../hooks/custom/useDashboardData";

// Custom hook for debounced search
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  import("react").then(({ useEffect }) => {
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      return () => clearTimeout(handler);
    }, [value, delay]);
  });
  return debouncedValue;
};

// Sort interface
interface SortState {
  sortBy: string;
  sortOrder: "asc" | "desc";
}

const Dashboard = () => {
  const navigate = useNavigate();

  // Local UI States
  const [selectedYear, setSelectedYear] = useState(currYear);
  const [selectedMonth, setSelectedMonth] = useState(currMonth);
  const [filterType] = useState<string>("all");
  const [searchQuery] = useState("");
  const [sortState] = useState<SortState>({
    sortBy: "month",
    sortOrder: "asc",
  });

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Pagination Service
  const {
    handlePageChange,
    handlePageSizeChange,
    pagination,
  } = usePaginationService();

  // Data Hook
  const { loading, monthlyData, yearlyTotals } = useDashboardData(selectedYear);

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

  // Handle view details
  const handleViewDetails = (monthData: any) => {
    const monthNum = String(monthData.id).padStart(2, "0");
    navigate(`/report?month=${monthNum}&year=${monthData.year}`);
  };

  // Prepare table data
  const tableData = filteredAndSortedData.map((month) => ({
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
  }));

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
      render: (row: any) => (
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

  const selectedMonthData = monthlyData.find(
    (m) => m.month === Number(selectedMonth)
  );

  return (
    <Layout
      role="admin"
      visibileTopSection={false}
      pageHeader={{
        title: "Dashboard",
        description: "Financial overview and tracking.",
        icon: <LayoutDashboard className="w-6 h-6 text-[#0154AC]" />,
      }}
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border hover:shadow-md transition-shadow duration-200 border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">
                Total Income
              </p>
              <p className="text-2xl font-bold text-green-600">
                ₹{yearlyTotals.totalIncome.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border hover:shadow-md transition-shadow duration-200 border-red-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">
                Total Expenses
              </p>
              <p className="text-2xl font-bold text-red-600">
                ₹{yearlyTotals.totalExpenses.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border hover:shadow-md transition-shadow duration-200 border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">
                Net Position
              </p>
              <p
                className={`text-2xl font-bold ${
                  yearlyTotals.difference >= 0
                    ? "text-blue-600"
                    : "text-orange-600"
                }`}
              >
                {yearlyTotals.difference >= 0 ? "+" : "-"}₹
                {Math.abs(yearlyTotals.difference).toLocaleString("en-IN")}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <IndianRupeeIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0154AC] to-[#01448C] text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">
                Fiscal Year
              </p>
              <p className="text-2xl font-bold">{selectedYear}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-200 opacity-80" />
          </div>
          <p className="text-xs text-blue-100 mt-2 opacity-80">
            Financial Performance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-semibold text-gray-800">
                Monthly Performance
              </h2>

                <div className="w-full sm:w-32">
                  <GenericSelect
                    id="years"
                    onChange={(value) => setSelectedYear(`${value}`)}
                    options={[
                      ...Array.from(
                        { length: new Date().getFullYear() - 2000 + 1 },
                        (_, index) => {
                          const year = new Date().getFullYear() - index;
                          return { label: year, value: `${year}` };
                        }
                      ),
                    ]}
                    value={selectedYear as OptionValue}
                    label="Year"
                  />
                </div>
            </div>

            <GenericTable
              title=""
              columns={tableColumns as any}
              data={tableData as any}
              actions={[
                {
                  label: "Details",
                  icon: <ArrowRight className="w-4 h-4" />,
                  onClick: handleViewDetails,
                  className: "text-[#0154AC] hover:bg-blue-50",
                },
              ]}
              loading={loading}
              emptyMessage={"No data available for the selected period."}
              searchPlaceholder=""
              showPagination={false}
              pagination={pagination}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[12]}
            />
          </div>
        </div>

        {/* Sidebar / Secondary Info */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/income")}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg group-hover:bg-green-200 transition-colors">
                    <Plus className="w-4 h-4 text-green-700" />
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-green-800">
                    Add Income
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
              </button>

              <button
                onClick={() => navigate("/expenses")}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-2 rounded-lg group-hover:bg-red-200 transition-colors">
                    <Plus className="w-4 h-4 text-red-700" />
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-red-800">
                    Add Expense
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
              </button>
            </div>
          </div>

          {/* Monthly Snapshot */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Monthly Snapshot
              </h3>
              <div className="w-24">
                <GenericSelect
                  id="snapshot-month"
                  onChange={(value) => setSelectedMonth(`${value}`)}
                  options={shortMonth.map((month, i) => ({
                    label: month,
                    value: (i + 1).toString().padStart(2, "0"),
                  }))}
                  value={selectedMonth as OptionValue}
                />
              </div>
            </div>

            {selectedMonthData ? (
              <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-gray-100 pb-2">
                  <span className="text-gray-500 text-sm">Income</span>
                  <span className="font-bold text-green-600 text-lg">
                    ₹{selectedMonthData.income.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between items-end border-b border-gray-100 pb-2">
                  <span className="text-gray-500 text-sm">Expenses</span>
                  <span className="font-bold text-red-600 text-lg">
                    ₹{selectedMonthData.expenses.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between items-end pt-2">
                  <span className="text-gray-800 font-medium">Net</span>
                  <span
                    className={`font-bold text-lg ${
                      selectedMonthData.difference >= 0
                        ? "text-blue-600"
                        : "text-orange-600"
                    }`}
                  >
                    {selectedMonthData.difference >= 0 ? "+" : "-"}₹
                    {Math.abs(selectedMonthData.difference).toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">
                Select a month to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
