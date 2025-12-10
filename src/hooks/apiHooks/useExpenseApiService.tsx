import toast from "react-hot-toast";
import type { GETMethodParams } from "../../types/general.types";
import {
  deleteExpense,
  getAllExpenses,
  updateExpense,
  addExpense,
  type AddExpenseParams,
  type UpdateExpenseParams,
} from "../../apis/expense.apis";
import { useReportStore } from "../../libs/stores/useReportStore";

const useExpenseApiService = () => {
  const { setExpenses } = useReportStore();

  const handleAddExpense = async (data: AddExpenseParams) => {
    try {
      const response = await addExpense(data);
      console.log(response);
      return response?.data?.data;
    } catch (error: any) {
      console.log(error);
      throw Error(error.response.data.message);
    }
  };

  const handleGetAllExpenses = async ({
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
      const response = await getAllExpenses({
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
      setExpenses(response?.data?.data);
      return response?.data;
    } catch (error) {
      console.error("Profile error:", error);
      toast.error("Failed to fetch residents");
    }
  };

  const handleUpdateExpense = async ({
    id,
    data,
  }: {
    id: string;
    data: UpdateExpenseParams;
  }) => {
    try {
      const response = await updateExpense(id, data);
      return response?.data?.data;
    } catch (error: any) {
      console.error("Profile error:", error);
      throw Error(error.response.data.message);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      const response = await deleteExpense(id);
      toast.success("Profile deleted successfully!");
      return response?.data?.data;
    } catch (error) {
      console.error("Profile error:", error);
      toast.error("Failed to delete profile");
    }
  };

  return {
    handleGetAllExpenses,
    handleUpdateExpense,
    handleDeleteExpense,
    handleAddExpense,
  };
};

export default useExpenseApiService;
