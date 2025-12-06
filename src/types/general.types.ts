export type GETMethodParams = {
  page?: number;
  limit?: number;
  bill_month?: number;
  bill_year?: number;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  role?: string;
  organization_id?: string;
  is_tenant?: boolean;
};
