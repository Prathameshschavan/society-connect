// stores/useProfileStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MaintenanceBill } from "./useMaintenanceStore";

interface ResidentState {
  // State
  bills: MaintenanceBill[];

  // Actions
  setBills: (bills: MaintenanceBill[]) => void;

  reset: () => void;
}

export const useResidentStore = create<ResidentState>()(
  persist(
    (set) => ({
      bills: [],

      // Sync actions
      setBills: (bills) => set({ bills }),

      // Reset all state
      reset: () =>
        set({
          bills: [],
        }),
    }),
    {
      name: "resident-storage", // localStorage key
      partialize: (state) => ({
        bills: state?.bills,
      }), // Only persist user and profile, not loading/error states
    }
  )
);
