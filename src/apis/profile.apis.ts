import api from "../libs/axios";
import type { GETMethodParams } from "../types/general.types";
import type { IProfile } from "../types/user.types";

export const getProfile = async (id: string) => {
  return await api.get(`profiles/${id}`);
};

export const getAllProfiles = async ({
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

  const url = queryString ? `profiles?${queryString}` : "profiles";

  return await api.get(url);
};

export const updateProfile = async (id: string, data: IProfile) => {
  return await api.put(`profiles/${id}`, data);
};

export const deleteProfile = async (id: string) => {
  return await api.put(`profiles/${id}`);
};
