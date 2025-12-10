import api from "../libs/axios";
import type { GETMethodParams } from "../types/general.types";

export interface AddExpenseParams {
  name: string;
  organization_id: string;
  description: string;
  receiver_name: string;
  amount: number;
  date: string;
  status: "paid" | "pending";
  files: {
    type: string;
    name: string;
    url: string;
  }[];
}

export interface UpdateExpenseParams extends Partial<AddExpenseParams> {}

export const getExpense = async (id: string) => {
  return await api.get(`expenses/${id}`);
};

export const addExpense = async (data: AddExpenseParams) => {
  return await api.post(`expenses`, data);
};

export const getAllExpenses = async ({
  limit,
  order,
  organization_id,
  page,
  search,
  sortBy,
  status,
  date,
  month,
  year,
}: GETMethodParams) => {
  const params = new URLSearchParams();

  if (limit !== undefined) params.append("limit", String(limit));
  if (status) params.append("status", String(status));
  if (date) params.append("date", String(date));
  if (order) params.append("order", order);
  if (organization_id) params.append("organization_id", organization_id);
  if (page !== undefined) params.append("page", String(page));
  if (search) params.append("search", search);
  if (sortBy) params.append("sortBy", sortBy);
  if (month) params.append("month", String(month));
  if (year) params.append("year", String(year));

  const queryString = params.toString();

  const url = queryString ? `expenses?${queryString}` : "expenses";

  return await api.get(url);
};

export const updateExpense = async (id: string, data: UpdateExpenseParams) => {
  return await api.put(`expenses/${id}`, data);
};

export const deleteExpense = async (id: string) => {
  return await api.delete(`expenses/${id}`);
};
