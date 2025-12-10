// stores/useProfileStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { IncomeRow } from "../../hooks/serviceHooks/useIncomeService";

export type IncomeFormValues = {
  name: string;
  description: string | null;
  amount: number;
  date: string;
  month: string;
  year: string;
  organization_id: string;
};

export type ExpenseFormValues = {
  name: string;
  description: string | null;
  image_url: string | null; // Receipt image or headshot
  receiver_name: string; // Person who received the payment
  amount: number;
  date: string;
  month: string;
  year: string;
  organization_id: string;
  status: "paid" | "pending";
  files: {
    type: string;
    name: string;
    url: string;
  }[];
};

export type Expense = ExpenseFormValues & {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
};

interface ReportState {
  incomes: IncomeRow[];
  setIncomes: (incomes: IncomeRow[]) => void;
  expenses: Expense[];
  setExpenses: (expenses: Expense[]) => void;
  // Reset all state
  reset: () => void;
}

export const useReportStore = create<ReportState>()(
  persist(
    (set) => ({
      incomes: [],
      setIncomes: (incomes) => set({ incomes }),
      expenses: [],
      setExpenses: (expenses) => set({ expenses }),

      // Reset all state
      reset: () =>
        set({
          incomes: [],
          expenses: [],
        }),
    }),
    {
      name: "resident-storage", // localStorage key
      partialize: (state) => ({
        incomes: state?.incomes,
      }), // Only persist user and profile, not loading/error states
    }
  )
);
