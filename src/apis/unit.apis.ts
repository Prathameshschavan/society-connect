import api from "../libs/axios";
import type { GETMethodParams } from "../types/general.types";
import type { IUnit } from "../types/unit.types";

export const getUnit = async (id: string) => {
  return await api.get(`units/${id}`);
};

export const addUnit = async (data: IUnit) => {
  return await api.post(`units`, data);
};

export const getAllUnits = async ({
  is_tenant,
  limit,
  order,
  organization_id,
  page,
  role,
  search,
  sortBy,
}: GETMethodParams) => {
  const params = new URLSearchParams();

  if (is_tenant !== undefined) params.append("is_tenant", String(is_tenant));
  if (limit !== undefined) params.append("limit", String(limit));
  if (order) params.append("order", order);
  if (organization_id) params.append("organization_id", organization_id);
  if (page !== undefined) params.append("page", String(page));
  if (role) params.append("role", role);
  if (search) params.append("search", search);
  if (sortBy) params.append("sortBy", sortBy);

  const queryString = params.toString();

  const url = queryString ? `units?${queryString}` : "units";

  return await api.get(url);
};

export const updateUnit = async (id: string, data: IUnit) => {
  return await api.put(`units/${id}`, data);
};

export const deleteUnit = async (id: string) => {
  return await api.delete(`units/${id}`);
};
