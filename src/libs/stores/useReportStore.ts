// stores/useProfileStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { IncomeRow } from "../../hooks/serviceHooks/useIncomeService";

interface ReportState {
  incomes: IncomeRow[];
  setIncomes: (incomes: IncomeRow[]) => void;
}

export const useReportStore = create<ReportState>()(
  persist(
    (set) => ({
      incomes: [],
      setIncomes: (incomes) => set({ incomes }),

      // Reset all state
      reset: () =>
        set({
          incomes: [],
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
