import toast from "react-hot-toast";
import type { GETMethodParams } from "../../types/general.types";
import {
  deleteUnit,
  getAllUnits,
  updateUnit,
  addUnit,
} from "../../apis/unit.apis";
import { useUnitStore } from "../../libs/stores/useUnitStore";
import type { IUnit } from "../../types/unit.types";

const useUnitApiService = () => {
  const { setUnits } = useUnitStore();

  const handleAddUnit = async (data: IUnit) => {
    try {
      const response = await addUnit(data);
      console.log(response);
      return response?.data?.data;
    } catch (error: any) {
      console.log(error);
      throw Error(error.response.data.message);
    }
  };

  const handleGetAllUnits = async ({
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
      const response = await getAllUnits({
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
      setUnits(response?.data?.data);
      return response?.data;
    } catch (error) {
      console.error("Profile error:", error);
      toast.error("Failed to fetch residents");
    }
  };

  const handleUpdateUnit = async ({
    id,
    data,
  }: {
    id: string;
    data: IUnit;
  }) => {
    try {
      const response = await updateUnit(id, data);
      return response?.data?.data;
    } catch (error: any) {
      console.error("Profile error:", error);
      throw Error(error.response.data.message);
    }
  };

  const handleDeleteUnit = async (id: string) => {
    try {
      const response = await deleteUnit(id);
      toast.success("Profile deleted successfully!");
      return response?.data?.data;
    } catch (error) {
      console.error("Profile error:", error);
      toast.error("Failed to delete profile");
    }
  };

  return {
    handleGetAllUnits,
    handleUpdateUnit,
    handleDeleteUnit,
    handleAddUnit,
  };
};

export default useUnitApiService;
