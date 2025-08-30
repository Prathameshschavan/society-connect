/* eslint-disable @typescript-eslint/no-explicit-any */
import toast from "react-hot-toast";
import { supabase } from "../../libs/supabase/supabaseClient";
import type { TSignIn } from "../../types/user.types";
import { useProfileStore } from "../../libs/stores/useProfileStore";
import type {
  PostgrestFilterBuilder,
  PostgrestBuilder,
} from "@supabase/postgrest-js";
import useOrganizationService from "./useOrganizationService";
import {
  useOrganizationStore,
  type Organization,
} from "../../libs/stores/useOrganizationStore";

const useAuthService = () => {
  const { setProfile, setUser } = useProfileStore();
  const { fetchOrganization } = useOrganizationService();
  const { setResidentOrganization } = useOrganizationStore();

  const signIn = async (data: TSignIn) => {
    try {
      const { error, data: userData } = await supabase.auth.signInWithPassword({
        email: `${data?.phone}@society.app`,
        password: data?.password,
      });

      if (error) {
        console.error("Sign in error:", error);
        toast.error(
          typeof error === "string" ? error : error?.message || "Login failed"
        );
        return;
      }

      if (!userData?.user) {
        toast.error("No user data received");
        return;
      }

      const { data: profileData, error: profileError }: any =
        await fetchProfile(userData?.user?.id);

      if (profileError) {
        console.error("Sign in error:", profileError);
        toast.error(
          typeof profileError === "string"
            ? profileError
            : profileError?.message || "Login failed"
        );
        return;
      }

      const orgData = await fetchOrganization({
        orgId: userData?.user?.user_metadata?.organization_id,
      });

      setProfile(profileData);
      setUser(userData?.user);
      setResidentOrganization(orgData?.data?.[0] as Organization);

      toast.success("Login successful!");
    } catch (error: unknown) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const fetchProfile = async (profileId?: string) => {
    try {
      let query:
        | PostgrestFilterBuilder<any, any, any[], "profiles", unknown>
        | PostgrestBuilder<any>;

      if (profileId) {
        query = supabase
          .from("profiles")
          .select("*")
          .eq("id", profileId)
          .single();
      } else {
        query = supabase.from("profiles").select("*");
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to fetch profile. Please try again.");
        return null;
      }

      return { data, error };
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred. Please try again.");
      return null;
    }
  };

  return {
    signIn,
  };
};

export default useAuthService;
