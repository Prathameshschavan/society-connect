import { useState, useEffect } from "react";
import { useProfileStore } from "../../libs/stores/useProfileStore";
import {
  currYear,
  longMonth,
} from "../../utility/dateTimeServices";
import { getAllIncome } from "../../apis/income.apis";
import { getAllExpenses } from "../../apis/expense.apis";
import type { IncomeRow } from "../serviceHooks/useIncomeService";

export interface MonthlyData {
  month: number;
  year: number;
  income: number;
  expenses: number;
  difference: number;
  monthName: string;
  runningBalance?: number;
}

export interface YearTotals {
  totalIncome: number;
  totalExpenses: number;
  difference: number;
}

export const useDashboardData = (year: string = currYear) => {
  const [loading, setLoading] = useState(false);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [yearlyTotals, setYearlyTotals] = useState<YearTotals>({
    totalIncome: 0,
    totalExpenses: 0,
    difference: 0,
  });

  
  const { profile } = useProfileStore();

  const loadData = async () => {
    setLoading(true);
    try {
      const [incomeResult, expenseResult] = await Promise.all([
        getAllIncome({
          page: 1,
          limit: 1000,
          sortBy: "date",
          order: "desc",
          year: Number(year),
          organization_id: profile?.organization?.id as string,
        }),
        getAllExpenses({
          page: 1,
          limit: 1000,
          sortBy: "date",
          order: "desc",
          year: Number(year),
          organization_id: profile?.organization?.id as string,
        }),
      ]);

      if (incomeResult && expenseResult) {
        const monthlyBreakdown: MonthlyData[] = [];
        let totalIncome = 0;
        let totalExpenses = 0;
        let runningBalance = 0;

        console.log(incomeResult.data);
        console.log(expenseResult.data);

        for (let month = 1; month <= 12; month++) {
          const monthIncome = incomeResult.data?.data
            .filter((income: IncomeRow) => income.month === month)
            .reduce((sum: number, income: IncomeRow) => sum + Number(income.amount), 0);

          // Assuming ExpenseRow has a 'month: number' property similar to IncomeRow
          // and 'amount' which might be a string or number.
          interface ExpenseRow {
            month: number;
            amount: string | number;
            // Add other properties of expense if they are used elsewhere and need to be typed
          }

          const monthExpenses = expenseResult.data?.data
            .filter((expense: ExpenseRow) => expense.month === month)
            .reduce((sum: number, expense: ExpenseRow) => sum + Number(expense.amount), 0);

          const difference = monthIncome - monthExpenses;
          runningBalance += difference;

          monthlyBreakdown.push({
            month,
            year: parseInt(year),
            income: monthIncome,
            expenses: monthExpenses,
            difference,
            monthName: longMonth[month - 1],
            runningBalance,
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
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  return {
    loading,
    monthlyData,
    yearlyTotals,
    refreshData: loadData,
  };
};
