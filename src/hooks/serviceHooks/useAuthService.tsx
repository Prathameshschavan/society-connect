// hooks/useAuth.ts
import { useState, useCallback, useEffect } from "react";
import { type User, type Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "../../libs/supabase/supabaseClient";

export interface UserProfile {
  id: string;
  organization_id?: string;
  flat_number?: string;
  name: string;
  phone?: string;
  email: string;
  role: "super_admin" | "admin" | "resident";
  must_change_password: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SignUpData {
  password: string;
  name: string;
  phone?: string;
  organizationId?: string;
  flatNumber?: string;
  role?: "admin" | "resident";
  square_footage?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  flat_number?: string;
}

interface UseAuthReturn {
  // State
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  signUp: (data: SignUpData) => Promise<{
    success: boolean;
    data?: { user: User };
    error?: string;
    message?: string;
  }>;
  signIn: (data: SignInData) => Promise<{
    success: boolean;
    data?: { user: User; session: Session };
    error?: string;
    message?: string;
  }>;
  signOut: () => Promise<{
    success: boolean;
    error?: string;
    message?: string;
  }>;
  updateProfile: (updates: UpdateProfileData) => Promise<{
    success: boolean;
    data?: UserProfile;
    error?: string;
    message?: string;
  }>;
  changePassword: (newPassword: string) => Promise<{
    success: boolean;
    error?: string;
    message?: string;
  }>;
  resetPassword: (email: string) => Promise<{
    success: boolean;
    error?: string;
    message?: string;
  }>;

  // Utilities
  clearError: () => void;
  refreshProfile: () => Promise<void>;
}

export const useAuthService = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear error utility
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch user profile
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);

      try {
        // Get initial session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
          setError(error.message);
        } else if (session) {
          setSession(session);
          setUser(session.user);

          // Fetch user profile
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setError("Failed to initialize authentication");
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: unknown, session) => {
      console.log("Auth state changed:", event);

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const profileData = await fetchProfile(session.user.id);
        setProfile(profileData);
      } else {
        setProfile(null);
      }

      setIsInitialized(true);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // Sign up
  const signUp = useCallback(async (data: SignUpData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Create auth user
      const syntheticEmail = `${data.phone}@society.app`;
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: syntheticEmail,
        password: data.password,
        options: {
          data: {
            role: data.role,
            full_name: data.name,
            phone: data.phone,
            must_change_password: false,
            unit_number: data?.flatNumber,
            square_footage: data?.square_footage,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error("Failed to create user");
      }

      return {
        success: true,
        data: { user: authData.user },
        message:
          "Account created successfully! Please check your email to verify your account.",
      };
    } catch (error) {
      console.error("Sign up error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create account";
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sign in
  const signIn = useCallback(async (data: SignInData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: { user: authData.user, session: authData.session },
        message: "Signed in successfully!",
      };
    } catch (error) {
      console.error("Sign in error:", error);
      const errorMessage =
        error instanceof AuthError ? error.message : "Failed to sign in";
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setUser(null);
      setProfile(null);
      setSession(null);

      return {
        success: true,
        message: "Signed out successfully!",
      };
    } catch (error) {
      console.error("Sign out error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to sign out";
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(
    async (updates: UpdateProfileData) => {
      if (!user) {
        return {
          success: false,
          error: "No user logged in",
        };
      }

      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("users")
          .update(updates)
          .eq("id", user.id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        setProfile(data);

        return {
          success: true,
          data,
          message: "Profile updated successfully!",
        };
      } catch (error) {
        console.error("Update profile error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update profile";
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  // Change password
  const changePassword = useCallback(
    async (newPassword: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) {
          throw error;
        }

        // Update must_change_password flag
        if (user && profile?.must_change_password) {
          await updateProfile({ name: profile.name }); // Trigger profile update
          await supabase
            .from("users")
            .update({ must_change_password: false })
            .eq("id", user.id);
        }

        return {
          success: true,
          message: "Password changed successfully!",
        };
      } catch (error) {
        console.error("Change password error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to change password";
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [user, profile, updateProfile]
  );

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: "Password reset email sent! Please check your inbox.",
      };
    } catch (error) {
      console.error("Reset password error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send reset email";
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    if (!user) return;

    const profileData = await fetchProfile(user.id);
    setProfile(profileData);
  }, [user, fetchProfile]);

  return {
    // State
    user,
    profile,
    session,
    isLoading,
    isInitialized,
    error,

    // Actions
    signUp,
    signIn,
    signOut,
    updateProfile,
    changePassword,
    resetPassword,

    // Utilities
    clearError,
    refreshProfile,
  };
};
