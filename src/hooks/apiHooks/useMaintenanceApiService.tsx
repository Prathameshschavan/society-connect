import toast from "react-hot-toast";
import type { GETMethodParams } from "../../types/general.types";
import {
  deleteUnit,
} from "../../apis/unit.apis";
import { useMaintenanceStore } from "../../libs/stores/useMaintenanceStore";
import {
  createMaintenanceBill,
  getAllMaintenanceBills,
  updateMaintenanceBill,
  type ICreateMaintenanceBillParams,
} from "../../apis/maintenance.apis";
import type { TBillStatus } from "../../types/maintenance.types";

const useMaintenanceApiService = () => {
  const { setMaintenanceBills } = useMaintenanceStore();

  const handleCreateMaintenanceBill = async (
    input: ICreateMaintenanceBillParams
  ) => {
    try {
      const response = await createMaintenanceBill(input);
      console.log(response);
      return response?.data?.data;
    } catch (error: any) {
      console.log(error);
      throw Error(error.response.data.message);
    }
  };

  const handleGetMaintenanceBills = async ({
    limit,
    order,
    organization_id,
    page,
    search,
    sortBy,
    bill_month,
    bill_year,
  }: GETMethodParams) => {
    try {
      const response = await getAllMaintenanceBills({
        limit,
        order,
        organization_id,
        page,
        search,
        sortBy,
        bill_month,
        bill_year,
      });
      console.log(response);
      setMaintenanceBills(response?.data?.data);
      return response?.data;
    } catch (error) {
      console.error("Profile error:", error);
    }
  };

  const handleUpdateMaintenanceBill = async ({
    id,
    status,
  }: {
    id: string;
    status: TBillStatus;
  }) => {
    try {
      const response = await updateMaintenanceBill(id, status);
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
    handleGetMaintenanceBills,
    handleUpdateMaintenanceBill,
    handleDeleteUnit,
    handleCreateMaintenanceBill,
  };
};

export default useMaintenanceApiService;
