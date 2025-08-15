// stores/useProfileStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Profile, User } from "../../types/user.types";

interface ProfileState {
  // State
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  residents: Profile[];

  // Actions
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setResidents: (residents: Profile[]) => void;

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
      }), // Only persist user and profile, not loading/error states
    }
  )
);
