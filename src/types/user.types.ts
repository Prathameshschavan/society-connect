import type { IOrganization } from "./organization.types";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type TSignIn = {
  email: string;
  password: string;
};

export type TRole = "super_admin" | "admin" | "resident" | "committee_member";

export interface IFamilyMembers {
  adult: number;
  child: number;
}

export interface IVehicles {
  twoWheeler?: number;
}

export interface IProfile {
  id?: string;
  role: TRole; // Union type for role
  email?: string;
  full_name: string;
  phone: string;
  unit_number: string;
  square_footage: number;
  unit_type: string;
  family_members: IFamilyMembers;
  vehicles?: IVehicles;
  is_tenant?: boolean;
  organization_id?: string;
  organization?: IOrganization;
  must_change_password?: boolean;
  emergency_contact?: IContact;
}

export interface IContact {
  name: string;
  phone: string;
}

export type SignInResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
  refresh_token: string;
  user: IProfile;
  weak_password: null | unknown;
};
