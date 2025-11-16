// stores/useProfileStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { IProfile } from "../../types/user.types";
import type { IOrganization } from "../../types/organization.types";

interface ProfileState {
  profile: IProfile | null;
  loading: boolean;
  error: string | null;
  residents: IProfile[];

  setProfile: (profile: IProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setResidents: (residents: IProfile[]) => void;
  setProfileOrganization: (org: IOrganization) => void;
  reset: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      // Initial state
      profile: null,
      loading: false,
      error: null,
      residents: [],

      // Sync actions
      setProfile: (profile) => set({ profile }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setResidents: (residents) => set({ residents }),
      setProfileOrganization: (org) =>
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, organization: org }
            : null,
        })),
      // Reset all state
      reset: () =>
        set({
          profile: null,
          loading: false,
          error: null,
        }),
    }),
    {
      name: "profile-storage", // localStorage key
      partialize: (state) => ({
        profile: state.profile,
        residents: state.residents,
      }), // Only persist user and profile, not loading/error states
    }
  )
);
