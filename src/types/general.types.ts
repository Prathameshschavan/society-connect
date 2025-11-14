export type GETMethodParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  role?: string;
  organization_id?: string;
  is_tenant?: boolean;
};
