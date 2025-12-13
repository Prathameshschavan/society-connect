/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { addResident } from "../apis/resident.apis";
import { residentsData } from "../constants/residentsData";
import toast from "react-hot-toast";
import { Upload } from "lucide-react";

import { useEffect, useState, useCallback } from "react";
import {
  Edit,
  Eye,
  Plus,
  Search,
  SlidersHorizontal,
  SortAsc,
  SortDesc,
  Trash2,
  X,
  Users,
} from "lucide-react";

import GenericTable, {
  type TableAction,
  type TableColumn,
} from "../components/ui/GenericTable";
import Layout from "../components/Layout/Layout";
import { GenericSelect } from "../components/ui/GenericSelect";
import usePaginationService from "../hooks/serviceHooks/usePaginationService";
import useProfileApiService from "../hooks/apiHooks/useProfileApiService";
import { useProfileStore } from "../libs/stores/useProfileStore";
import type { IProfile } from "../types/user.types";
import ConfirmationAlert from "../components/Modals/ConfirmationAlert";
import OnboardResidentModal from "../components/Modals/OnboardResidentModal";
import UpdateResidentModal from "../components/Modals/UpdateResidentModal";
import ViewResidentDetailsModal from "../components/Modals/ViewResidentDetailsModal";

// Custom hook for debounced search
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Sort options
const sortOptions = [
  { label: "Name", value: "full_name" },
  { label: "Phone", value: "phone" },
  { label: "Created Date", value: "created_at" },
];

// Filter interface
interface FilterState {
  role?: string;
  unitNumber?: string;
  isTenant?: string;
}

// Sort interface
interface SortState {
  sortBy: string;
  sortOrder: "asc" | "desc";
}

const Residents = () => {
  // Services
  const { handleGetAllProfiles, handleDeleteProfile } = useProfileApiService();
  const {
    currentPage,
    pageSize,
    setPagination,
    pagination,
    setCurrentPage,
    handlePageChange,
    handlePageSizeChange,
  } = usePaginationService();

  // Stores
  const { profile, residents } = useProfileStore();

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState<IProfile | null>(
    null
  );
  const [confirmationAlert, setConfirmationAlert] = useState(false);
  const [visibleFilters, setVisibleFilters] = useState<boolean>(false);

  // Filter states
  const [filters, setFilters] = useState<FilterState>({});

  // Search state with debounce
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Sort state
  const [sortState, setSortState] = useState<SortState>({
    sortBy: "full_name",
    sortOrder: "asc",
  });

  // Loading states
  const [loading, setLoading] = useState(false);
  const [isBulkUploading, setIsBulkUploading] = useState(false);

  const handleBulkUpload = async () => {
    if (!residentsData || residentsData.length === 0) {
      toast.error("No resident data found to import");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to import ${residentsData.length} residents?`
      )
    ) {
      return;
    }

    setIsBulkUploading(true);
    let successCount = 0;
    let failureCount = 0;
    const toastId = toast.loading("Starting import...");

    try {
      for (let i = 0; i < residentsData.length; i++) {
        const resident = residentsData[i];
        try {
          toast.loading(
            `Importing ${i + 1}/${residentsData.length}: ${resident.full_name}`,
            {
              id: toastId,
            }
          );
          await addResident(resident);
          successCount++;
        } catch (error) {
          console.error(`Failed to import ${resident.full_name}:`, error);
          failureCount++;
        }
      }

      toast.success(
        `Import completed! Success: ${successCount}, Failed: ${failureCount}`,
        {
          id: toastId,
          duration: 5000,
        }
      );
      await loadData();
    } catch (error) {
      console.error("Bulk upload error:", error);
      toast.error("Bulk upload failed", { id: toastId });
    } finally {
      setIsBulkUploading(false);
    }
  };

  /**
   * Load data with all filters, search, and sorting applied
   */
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await handleGetAllProfiles({
        page: currentPage,
        limit: pageSize,
        search: debouncedSearchQuery,
        sortBy: sortState.sortBy,
        order: sortState.sortOrder,
        organization_id: profile?.organization_id,
        is_tenant:
          filters.isTenant === "tenant"
            ? true
            : filters.isTenant === "owner"
            ? false
            : undefined,
        role: filters.role as any,
      });

      if (result) {
        setPagination(result.meta as any);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    pageSize,
    debouncedSearchQuery,
    sortState,
    filters,
    handleGetAllProfiles,
    setPagination,
    profile?.organization_id,
  ]);

  // Load data when dependencies change
  useEffect(() => {
    loadData();
  }, [currentPage, pageSize, filters, sortState, debouncedSearchQuery]);

  /**
   * Handle filter changes
   */
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setCurrentPage(1);
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  /**
   * Handle sort changes
   */
  const handleSortChange = (field: string) => {
    setSortState((prev) => ({
      sortBy: field,
      sortOrder:
        prev.sortBy === field && prev.sortOrder === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  /**
   * Reset all filters
   */
  const resetFilters = () => {
    setFilters({});
    setSearchQuery("");
    setSortState({
      sortBy: "full_name",
      sortOrder: "asc",
    });
    setCurrentPage(1);
  };

  /**
   * Handle delete resident
   */
  const handleDelete = async () => {
    if (selectedResident?.id) {
      await handleDeleteProfile(selectedResident.id);
      setConfirmationAlert(false);
      setSelectedResident(null);
      await loadData();
    }
  };

  // Table columns
  const columns: TableColumn<IProfile>[] = [
    {
      key: "full_name",
      header: "Full Name",
      render: (resident) => (
        <div>
          <div className="font-medium text-gray-900">{resident.full_name}</div>
          <div className="text-sm text-gray-500 capitalize">
            {resident.role?.replaceAll("_", " ")}
          </div>
        </div>
      ),
    },
    {
      key: "unit",
      header: "Unit Number",
      render: (resident) => (
        <div className="text-gray-700">
          {resident.unit?.unit_number || "N/A"}
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      className: "text-gray-700",
    },
  ];

  // Row actions
  const actions: TableAction<IProfile>[] = [
    {
      icon: <Eye className="w-4 h-4" />,
      onClick: (resident: IProfile) => {
        setSelectedResident(resident);
        setIsViewModalOpen(true);
      },
      className:
        "cursor-pointer p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors",
      label: "View",
    },
    {
      icon: <Edit className="w-4 h-4" />,
      onClick: (resident: IProfile) => {
        setSelectedResident(resident);
        setIsUpdateModalOpen(true);
      },
      className:
        "cursor-pointer p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors",
      label: "Edit",
    },
    {
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (resident: IProfile) => {
        setSelectedResident(resident);
        setConfirmationAlert(true);
      },
      className:
        "cursor-pointer p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors",
      label: "Delete",
    },
  ];

  return (
    <Layout
      role="admin"
      visibileTopSection={false}
      pageHeader={{
        description:
          "Manage residents, view their details, and track occupancy",
        title: "Residents",
        icon: <Users className="w-6 h-6 text-[#0154AC]" />,
      }}
    >
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-6">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleBulkUpload}
            disabled={isBulkUploading}
            // className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 bg-[#0154AC] text-white rounded-lg font-medium hover:bg-[#01449c] transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            className="hidden"
          >
            {isBulkUploading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
            <span className="whitespace-nowrap">
              {isBulkUploading ? "Importing..." : "Bulk Import"}
            </span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 bg-[#22C36E] text-white rounded-lg font-medium hover:bg-[#1ea05f] transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            <span className="whitespace-nowrap">Add Resident</span>
          </button>
          <button
            onClick={() => setVisibleFilters(!visibleFilters)}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 border-2 rounded-lg font-medium transition-all duration-200 ${
              visibleFilters
                ? "bg-[#0154AC] text-white border-[#0154AC]"
                : "bg-white text-[#0154AC] border-[#0154AC] hover:bg-[#0154AC]/5"
            }`}
          >
            {visibleFilters ? (
              <X className="w-5 h-5" />
            ) : (
              <SlidersHorizontal className="w-5 h-5" />
            )}
            <span>Filters</span>
          </button>
        </div>

        <div className="relative w-full sm:w-[320px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, phone, or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0154AC] focus:border-[#0154AC] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filters Section */}
      {visibleFilters && (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <GenericSelect
              id="roleFilter"
              onChange={(value) => handleFilterChange("role", value as string)}
              options={[
                { label: "All Roles", value: "" },
                { label: "Resident", value: "resident" },
                { label: "Admin", value: "admin" },
                { label: "Committee Member", value: "committee_member" },
              ]}
              value={filters.role || ""}
              label="Role"
            />

            <GenericSelect
              id="tenantFilter"
              onChange={(value) =>
                handleFilterChange("isTenant", value as string)
              }
              options={[
                { label: "All", value: "" },
                { label: "Owner", value: "owner" },
                { label: "Tenant", value: "tenant" },
              ]}
              value={filters.isTenant || ""}
              label="Occupancy Type"
            />

            <GenericSelect
              id="sortBy"
              onChange={(value) => handleSortChange(value)}
              options={sortOptions}
              value={sortState.sortBy}
              label="Sort By"
            />

            <button
              onClick={() =>
                setSortState((prev) => ({
                  ...prev,
                  sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
                }))
              }
              className="flex self-end items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow"
              title={`Sort ${
                sortState.sortOrder === "asc" ? "Descending" : "Ascending"
              }`}
            >
              {sortState.sortOrder === "asc" ? (
                <SortAsc className="w-4 h-4" />
              ) : (
                <SortDesc className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {sortState.sortOrder === "asc" ? "Asc" : "Desc"}
              </span>
            </button>

            <div className="lg:flex justify-end hidden col-span-2">
              <button
                onClick={resetFilters}
                className="px-4 py-2.5 self-end whitespace-nowrap text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
              >
                Reset Filters
              </button>
            </div>
          </div>
          <div className="flex justify-end lg:hidden">
            <button
              onClick={resetFilters}
              className="px-4 py-2.5 self-end whitespace-nowrap text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <GenericTable
        title="Residents"
        columns={columns}
        data={residents}
        actions={actions}
        loading={loading}
        emptyMessage={
          debouncedSearchQuery || filters.role || filters.isTenant
            ? "No residents found matching your criteria"
            : "No residents available"
        }
        showPagination
        pagination={pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={[5, 10, 20, 50]}
      />

      {/* Modals */}
      <OnboardResidentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        callback={loadData}
      />

      {isUpdateModalOpen && selectedResident && (
        <UpdateResidentModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          resident={selectedResident}
          callback={loadData}
        />
      )}

      {isViewModalOpen && selectedResident && (
        <ViewResidentDetailsModal
          resident={{
            id: selectedResident.unit?.id,
            unit_number: selectedResident.unit?.unit_number || "N/A",
            square_footage: selectedResident.unit?.square_footage || 0,
            unit_type: selectedResident.unit?.unit_type || "N/A",
            organization_id: selectedResident.organization_id || "",
            profile_id: selectedResident.id || "",
            profile: selectedResident,
          }}
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
        />
      )}

      <ConfirmationAlert
        isOpen={confirmationAlert}
        onClose={() => setConfirmationAlert(false)}
        message="Are you sure you want to delete this resident?"
        showIcon
        onConfirm={handleDelete}
      />
    </Layout>
  );
};

export default Residents;
