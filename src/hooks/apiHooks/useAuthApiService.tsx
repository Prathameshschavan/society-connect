import toast from "react-hot-toast";
import type { TSignIn } from "../../types/user.types";
import { signIn } from "../../apis/auth.apis";
import { useProfileStore } from "../../libs/stores/useProfileStore";
import { getProfile } from "../../apis/profile.apis";
import { supabase } from "../../libs/supabase/supabaseClient";
import { useUnitStore } from "../../libs/stores/useUnitStore";
import { useMaintenanceStore } from "../../libs/stores/useMaintenanceStore";
import { useOrganizationStore } from "../../libs/stores/useOrganizationStore";
import { useReportStore } from "../../libs/stores/useReportStore";
import { useResidentStore } from "../../libs/stores/useResidentStore";
import { useNavigate } from "react-router-dom";

const useAuthApiService = () => {
  const { setProfile, reset: resetProfile } = useProfileStore();
  const { reset: resetUnitStore } = useUnitStore();
  const { reset: resetMaintenanceStore } = useMaintenanceStore();
  const { reset: resetOrganizationStore } = useOrganizationStore();
  const { reset: resetReportStore } = useReportStore();
  const { reset: resetResidentStore } = useResidentStore();

  const navigate = useNavigate();

  const handleSignIn = async ({ password, email }: TSignIn) => {
    try {
      const response = await signIn({ email, password });

      const profile = await getProfile(response.user.id);

      setProfile(profile.data.data);

      toast.success("Sign-in successful!");
    } catch (error) {
      console.error("Sign-in error:", error);
      toast.error("Sign-in failed. Please check your credentials.");
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      resetUnitStore();
      resetMaintenanceStore();
      resetOrganizationStore();
      resetReportStore();
      resetResidentStore();
      resetProfile();
      navigate("/sign-in");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  return { handleSignIn, handleLogout };
};

export default useAuthApiService;
