/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import type { AuthContextType, Profile, User } from "../../types/user.types";
import { supabase } from "../supabase/supabaseClient";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthContextProvider: React.FC<AuthProviderProps> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  console.log(profile, user)

  useEffect(() => {
    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        setUser(session.user);
        await fetchAndStoreProfile(session.user.id);
      } else if (event === "SIGNED_OUT") {
        handleSignOut();
      }
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const initializeAuth = async (): Promise<void> => {
    try {
      const storedSession = localStorage.getItem("supabase_session");
      const storedUser = localStorage.getItem("user_data");
      const storedProfile = localStorage.getItem("user_profile");

      if (storedSession && storedUser && storedProfile) {
        const sessionData = JSON.parse(storedSession);
        const userData = JSON.parse(storedUser);
        const profileData = JSON.parse(storedProfile);

        if (
          sessionData.expires_at &&
          new Date().getTime() < sessionData.expires_at * 1000
        ) {
          setUser(userData);
          setProfile(profileData);
          setLoading(false);
          return;
        } else {
          clearLocalStorage();
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        await fetchAndStoreProfile(session.user.id);
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
      clearLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const fetchAndStoreProfile = async (
    userId: string
  ): Promise<Profile | null> => {
    try {
      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;
      if (!profileData) throw new Error("Profile not found");

      let finalProfileData = profileData;

      // Fetch organization data if user belongs to one
      if (profileData.organization_id) {
        try {
          const { data: orgData, error: orgError } = await supabase
            .from("organizations")
            .select(
              "id, name, maintenance_rate, maintenance_amount, total_units"
            )
            .eq("id", profileData.organization_id)
            .single();

          if (!orgError && orgData) {
            finalProfileData = {
              ...profileData,
              organizations: orgData,
            };
          }
        } catch (orgFetchError) {
          console.error("Organization fetch error:", orgFetchError);
          // Continue without organization data
        }
      }

      // Store in localStorage and state
      localStorage.setItem("user_profile", JSON.stringify(finalProfileData));
      setProfile(finalProfileData as Profile);

      return finalProfileData as Profile;
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
      return null;
    }
  };

  const clearLocalStorage = (): void => {
    localStorage.removeItem("supabase_session");
    localStorage.removeItem("user_data");
    localStorage.removeItem("user_profile");
  };

  const handleSignOut = async (): Promise<void> => {
    setUser(null);
    setProfile(null);
    clearLocalStorage();
  };

  // Enhanced signIn function that handles everything
  const signIn = async (
    phone: string,
    password: string
  ): Promise<{
    data: any;
    error: any;
    profile?: Profile | null;
  }> => {
    try {
      console.log(phone, password, "Data");
      const syntheticEmail = `${phone}@society.app`;
      const { data, error } = await supabase.auth.signInWithPassword({
        email: syntheticEmail,
        password,

      });

      if (error) return { data: null, error };
      if (!data.user || !data.session) return { data, error: "No user data" };

      // Store session data
      localStorage.setItem(
        "supabase_session",
        JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
          user: data.user,
        })
      );

      localStorage.setItem("user_data", JSON.stringify(data.user));
      setUser(data.user);

      // Fetch and store profile
      const profile = await fetchAndStoreProfile(data.user.id);

      return { data, error: null, profile };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async (): Promise<{ error: unknown }> => {
    console.log("object")
    const { error } = await supabase.auth.signOut();
    if (!error) {
      handleSignOut();
    }
    
    return { error };
  };

  const fetchUserProfile = async (userId: string): Promise<void> => {
    await fetchAndStoreProfile(userId);
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signIn,
    signOut,
    fetchUserProfile,
    setUser,
    setProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
