import type { IProfile } from "./user.types";

export interface IExtra {
  id: string;
  name: string;
  amount: number;
  month: string;
  year: string;
}

export interface IOrganization {
  id: string;
  admins: IProfile[];
  name: string;
  address_line_1: string;
  address_line_2: string;
  maintenance_amount: number;
  maintenance_rate: number;
  total_units: number;
  city: string;
  state: string;
  pincode: string;
  due_date: number;
  phone: string;
  registration_number?: string;
  established_date?: string; // ISO date string
  penalty_amount?: number;
  penalty_rate?: number;
  extras?: IExtra[];
  tenant_maintenance_amount?: number;
  tenant_maintenance_rate?: number;
  calculate_maintenance_by?: string;
  created_at?: string;
  is_prev: boolean;
}

export type TCreateOrganizationData = Partial<IOrganization> & {
  admin: {
    name: string;
    email: string;
    password: string;
    unit_number: string;
    phone: string;
    square_footage: number;
    unit_type: string;
  };
};

export type TUpdateOrganizationData = Partial<IOrganization> & {};
