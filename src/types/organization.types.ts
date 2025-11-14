export interface IExtra {
  id: string;
  name: string;
  amount: number;
  month: string;
  year: string;
}

export interface IOrganization {
  id: string;
  name: string;
  address: string;
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
}
