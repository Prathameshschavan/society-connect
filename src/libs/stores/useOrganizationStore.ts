// stores/useOrganizationStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Profile } from "../../types/user.types";

export interface Organization {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  maintenance_amount?: number;
  maintenance_rate?: number;
  total_units?: number;
  registration_number?: string;
  established_date?: string;
  created_at?: string;
  updated_at?: string;
  admin: Profile[];
}

interface OrganizationState {
  // State
  organizations: Organization[];
  residentOrganization: Organization | null;
  organizationsCount: number;
  totalUnitsCount: number;

  // Actions
  setOrganizations: (organizations: Organization[]) => void;
  setResidentOrganization: (organization: Organization | null) => void;
  reset: () => void;
  setOrganizationsCount: (value: number) => void;
  setTotalUnitsCount: (value: number) => void;

  // Getters
  getOrganizationById: (id: string) => Organization | undefined;
}

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set, get) => ({
      // Initial state
      organizations: [],
      residentOrganization: null,
      organizationsCount: 0,
      totalUnitsCount: 0,

      // Actions
      setOrganizations: (organizations) => set({ organizations }),
      setOrganizationsCount: (organizationsCount) =>
        set({ organizationsCount }),
      setTotalUnitsCount: (totalUnitsCount) => set({ totalUnitsCount }),

      setResidentOrganization: (organization) =>
        set({ residentOrganization: organization }),

      reset: () =>
        set({
          organizations: [],
          residentOrganization: null,
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
        selectedOrganization: state.residentOrganization,
      }),
    }
  )
);
