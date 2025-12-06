import api from "../libs/axios";
import type { GETMethodParams } from "../types/general.types";
import type { TBillStatus } from "../types/maintenance.types";

export const getMaintenanceBill = async (id: string) => {
  return await api.get(`maintenance-bill/${id}`);
};

export const getAllMaintenanceBills = async ({
  limit,
  order,
  organization_id,
  page,
  search,
  sortBy,
  bill_month,
  bill_year,
}: GETMethodParams) => {
  const params = new URLSearchParams();

  if (limit !== undefined) params.append("limit", String(limit));
  if (order) params.append("order", order);
  if (organization_id) params.append("organization_id", organization_id);
  if (page !== undefined) params.append("page", String(page));
  if (search) params.append("search", search);
  if (sortBy) params.append("sortBy", sortBy);
  if (bill_month) params.append("bill_month", String(bill_month));
  if (bill_year) params.append("bill_year", String(bill_year));

  const queryString = params.toString();

  const url = queryString
    ? `maintenance-bill?${queryString}`
    : "maintenance-bill";

  return await api.get(url);
};

export const updateMaintenanceBill = async (id: string, status: TBillStatus) => {
  return await api.put(`maintenance-bill/${id}`, { status });
};

export interface ICreateMaintenanceBillParams {
  organization_id: string;
  bill_month: number;
  bill_year: number;
}

export const createMaintenanceBill = async (
  input: ICreateMaintenanceBillParams
) => {
  return await api.post(`maintenance-bill`, input);
};
