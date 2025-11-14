import api from "../libs/axios";
import type { GETMethodParams } from "../types/general.types";
import type { IOrganization } from "../types/organization.types";

export const getOrganization = async (id: string) => {
  return await api.get(`organizations/${id}`);
};

export const getAllOrganizations = async ({
  limit,
  order,
  page,
  search,
  sortBy,
}: GETMethodParams) => {
  const params = new URLSearchParams();

  if (limit !== undefined) params.append("limit", String(limit));
  if (order) params.append("order", order);
  if (page !== undefined) params.append("page", String(page));
  if (search) params.append("search", search);
  if (sortBy) params.append("sortBy", sortBy);

  const queryString = params.toString();

  const url = queryString ? `organizations?${queryString}` : "organizations";

  return await api.get(url);
};

export const createOrganization = async (data: IOrganization) => {
  return await api.post("organizations", data);
};

export const updateOrganization = async (id: string, data: IOrganization) => {
  return await api.put(`organizations/${id}`, data);
};

export const deleteOrganization = async (id: string) => {
  return await api.delete(`organizations/${id}`);
}