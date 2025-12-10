import api from "../libs/axios";
import type { GETMethodParams } from "../types/general.types";

export interface AddIncomeParams {
  name: string;
  organization_id: string;
  amount: number;
  date: string;
  description?: string;
  month?: number;
  year?: number;
}

export interface UpdateIncomeParams extends Partial<AddIncomeParams> {}

export const getIncome = async (id: string) => {
  return await api.get(`income/${id}`);
};

export const addIncome = async (data: AddIncomeParams) => {
  return await api.post(`income`, data);
};

export const getAllIncome = async ({
  limit,
  order,
  organization_id,
  page,
  search,
  sortBy,
  date,
  month,
  year,
}: GETMethodParams) => {
  const params = new URLSearchParams();

  if (limit !== undefined) params.append("limit", String(limit));
  if (date) params.append("date", String(date));
  if (order) params.append("order", order);
  if (organization_id) params.append("organization_id", organization_id);
  if (page !== undefined) params.append("page", String(page));
  if (search) params.append("search", search);
  if (sortBy) params.append("sortBy", sortBy);
  if (month) params.append("month", String(month));
  if (year) params.append("year", String(year));

  const queryString = params.toString();

  const url = queryString ? `income?${queryString}` : "income";

  return await api.get(url);
};

export const updateIncome = async (id: string, data: UpdateIncomeParams) => {
  return await api.put(`income/${id}`, data);
};

export const deleteIncome = async (id: string) => {
  return await api.delete(`income/${id}`);
};
