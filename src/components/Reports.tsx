/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from "react";
import { GenericSelect } from "./ui/GenericSelect";
import {
  currMonth,
  currYear,
  shortMonth,
  longMonth,
  formatMonthNum,
} from "../utility/dateTimeServices";
import TopNav from "./TopNav";
import usePaginationService from "../hooks/serviceHooks/usePaginationService";
import { useOrganizationStore } from "../libs/stores/useOrganizationStore";
import GenericTable from "./ui/GenericTable";
import useIncomeService from "../hooks/serviceHooks/useIncomeService";
import useExpenseService from "../hooks/serviceHooks/useExpenseService";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Download,
  Calendar,
  IndianRupeeIcon,
} from "lucide-react";

interface MonthlyData {
  month: number;
  year: number;
  income: number;
  expenses: number;
  difference: number;
  monthName: string;
}

interface YearlyData {
  year: number;
  totalIncome: number;
  totalExpenses: number;
  difference: number;
  monthlyBreakdown: MonthlyData[];
}

const Reports = () => {
  const [selectedMonth, setSelectedMonth] = useState({
    month: currMonth,
    year: currYear,
  });
  const { residentOrganization } = useOrganizationStore();
  const { setCurrentPage, handlePageChange, handlePageSizeChange, pagination } =
    usePaginationService();
  const { fetchIncomes } = useIncomeService();
  const { fetchExpenses } = useExpenseService();

  const [loading, setLoading] = useState(false);
  const [yearlyData, setYearlyData] = useState<YearlyData | null>(null);

  // Fetch and process data
  useEffect(() => {
    const fetchReportData = async () => {
      if (!residentOrganization?.id) return;

      setLoading(true);
      try {
        // Fetch all data for the selected year
        const [incomeResponse, expenseResponse] = await Promise.all([
          fetchIncomes({
            orgId: residentOrganization.id,
            pageSize: 1000, // Get all records
            filters: { year: selectedMonth.year },
          }),
          fetchExpenses({
            orgId: residentOrganization.id,
            pageSize: 1000, // Get all records
            filters: { year: selectedMonth.year },
          }),
        ]);

        console.log(expenseResponse)

        const incomes = incomeResponse?.data || [];
        const expenses = expenseResponse?.data || [];

        // Process monthly data
        const monthlyBreakdown: MonthlyData[] = [];
        let totalIncome = 0;
        let totalExpenses = 0;

        for (let month = 1; month <= 12; month++) {
          const monthIncome = incomes
            .filter((income) => income.month === month)
            .reduce((sum, income) => sum + Number(income.amount), 0);

          const monthExpenses = expenses
            .filter((expense) => formatMonthNum(expense.month) === formatMonthNum(month))
            .reduce((sum, expense) => sum + Number(expense.amount), 0);

            console.log(monthExpenses)

          const difference = monthIncome - monthExpenses;

          monthlyBreakdown.push({
            month,
            year: Number(selectedMonth.year),
            income: monthIncome,
            expenses: monthExpenses,
            difference,
            monthName: longMonth[month - 1],
          });

          totalIncome += monthIncome;
          totalExpenses += monthExpenses;
        }

        setYearlyData({
          year: Number(selectedMonth.year),
          totalIncome,
          totalExpenses,
          difference: totalIncome - totalExpenses,
          monthlyBreakdown,
        });
      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [selectedMonth.year, residentOrganization?.id]);

  const selectedMonthData = useMemo(() => {
    if (!yearlyData) return null;
    return yearlyData.monthlyBreakdown.find(
      (m) => m.month === Number(selectedMonth.month)
    );
  }, [selectedMonth.month, yearlyData]);

  const exportToCSV = () => {
    if (!yearlyData) return;

    const csvData = [
      ["Month", "Income (₹)", "Expenses (₹)", "Difference (₹)"],
      ...yearlyData.monthlyBreakdown.map((month) => [
        month.monthName,
        month.income.toString(),
        month.expenses.toString(),
        month.difference.toString(),
      ]),
      ["", "", "", ""],
      [
        "Total",
        yearlyData.totalIncome.toString(),
        yearlyData.totalExpenses.toString(),
        yearlyData.difference.toString(),
      ],
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financial-report-${selectedMonth.year}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Table data for monthly breakdown
  const tableData =
    yearlyData?.monthlyBreakdown.map((month) => ({
      id: month.month.toString(),
      monthName: month.monthName,
      income: month.income,
      expenses: month.expenses,
      difference: month.difference,
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
      header: "Month",
      render: (row: MonthlyData) => (
        <div>
          <p className="font-medium text-gray-900">{row.monthName}</p>
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

  console.log(tableData)

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

            {/* Filters */}
            <div className="flex items-end gap-4 w-full sm:w-fit">
              <GenericSelect
                id="months"
                onChange={(value) => {
                  setCurrentPage(1);
                  setSelectedMonth((prev) => ({
                    ...prev,
                    month: value,
                  }));
                }}
                options={shortMonth.map((month, i) => ({
                  label: month,
                  value: (i + 1).toString().padStart(2, "0"),
                }))}
                value={selectedMonth.month}
                label="Month"
              />

              <GenericSelect
                id="years"
                onChange={(value) => {
                  setCurrentPage(1);
                  setSelectedMonth((prev) => ({
                    ...prev,
                    year: value,
                  }));
                }}
                options={Array.from(
                  { length: new Date().getFullYear() - 2000 + 1 },
                  (_, index) => {
                    const year = new Date().getFullYear() - index;
                    return { label: year, value: `${year}` };
                  }
                )}
                value={selectedMonth.year}
                label="Year"
              />

              <button
                onClick={exportToCSV}
                disabled={!yearlyData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 max-h-[37px] text-white rounded hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          {yearlyData && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">
                      Total Income
                    </p>
                    <p className="text-2xl font-bold text-green-800">
                      ₹{yearlyData.totalIncome.toLocaleString("en-IN")}
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
                      ₹{yearlyData.totalExpenses.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-red-600" />
                </div>
              </div>

              <div
                className={`${
                  yearlyData.difference >= 0
                    ? "bg-blue-50 border-blue-200"
                    : "bg-orange-50 border-orange-200"
                } border rounded-lg p-6`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`${
                        yearlyData.difference >= 0
                          ? "text-blue-600"
                          : "text-orange-600"
                      } text-sm font-medium`}
                    >
                      Net {yearlyData.difference >= 0 ? "Surplus" : "Deficit"}
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        yearlyData.difference >= 0
                          ? "text-blue-800"
                          : "text-orange-800"
                      }`}
                    >
                      ₹{Math.abs(yearlyData.difference).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <IndianRupeeIcon
                    className={`w-8 h-8 ${
                      yearlyData.difference >= 0
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
                      {selectedMonth.year}
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-gray-600" />
                </div>
              </div>
            </div>
          )}

          {/* Selected Month Details */}
          {selectedMonthData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {selectedMonthData.monthName} {selectedMonth.year} Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              </div>
            </div>
          )}

          {/* Monthly Breakdown Table */}
          <GenericTable
            title={`Monthly Financial Report - ${selectedMonth.year}`}
            columns={tableColumns}
            data={tableData as any}
            actions={[]}
            loading={loading}
            emptyMessage="No financial data available for this year"
            searchPlaceholder="Search months"
            showPagination={false} // Show all months
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[12]} // Show all 12 months
            onSearch={() => {}}
          />

          {/* Yearly Summary Footer */}
          {yearlyData && (
            <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">Year</p>
                  <p className="text-lg font-bold text-gray-900">
                    {yearlyData.year}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Income</p>
                  <p className="text-lg font-bold text-green-600">
                    ₹{yearlyData.totalIncome.toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Expenses</p>
                  <p className="text-lg font-bold text-red-600">
                    ₹{yearlyData.totalExpenses.toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Net {yearlyData.difference >= 0 ? "Surplus" : "Deficit"}
                  </p>
                  <p
                    className={`text-lg font-bold ${
                      yearlyData.difference >= 0
                        ? "text-blue-600"
                        : "text-orange-600"
                    }`}
                  >
                    ₹{Math.abs(yearlyData.difference).toLocaleString("en-IN")}
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
