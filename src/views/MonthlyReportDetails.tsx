/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  IndianRupeeIcon,
  Eye,
  Calendar,
  LayoutDashboard,
} from "lucide-react";

import GenericTable, { type TableAction } from "../components/ui/GenericTable";
import ViewIncomeModal from "../components/Modals/ViewIncomeModal";
import { ViewExpenseModal } from "../components/Modals/ViewExpenseModal";
import  {
  type IncomeRow,
} from "../hooks/serviceHooks/useIncomeService";
import { useProfileStore } from "../libs/stores/useProfileStore";
import { longMonth } from "../utility/dateTimeServices";
import type { Expense } from "../libs/stores/useReportStore";
import Layout from "../components/Layout/Layout";
import usePaginationService from "../hooks/serviceHooks/usePaginationService";
import { columns as incomeColumns } from "../config/tableConfig/income";
import { columns as expenseColumns } from "../config/tableConfig/expense";
import { getAllIncome } from "../apis/income.apis";
import { getAllExpenses } from "../apis/expense.apis";

const MonthlyReportDetails = () => {
  const [searchParams] = useSearchParams();

  const month = searchParams.get("month") || "";
  const year = searchParams.get("year") || "";

  const [loading, setLoading] = useState(false);
  const [incomeData, setIncomeData] = useState<IncomeRow[]>([]);
  const [expenseData, setExpenseData] = useState<Expense[]>([]);
  const [selectedIncome, setSelectedIncome] = useState<IncomeRow | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Modal states for Income
  const [isOpenViewIncomeModal, setIsOpenViewIncomeModal] = useState(false);

  // Modal states for Expense
  const [isOpenViewExpenseModal, setIsOpenViewExpenseModal] = useState(false);

  const { profile } = useProfileStore();
  const { setPagination: setIncomePagination, pagination: incomePagination } =
    usePaginationService();
  const { setPagination: setExpensePagination, pagination: expensePagination } =
    usePaginationService();

  // Calculate totals
  const totalIncome = incomeData.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );
  const totalExpenses = expenseData.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );
  const difference = totalIncome - totalExpenses;

  // Get month name
  const monthIndex = parseInt(month) - 1;
  const monthName =
    monthIndex >= 0 && monthIndex < 12 ? longMonth[monthIndex] : "Unknown";

  // Load data
  const loadData = async () => {
    if (!month || !year) return;

    setLoading(true);
    try {
      const [incomeResult, expenseResult] = await Promise.all([
        getAllIncome({
          page: 1,
          limit: 1000,
          sortBy: "date",
          order: "desc",
          month: Number(month),
          year: Number(year),
          organization_id: profile?.organization?.id,
        }),
        getAllExpenses({
          page: 1,
          limit: 1000,
          sortBy: "date",
          order: "desc",
          month: Number(month),
          year: Number(year),
          organization_id: profile?.organization?.id,
        }),
      ]);

      if (incomeResult) {
        setIncomeData(incomeResult.data?.data || []);
        setIncomePagination(incomeResult?.data?.meta as never);
      }

      if (expenseResult) {
        setExpenseData(expenseResult.data?.data || []);
        setExpensePagination(expenseResult?.data?.meta as never);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  // Income table actions with role-based access
  const incomeActions: TableAction<IncomeRow>[] = [
    {
      icon: <Eye className="w-4 h-4" />,
      onClick: (income: IncomeRow) => {
        setSelectedIncome(income);
        setIsOpenViewIncomeModal(true);
      },
      className:
        "cursor-pointer p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors",
      label: "View",
    },
  ];

  // Expense table actions with role-based access
  const expenseActions: TableAction<Expense>[] = [
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
  ];

  return (
    <Layout
      role={"admin"}
      visibileTopSection={false}
      pageHeader={{
        title: "Monthly Report",
        description: `Detailed financial report for ${monthName} ${year}`,
        icon: <LayoutDashboard className="w-6 h-6 text-[#0154AC]" />,
      }}
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border hover:shadow-md transition-shadow duration-200 border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Period</p>
              <p className="text-2xl font-bold text-gray-800">{monthName}</p>
              <p className="text-xs text-gray-500 mt-1">{year}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-full">
              <Calendar className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border hover:shadow-md transition-shadow duration-200 border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">
                Total Income
              </p>
              <p className="text-2xl font-bold text-green-600">
                ₹{totalIncome.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {incomeData.length} transaction
                {incomeData.length !== 1 ? "s" : ""}
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
                ₹{totalExpenses.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-red-600 mt-1">
                {expenseData.length} transaction
                {expenseData.length !== 1 ? "s" : ""}
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
                  difference >= 0 ? "text-blue-600" : "text-orange-600"
                }`}
              >
                {difference >= 0 ? "+" : "-"}₹
                {Math.abs(difference).toLocaleString("en-IN")}
              </p>
              <p
                className={`text-xs mt-1 ${
                  difference >= 0 ? "text-blue-600" : "text-orange-600"
                }`}
              >
                {difference >= 0 ? "Surplus" : "Deficit"}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <IndianRupeeIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Income Table */}
        <GenericTable
            title="Income Details"
            columns={incomeColumns}
            data={incomeData as any}
            actions={incomeActions}
            loading={loading}
            emptyMessage="No income records found for this month"
            searchPlaceholder=""
            showPagination={false}
            pagination={incomePagination}
            onSearch={() => {}}
          />

        {/* Expense Table */}
          <GenericTable
            title="Expense Details"
            columns={expenseColumns}
            data={expenseData as any}
            actions={expenseActions}
            loading={loading}
            emptyMessage="No expense records found for this month"
            searchPlaceholder=""
            showPagination={false}
            pagination={expensePagination}
            onSearch={() => {}}
          />
      </div>

      {/* Income Modals */}
      {selectedIncome && (
        <>
          <ViewIncomeModal
            isOpen={isOpenViewIncomeModal}
            onClose={() => {
              setIsOpenViewIncomeModal(false);
              setSelectedIncome(null);
            }}
            income={selectedIncome}
          />
        </>
      )}

      {/* Expense Modals */}
      {selectedExpense && (
        <>
          <ViewExpenseModal
            isOpen={isOpenViewExpenseModal}
            onClose={() => {
              setIsOpenViewExpenseModal(false);
              setSelectedExpense(null);
            }}
            expense={selectedExpense}
          />
        </>
      )}
    </Layout>
  );
};

export default MonthlyReportDetails;
