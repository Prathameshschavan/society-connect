// stores/useProfileStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { IOrganization } from "../../types/organization.types";
import type { IUnit } from "../../types/unit.types";

interface UnitState {
  unit: IUnit | null;
  loading: boolean;
  error: string | null;
  units: IUnit[];

  setUnit: (unit: IUnit | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setUnits: (units: IUnit[]) => void;
  setUnitOrganization: (org: IOrganization) => void;
  reset: () => void;
}

export const useUnitStore = create<UnitState>()(
  persist(
    (set) => ({
      // Initial state
      unit: null,
      loading: false,
      error: null,
      units: [],

      // Sync actions
      setUnit: (unit) => set({ unit }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setUnits: (units) => set({ units }),
      setUnitOrganization: (org) =>
        set((state) => ({
          unit: state.unit
            ? { ...state.unit, organization: org }
            : null,
        })),
      // Reset all state
      reset: () =>
        set({
          unit: null,
          loading: false,
          error: null,
          units: [],
        }),
    }),
    {
      name: "unit-storage", // localStorage key
      partialize: (state) => ({
        unit: state.unit,
        units: state.units,
      }), // Only persist user and profile, not loading/error states
    }
  )
);
