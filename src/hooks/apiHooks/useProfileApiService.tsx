import toast from "react-hot-toast";
import type { GETMethodParams } from "../../types/general.types";
import { getAllProfiles, updateProfile } from "../../apis/profile.apis";
import { useProfileStore } from "../../libs/stores/useProfileStore";
import type { IProfile } from "../../types/user.types";

const useProfileApiService = () => {
  const { setResidents, setProfile } = useProfileStore();

  const handleGetAllProfiles = async ({
    is_tenant,
    limit,
    order,
    organization_id,
    page,
    role,
    search,
    sortBy,
  }: GETMethodParams) => {
    try {
      const response = await getAllProfiles({
        is_tenant,
        limit,
        order,
        organization_id,
        page,
        role,
        search,
        sortBy,
      });
      setResidents(response?.data?.data);
      return response?.data;
    } catch (error) {
      console.error("Profile error:", error);
      toast.error("Failed to fetch residents");
    }
  };

  const handleUpdateProfile = async ({
    id,
    data,
  }: {
    id: string;
    data: IProfile;
  }) => {
    try {
      const response = await updateProfile(id, data);
      setProfile(response?.data?.data);
      toast.success("Profile updated successfully!");
      return response?.data?.data;
    } catch (error) {
      console.error("Profile error:", error);
      toast.error("Failed to update profile");
    }
  };

  return { handleGetAllProfiles, handleUpdateProfile };
};

export default useProfileApiService;
