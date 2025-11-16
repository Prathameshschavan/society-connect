import toast from "react-hot-toast";
import {
  getAllOrganizations,
  updateOrganization,
} from "../../apis/organization.apis";
import type { GETMethodParams } from "../../types/general.types";
import type { IOrganization } from "../../types/organization.types";
import { useProfileStore } from "../../libs/stores/useProfileStore";

const useOrganizationApiService = () => {
  const { setProfileOrganization } = useProfileStore();
  const handleGetAllProfiles = async ({
    limit,
    order,
    page,
    search,
    sortBy,
  }: GETMethodParams) => {
    try {
      const response = await getAllOrganizations({
        limit,
        order,
        page,
        search,
        sortBy,
      });
      console.log(response);
    } catch (error) {
      console.error("Organization error:", error);
      toast.error("Failed to fetch society");
    }
  };

  const handleUpdateOrganization = async ({
    id,
    data,
  }: {
    id: string;
    data: IOrganization;
  }) => {
    try {
      const response = await updateOrganization(id, data);
      setProfileOrganization(response?.data?.data);
      toast.success("Society updated successfully!");
      return response?.data?.data;
    } catch (error) {
      console.error("Organization error:", error);
      toast.error("Failed to update society");
    }
  };

  return { handleGetAllProfiles, handleUpdateOrganization };
};

export default useOrganizationApiService;
