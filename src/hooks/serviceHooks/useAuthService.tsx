/* eslint-disable @typescript-eslint/no-explicit-any */
import toast from "react-hot-toast";
import { supabase } from "../../libs/supabase/supabaseClient";
import type { TSignIn } from "../../types/user.types";
import { useProfileStore } from "../../libs/stores/useProfileStore";
import useOrganizationService from "./useOrganizationService";
import {
  useOrganizationStore,
  type Organization,
} from "../../libs/stores/useOrganizationStore";
import useAdminService from "./useAdminService";
import { useNavigate } from "react-router-dom";

const useAuthService = () => {
  const { setProfile, setUser } = useProfileStore();
  const { fetchOrganization } = useOrganizationService();
  const { setResidentOrganization } = useOrganizationStore();
  const { fetchResidents } = useAdminService();
  const navigate = useNavigate();

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

      const { data: profileData, error: profileError } =
        await supabase.functions.invoke("get-profile-doc", {
          body: { id: userData?.user?.id },
        });

      if (profileError) {
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

      fetchResidents({
        sortOrder: "asc",
        sortBy: "unit_number",
        page: 1,
        pageSize: 999,
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

  const updatePassword = async (newPassword: string) => {
    try {
      const { profile, user } = useProfileStore.getState();

      if (!user) {
        toast.error("User not found. Please sign in again.");
        return;
      }

      // Update password in Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        console.error("Password update error:", updateError);
        toast.error(
          typeof updateError === "string"
            ? updateError
            : updateError?.message || "Failed to update password"
        );
        return;
      }

      // Update must_change_password flag in profiles table
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ must_change_password: false })
        .eq('id', profile?.id);

      if (profileUpdateError) {
        console.error("Profile update error:", profileUpdateError);
        toast.error("Password updated but profile update failed. Please contact support.");
        return;
      }

      // Update local profile state
      if (profile) {
        setProfile({
          ...profile,
          must_change_password: false,
        });
      }

      toast.success("Password changed successfully!");
      navigate("/");
    } catch (error: unknown) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };


  return {
    signIn,
    updatePassword,
  };
};

export default useAuthService;
