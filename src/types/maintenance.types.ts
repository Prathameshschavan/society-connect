import type { PaginationInfo } from "../components/ui/GenericTable";
import type { ExtraItem } from "../libs/stores/useOrganizationStore";

export type TBillStatus = "pending" | "paid" | "overdue";

export type DuesLine = {
  month: string; // "01".."12"
  year: string; // "YYYY"
  status: "pending" | "paid" | "overdue";
  base_amount: number; // that month’s base (from prior bill.amount)
  extras: ExtraItem[]; // that month’s extra (from prior bill.extra)
  penalty: number; // fixed penalty applied per overdue month
  subtotal: number; // amount + previousExtra + penalty
};

export type BillBreakdown = {
  base_amount: number;
  extras: ExtraItem[];
  extra_total: number;
  dues: DuesLine[];
  penalty: number;
};

export interface FetchResidentsParams {
  orgId?: string;
  page?: number;
  pageSize?: number;
  searchQuery?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: {
    city?: string;
    role?: string;
    unitNumber?: string;
    minAge?: number;
    maxAge?: number;
  };
}

export interface FetchMaintenanceBillsParams {
  orgId?: string;
  residentId?: string;
  page?: number;
  pageSize?: number;
  searchQuery?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: {
    status?: string;
    billMonth?: string;
    billYear?: string;
    residentId?: string;
    minAmount?: number;
    maxAmount?: number;
    dueDateFrom?: string;
    dueDateTo?: string;
    unitNumber?: string;
  };
}

export interface FetchMaintenanceBillsResponse {
  data: any[];
  pagination: PaginationInfo;
  totalBills: number;
}

export interface FetchResidentsResponse {
  data: any[];
  pagination: PaginationInfo;
  totalResidents: number;
}
export type UpdateStatusInput = {
  id: string; // bill id to update
  status: "pending" | "paid" | "overdue" | "cancelled";
  notes?: string | null;
  transaction_id?: string | null; // only for "paid"
  payment_date?: string | null; // yyyy-mm-dd (ISO date-only) only for "paid"
};
