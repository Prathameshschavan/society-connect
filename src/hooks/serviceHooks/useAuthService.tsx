/* eslint-disable @typescript-eslint/no-explicit-any */
import toast from "react-hot-toast";
import { supabase } from "../../libs/supabase/supabaseClient";
import { useProfileStore } from "../../libs/stores/useProfileStore";
import { useNavigate } from "react-router-dom";

const useAuthService = () => {
  const { setProfile } = useProfileStore();
  const navigate = useNavigate();

  const updatePassword = async (newPassword: string) => {
    try {
      const { profile } = useProfileStore.getState();

      if (!profile) {
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
        .from("profiles")
        .update({ must_change_password: false })
        .eq("id", profile?.id);

      if (profileUpdateError) {
        console.error("Profile update error:", profileUpdateError);
        toast.error(
          "Password updated but profile update failed. Please contact support."
        );
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

      if (profile?.role === "resident") {
        navigate("/owner");
      } else if (profile?.role === "super_admin") {
        navigate("/super-admin");
      } else {
        navigate("/");
      }
    } catch (error: unknown) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return {
    updatePassword,
  };
};

export default useAuthService;
