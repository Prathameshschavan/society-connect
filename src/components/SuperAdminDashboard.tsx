/* eslint-disable @typescript-eslint/no-explicit-any */
import { Building2, Plus, Edit, Eye, Trash2, Home } from "lucide-react";
import TopNav from "./TopNav";
import { useCallback, useEffect, useState } from "react";
import OnboardSocietyModal from "./Modals/OnboardSocietyModal";
import {
  useOrganizationStore,
  type Organization,
} from "../libs/stores/useOrganizationStore";
import useOrganizationService from "../hooks/serviceHooks/useOrganizationService";
import GenericTable, {
  type TableAction,
  type TableColumn,
} from "./ui/GenericTable";

// Define PaginationInfo interface
interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const SuperAdminDashboard = () => {
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const { organizations, organizationsCount, totalUnitsCount } =
    useOrganizationStore();
  const { fetchOrganization, searchOrganizations } = useOrganizationService();

  // Load data with pagination
  const loadData = async () => {
    setLoading(true);
    try {
      const result = await fetchOrganization({
        page: currentPage,
        pageSize: pageSize,
      });

      if (result) {
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentPage, pageSize]);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  const columns: TableColumn<Organization>[] = [
    {
      key: "name",
      header: "Society Name",
      render: (org) => (
        <div>
          <div className="font-medium text-gray-900">{org.name}</div>
          <div className="text-sm text-gray-500">{org.id}</div>
        </div>
      ),
    },
    {
      key: "city",
      header: "Location",
      className: "text-gray-700",
    },
    {
      key: "total_units",
      header: "Units",
      className: "text-gray-900 font-medium",
    },
    {
      key: "admin",
      header: "Admin",
      render: (org) => (
        <div>
          <div className="text-gray-900 font-medium">
            {org?.admin?.[0]?.full_name || "N/A"}
          </div>
          <div className="text-sm text-gray-500">
            {org?.admin?.[0]?.phone || ""}
          </div>
        </div>
      ),
    },
  ];

  const actions: TableAction<Organization>[] = [
    {
      icon: <Eye className="w-4 h-4" />,
      onClick: (org) => console.log("View", org),
      className:
        "p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors",
      label: "View",
    },
    {
      icon: <Edit className="w-4 h-4" />,
      onClick: (org) => console.log("Edit", org),
      className:
        "p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors",
      label: "Edit",
    },
    {
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (org) => console.log("Delete", org),
      className:
        "p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors",
      label: "Delete",
    },
  ];

  function debounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      searchOrganizations(searchQuery);
    }, 500),
    [searchOrganizations]
  );
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav view="owner" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Super Admin Dashboard
                </h1>
                <p className="text-gray-600">
                  Manage all societies and onboard new ones
                </p>
              </div>
              <button
                onClick={() => {
                  setIsOnboardModalOpen(true);
                }}
                className="cursor-pointer flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Onboard New Society
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">
                    Total Societies
                  </p>
                  <p className="text-3xl font-bold">{organizationsCount}</p>
                </div>
                <Building2 className="w-8 h-8 text-blue-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">
                    Total Units
                  </p>
                  <p className="text-3xl font-bold">{totalUnitsCount}</p>
                </div>
                <Home className="w-8 h-8 text-purple-200" />
              </div>
            </div>
          </div>

          <GenericTable
            title="All Societies"
            columns={columns}
            data={organizations}
            actions={actions}
            loading={loading}
            emptyMessage="No Society Found"
            showSearch
            searchPlaceholder="Search society"
            showPagination
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[5, 10, 20, 50]}
            onSearch={(searchQuery) => {
              debouncedSearch(searchQuery);
            }}
          />
        </div>
      </main>
      <OnboardSocietyModal
        isOpen={isOnboardModalOpen}
        onClose={() => setIsOnboardModalOpen(false)}
      />
    </div>
  );
};

export default SuperAdminDashboard;
