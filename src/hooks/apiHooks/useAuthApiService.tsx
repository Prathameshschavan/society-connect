import toast from "react-hot-toast";
import type { TSignIn } from "../../types/user.types";
import { signIn } from "../../apis/auth.apis";
import { useProfileStore } from "../../libs/stores/useProfileStore";
import { getProfile } from "../../apis/profile.apis";

const useAuthApiService = () => {
  const { setProfile } = useProfileStore();

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

  return { handleSignIn };
};

export default useAuthApiService;
