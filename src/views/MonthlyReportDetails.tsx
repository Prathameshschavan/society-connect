/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  IndianRupeeIcon,
  Eye,
  Calendar,
} from "lucide-react";

import GenericTable, { type TableAction } from "../components/ui/GenericTable";
import ViewIncomeModal from "../components/Modals/ViewIncomeModal";
import { ViewExpenseModal } from "../components/Modals/ViewExpenseModal";
import useIncomeService, {
  type IncomeRow,
} from "../hooks/serviceHooks/useIncomeService";
import useExpenseService from "../hooks/serviceHooks/useExpenseService";

import { useProfileStore } from "../libs/stores/useProfileStore";
import { longMonth } from "../utility/dateTimeServices";
import type { Expense } from "../libs/stores/useReportStore";
import Layout from "../components/Layout/Layout";
import usePaginationService from "../hooks/serviceHooks/usePaginationService";
import { columns as incomeColumns } from "../config/tableConfig/income";
import { columns as expenseColumns } from "../config/tableConfig/expense";

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
  const { fetchIncomes } = useIncomeService();
  const { fetchExpenses } = useExpenseService();
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
        fetchIncomes({
          page: 1,
          pageSize: 1000,
          searchQuery: "",
          sortBy: "date",
          sortOrder: "desc",
          filters: {
            month: month,
            year: year,
          },
          orgId: profile?.organization?.id,
        }),
        fetchExpenses({
          page: 1,
          pageSize: 1000,
          searchQuery: "",
          sortBy: "date",
          sortOrder: "desc",
          filters: {
            month: month,
            year: year,
          },
          orgId: profile?.organization?.id,
        }),
      ]);

      if (incomeResult) {
        setIncomeData(incomeResult.data || []);
        setIncomePagination(incomeResult?.pagination as never);
      }

      if (expenseResult) {
        setExpenseData(expenseResult.data || []);
        setExpensePagination(expenseResult?.pagination);
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
    <Layout role={"admin"}>
      {/* <h1 className="text-2xl poppins-medium flex items-center gap-2">
         - Detailed Report
      </h1> */}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className=" border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Period</p>
              <p className="text-2xl font-bold text-gray-800">{monthName}</p>
              <p className="text-xs text-gray-600 mt-1">{year}</p>
            </div>
            <Calendar className="w-8 h-8 text-gray-600" />
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Total Income</p>
              <p className="text-2xl font-bold text-green-800">
                ₹{totalIncome.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {incomeData.length} transaction
                {incomeData.length !== 1 ? "s" : ""}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Total Expenses</p>
              <p className="text-2xl font-bold text-red-800">
                ₹{totalExpenses.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-red-600 mt-1">
                {expenseData.length} transaction
                {expenseData.length !== 1 ? "s" : ""}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div
          className={`${
            difference >= 0
              ? "bg-blue-50 border-blue-200"
              : "bg-orange-50 border-orange-200"
          } border rounded-lg p-6`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`${
                  difference >= 0 ? "text-blue-600" : "text-orange-600"
                } text-sm font-medium`}
              >
                Net {difference >= 0 ? "Surplus" : "Deficit"}
              </p>
              <p
                className={`text-2xl font-bold ${
                  difference >= 0 ? "text-blue-800" : "text-orange-800"
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
                {difference >= 0 ? "Positive balance" : "Negative balance"}
              </p>
            </div>
            <IndianRupeeIcon
              className={`w-8 h-8 ${
                difference >= 0 ? "text-blue-600" : "text-orange-600"
              }`}
            />
          </div>
        </div>
      </div>

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

      {/* Summary Footer */}
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Period</p>
            <p className="text-lg font-bold text-gray-900">
              {monthName} {year}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Income</p>
            <p className="text-lg font-bold text-green-600">
              ₹{totalIncome.toLocaleString("en-IN")}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Expenses</p>
            <p className="text-lg font-bold text-red-600">
              ₹{totalExpenses.toLocaleString("en-IN")}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">
              Net {difference >= 0 ? "Surplus" : "Deficit"}
            </p>
            <p
              className={`text-lg font-bold ${
                difference >= 0 ? "text-blue-600" : "text-orange-600"
              }`}
            >
              {difference >= 0 ? "+" : ""}₹
              {Math.abs(difference).toLocaleString("en-IN")}
            </p>
          </div>
        </div>
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
