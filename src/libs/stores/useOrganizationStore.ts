// stores/useOrganizationStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { IOrganization } from "../../types/organization.types";

export interface ExtraItem {
  id: string;
  name: string;
  amount: number;
  month: string;
  year: string;
}

interface OrganizationState {
  // State
  organizations: IOrganization[];
  organizationsCount: number;
  totalUnitsCount: number;

  // Actions
  setOrganizations: (organizations: IOrganization[]) => void;
  reset: () => void;
  setOrganizationsCount: (value: number) => void;
  setTotalUnitsCount: (value: number) => void;

  // Getters
  getOrganizationById: (id: string) => IOrganization | undefined;
}

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set, get) => ({
      // Initial state
      organizations: [],
      organizationsCount: 0,
      totalUnitsCount: 0,

      // Actions
      setOrganizations: (organizations) => set({ organizations }),
      setOrganizationsCount: (organizationsCount) =>
        set({ organizationsCount }),
      setTotalUnitsCount: (totalUnitsCount) => set({ totalUnitsCount }),

      reset: () =>
        set({
          organizations: [],
        }),

      // Computed getters
      getOrganizationById: (id: string) => {
        const state = get();
        return state.organizations.find((org) => org.id === id);
      },
    }),
    {
      name: "organization-storage",
      partialize: (state) => ({
        organizations: state.organizations,
        organizationsCount: state.organizationsCount,
        totalUnitsCount: state.totalUnitsCount,
      }),
    }
  )
);
