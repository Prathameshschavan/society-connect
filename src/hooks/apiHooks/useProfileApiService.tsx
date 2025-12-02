import toast from "react-hot-toast";
import type { GETMethodParams } from "../../types/general.types";
import {
  deleteProfile,
  getAllProfiles,
  updateProfile,
} from "../../apis/profile.apis";
import { useProfileStore } from "../../libs/stores/useProfileStore";
import type { IProfile } from "../../types/user.types";
import { addResident, type AddResidentParams } from "../../apis/resident.apis";

const useProfileApiService = () => {
  const { setResidents } = useProfileStore();

  const handleAddProfile = async (data: AddResidentParams) => {
    try {
      const response = await addResident(data);
      console.log(response);
      return response?.data?.data;
    } catch (error: any) {
      console.log(error);
      throw Error(error.response.data.message);
    }
  };
  // const handleAddProfile = async (data: IProfile) => {
  //   try {
  //     const response = await addUser({
  //       email: `${data?.phone}@society.app`,
  //       password: "123456",
  //       organization_id: data?.organization_id as string,
  //     });

  //     console.log(response);

  //     await updateProfile(response?.data?.data?.id, data);
  //   } catch (error: any) {
  //     throw Error(error.response.data.message);
  //   }
  // };

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
      console.log(response);
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
      return response?.data?.data;
    } catch (error: any) {
      console.error("Profile error:", error);
      throw Error(error.response.data.message);
    }
  };

  const handleDeleteProfile = async (id: string) => {
    try {
      const response = await deleteProfile(id);
      toast.success("Profile deleted successfully!");
      return response?.data?.data;
    } catch (error) {
      console.error("Profile error:", error);
      toast.error("Failed to delete profile");
    }
  };

  return {
    handleGetAllProfiles,
    handleUpdateProfile,
    handleDeleteProfile,
    handleAddProfile,
  };
};

export default useProfileApiService;
