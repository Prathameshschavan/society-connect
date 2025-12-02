/* eslint-disable @typescript-eslint/no-explicit-any */
import toast from "react-hot-toast";
import {
  createOrganization,
  getAllOrganizations,
  getOrganization,
  updateOrganization,
} from "../../apis/organization.apis";
import type { GETMethodParams } from "../../types/general.types";
import type {
  IOrganization,
  TCreateOrganizationData,
} from "../../types/organization.types";
import { useProfileStore } from "../../libs/stores/useProfileStore";
import { useOrganizationStore } from "../../libs/stores/useOrganizationStore";

const useOrganizationApiService = () => {
  const { setProfileOrganization } = useProfileStore();
  const { setOrganizations } = useOrganizationStore();

  const handleGetOrganization = async (id: string) => {
    try {
      const response = await getOrganization(id);
      return response?.data?.data;
    } catch (error) {
      console.error("Organization error:", error);
      toast.error("Failed to fetch society");
    }
  };

  const handleGetAllOrganizations = async ({
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
      setOrganizations(response?.data?.data);
      return response?.data;
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
    data: Partial<IOrganization>;
  }) => {
    try {
      const response = await updateOrganization(id, data);
      setProfileOrganization(response?.data?.data);
      return response?.data?.data;
    } catch (error: any) {
      console.error("Organization error:", error);
      throw Error(error.response.data.message);
    }
  };

  const handleCreateOrganization = async (data: TCreateOrganizationData) => {
    try {
      const response = await createOrganization(data);
      return response?.data?.data;
    } catch (error: any) {
      console.error("Organization error:", error);
      throw Error(error.response.data.message);
    }
  };

  return {
    handleGetAllOrganizations,
    handleUpdateOrganization,
    handleGetOrganization,
    handleCreateOrganization,
  };
};

export default useOrganizationApiService;
