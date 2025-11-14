import toast from "react-hot-toast";
import { getAllOrganizations } from "../../apis/organization.apis";
import type { GETMethodParams } from "../../types/general.types";

const useOrganizationApiService = () => {
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
      console.error("Profile error:", error);
      toast.error("Failed to fetch residents");
    }
  };

  
  return { handleGetAllProfiles };
};

export default useOrganizationApiService;
