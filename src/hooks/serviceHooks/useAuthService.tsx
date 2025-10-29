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

const useAuthService = () => {
  const { setProfile, setUser } = useProfileStore();
  const { fetchOrganization } = useOrganizationService();
  const { setResidentOrganization } = useOrganizationStore();
  const { fetchResidents } = useAdminService();

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

  return {
    signIn,
  };
};

export default useAuthService;
