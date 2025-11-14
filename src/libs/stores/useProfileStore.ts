// stores/useProfileStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { IProfile } from "../../types/user.types";

interface ProfileState {
  // State
  user: IProfile | null;
  profile: IProfile | null;
  loading: boolean;
  error: string | null;
  residents: IProfile[];

  // Actions
  setUser: (user: IProfile | null) => void;
  setProfile: (profile: IProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setResidents: (residents: IProfile[]) => void;

  reset: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      profile: null,
      loading: false,
      error: null,
      residents: [],

      // Sync actions
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setResidents: (residents) => set({ residents }),

      // Reset all state
      reset: () =>
        set({
          user: null,
          profile: null,
          loading: false,
          error: null,
        }),
    }),
    {
      name: "profile-storage", // localStorage key
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        residents: state.residents,
      }), // Only persist user and profile, not loading/error states
    }
  )
);
