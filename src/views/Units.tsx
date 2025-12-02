/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

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
  Home,
} from "lucide-react";

import GenericTable, {
  type TableAction,
  type TableColumn,
} from "../components/ui/GenericTable";
import Layout from "../components/Layout/Layout";
import { GenericSelect } from "../components/ui/GenericSelect";
import usePaginationService from "../hooks/serviceHooks/usePaginationService";
import useUnitApiService from "../hooks/apiHooks/useUnitApiService";
import { useUnitStore } from "../libs/stores/useUnitStore";
import type { IUnit } from "../types/unit.types";
import { useProfileStore } from "../libs/stores/useProfileStore";
import ConfirmationAlert from "../components/Modals/ConfirmationAlert";
import AddUnitModal from "../components/Modals/AddUnitModal";
import UpdateUnitModal from "../components/Modals/UpdateUnitModal";
import ViewUnitDetailsModal from "../components/Modals/ViewUnitDetailsModal";

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

// Unit type options
const unitTypeOptions = [
  { label: "All Types", value: "" },
  { label: "1RK", value: "1RK" },
  { label: "1BHK", value: "1BHK" },
  { label: "2BHK", value: "2BHK" },
  { label: "3BHK", value: "3BHK" },
  { label: "4BHK", value: "4BHK" },
  { label: "Studio", value: "Studio" },
  { label: "Penthouse", value: "Penthouse" },
  { label: "Other", value: "Other" },
];

// Sort options
const sortOptions = [
  { label: "Unit Number", value: "unit_number" },
  { label: "Unit Type", value: "unit_type" },
  { label: "Square Footage", value: "square_footage" },
  { label: "Created Date", value: "created_at" },
];

// Filter interface
interface FilterState {
  unitType?: string;
  occupancyType?: string;
  availability?: string;
}

// Sort interface
interface SortState {
  sortBy: string;
  sortOrder: "asc" | "desc";
}

const Units = () => {
  // Services
  const { handleGetAllUnits, handleDeleteUnit } = useUnitApiService();
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
  const { profile } = useProfileStore();
  const { units } = useUnitStore();

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<IUnit | null>(null);
  const [confirmationAlert, setConfirmationAlert] = useState(false);
  const [visibleFilters, setVisibleFilters] = useState<boolean>(false);

  // Filter states
  const [filters, setFilters] = useState<FilterState>({});

  // Search state with debounce
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Sort state
  const [sortState, setSortState] = useState<SortState>({
    sortBy: "unit_number",
    sortOrder: "asc",
  });

  // Loading states
  const [loading, setLoading] = useState(false);

  /**
   * Load data with all filters, search, and sorting applied
   */
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await handleGetAllUnits({
        page: currentPage,
        limit: pageSize,
        search: debouncedSearchQuery,
        sortBy: sortState.sortBy,
        order: sortState.sortOrder,
        organization_id: profile?.organization_id,
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
    handleGetAllUnits,
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
      sortBy: "unit_number",
      sortOrder: "asc",
    });
    setCurrentPage(1);
  };

  /**
   * Handle delete unit
   */
  const handleDelete = async () => {
    if (selectedUnit?.id) {
      await handleDeleteUnit(selectedUnit.id);
      setConfirmationAlert(false);
      setSelectedUnit(null);
      await loadData();
    }
  };

  // Filter units based on client-side filters
  const filteredUnits = units.filter((unit) => {
    if (filters.unitType && unit.unit_type !== filters.unitType) {
      return false;
    }
    if (filters.occupancyType) {
      const isTenant = unit.profile?.is_tenant;
      if (filters.occupancyType === "Owner" && isTenant) return false;
      if (filters.occupancyType === "Tenant" && !isTenant) return false;
    }
    if (filters.availability) {
      const isOccupied = !!unit.profile;
      if (filters.availability === "occupied" && !isOccupied) return false;
      if (filters.availability === "vacant" && isOccupied) return false;
    }
    return true;
  });

  // Table columns
  const columns: TableColumn<IUnit>[] = [
    {
      key: "unit_number",
      header: "Unit Number",
      render: (unit) => (
        <div>
          <div className="font-medium text-gray-900">{unit.unit_number}</div>
        </div>
      ),
    },
    {
      key: "unit_type",
      header: "Unit Type",
      render: (unit) => (
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {unit.unit_type}
          </span>
        </div>
      ),
    },
    {
      key: "square_footage",
      header: "Square Footage",
      render: (unit) => (
        <div className="text-gray-700">{unit.square_footage} sq ft</div>
      ),
    },
    {
      key: "profile",
      header: "Owner",
      render: (unit) => (
        <div>
          {unit.profile ? (
            <div>
              <div className="font-medium text-gray-900">
                {unit.profile.full_name}
              </div>
              <div className="text-sm text-gray-700 capitalize">
                {unit.profile?.role?.replaceAll("_", " ")}
              </div>
            </div>
          ) : (
            <span className="text-gray-400 italic">Vacant</span>
          )}
        </div>
      ),
    },
    {
      key: "tenant",
      header: "Tenant",
      render: (unit) => (
        <div className="text-sm text-gray-700 capitalize">
          {unit.profile?.is_tenant ? "Yes" : "No"}
        </div>
      ),
    },
  ];

  // Row actions
  const actions: TableAction<IUnit>[] = [
    {
      icon: <Eye className="w-4 h-4" />,
      onClick: (unit: IUnit) => {
        setSelectedUnit(unit);
        setIsViewModalOpen(true);
      },
      className:
        "cursor-pointer p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors",
      label: "View",
    },
    {
      icon: <Edit className="w-4 h-4" />,
      onClick: (unit: IUnit) => {
        setSelectedUnit(unit);
        setIsUpdateModalOpen(true);
      },
      className:
        "cursor-pointer p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors",
      label: "Edit",
    },
    {
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (unit: IUnit) => {
        setSelectedUnit(unit);
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
      pageHeader={{
        description: "Manage units, assign owners, and track vacancies",
        title: "Units",
        icon: <Home className="w-6 h-6 text-[#0154AC]" />,
      }}
      visibileTopSection={false}
    >

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-6">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 bg-[#22C36E] text-white rounded-lg font-medium hover:bg-[#1ea05f] transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            <span>Add Unit</span>
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
            placeholder="Search by unit number or resident"
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
              id="unitTypeFilter"
              onChange={(value) =>
                handleFilterChange("unitType", value as string)
              }
              options={unitTypeOptions}
              value={filters.unitType || ""}
              label="Unit Type"
            />

            <GenericSelect
              id="occupancyFilter"
              onChange={(value) =>
                handleFilterChange("occupancyType", value as string)
              }
              options={[
                { label: "All", value: "" },
                { label: "Owner", value: "Owner" },
                { label: "Tenant", value: "Tenant" },
              ]}
              value={filters.occupancyType || ""}
              label="Occupancy Type"
            />

            <GenericSelect
              id="availabilityFilter"
              onChange={(value) =>
                handleFilterChange("availability", value as string)
              }
              options={[
                { label: "All", value: "" },
                { label: "Occupied", value: "occupied" },
                { label: "Vacant", value: "vacant" },
              ]}
              value={filters.availability || ""}
              label="Availability"
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

            <div className="lg:flex justify-end hidden">
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
        title="Units"
        columns={columns}
        data={filteredUnits}
        actions={actions}
        loading={loading}
        emptyMessage={
          debouncedSearchQuery || filters.unitType || filters.occupancyType
            ? "No units found matching your criteria"
            : "No units available"
        }
        showPagination
        pagination={pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={[5, 10, 20, 50]}
      />

      {/* Modals */}
      <AddUnitModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        callback={loadData}
      />

      {isUpdateModalOpen && selectedUnit && (
        <UpdateUnitModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          unit={selectedUnit}
          callback={loadData}
        />
      )}

      {isViewModalOpen && selectedUnit && (
        <ViewUnitDetailsModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          unit={selectedUnit}
        />
      )}

      <ConfirmationAlert
        isOpen={confirmationAlert}
        onClose={() => setConfirmationAlert(false)}
        message="Are you sure you want to delete this unit?"
        showIcon
        onConfirm={handleDelete}
      />
    </Layout>
  );
};

export default Units;
