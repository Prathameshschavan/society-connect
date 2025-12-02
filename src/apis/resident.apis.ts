import api from "../libs/axios";
import type { IProfile } from "../types/user.types";

export type AddResidentParams = Pick<
  IProfile,
  | "full_name"
  | "phone"
  | "role"
  | "emergency_contact"
  | "family_members"
  | "vehicles"
  | "is_tenant"
> & { user: { email: string; password: string } } & { organization_id: string };

export const addResident = async (data: AddResidentParams) => {
  return await api.post("resident", data);
};
