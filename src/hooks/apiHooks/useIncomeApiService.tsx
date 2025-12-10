import toast from "react-hot-toast";
import type { GETMethodParams } from "../../types/general.types";
import {
  deleteIncome,
  getAllIncome,
  updateIncome,
  addIncome,
  type AddIncomeParams,
  type UpdateIncomeParams,
} from "../../apis/income.apis";
import { useReportStore } from "../../libs/stores/useReportStore";

const useIncomeApiService = () => {
  const { setIncomes } = useReportStore();

  const handleAddIncome = async (data: AddIncomeParams) => {
    try {
      const response = await addIncome(data);
      console.log(response);
      return response?.data?.data;
    } catch (error: any) {
      console.log(error);
      throw Error(error.response.data.message);
    }
  };

  const handleGetAllIncome = async ({
    limit,
    order,
    organization_id,
    page,
    role,
    search,
    sortBy,
    month,
    year,
  }: GETMethodParams) => {
    try {
      const response = await getAllIncome({
        limit,
        order,
        organization_id,
        page,
        role,
        search,
        sortBy,
        month,
        year,
      });
      console.log(response);
      setIncomes(response?.data?.data);
      return response?.data;
    } catch (error) {
      console.error("Profile error:", error);
      toast.error("Failed to fetch residents");
    }
  };

  const handleUpdateIncome = async ({
    id,
    data,
  }: {
    id: string;
    data: UpdateIncomeParams;
  }) => {
    try {
      const response = await updateIncome(id, data);
      return response?.data?.data;
    } catch (error: any) {
      console.error("Profile error:", error);
      throw Error(error.response.data.message);
    }
  };

  const handleDeleteIncome = async (id: string) => {
    try {
      const response = await deleteIncome(id);
      toast.success("Profile deleted successfully!");
      return response?.data?.data;
    } catch (error) {
      console.error("Profile error:", error);
      toast.error("Failed to delete profile");
    }
  };

  return {
    handleGetAllIncome,
    handleUpdateIncome,
    handleDeleteIncome,
    handleAddIncome,
  };
};

export default useIncomeApiService;
