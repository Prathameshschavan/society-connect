/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import {
  Edit,
  Eye,
  ReceiptText,
} from "lucide-react";

import TopNav from "./TopNav";
import OnboardResidentModal from "./Modals/OnboardResidentModal";
import ViewMaintananceDetailsModal from "./Modals/ViewMaintananceDetailsModal";
import UpdateMaintananceStatusModal from "./Modals/UpdateMaintananceStatusModal";

import GenericTable, { type TableAction } from "./ui/GenericTable";

import useAdminService from "../hooks/serviceHooks/useAdminService";
import usePaginationService from "../hooks/serviceHooks/usePaginationService";

import { useOrganizationStore } from "../libs/stores/useOrganizationStore";
import {
  useMaintenanceStore,
  type MaintenanceBill,
} from "../libs/stores/useMaintenanceStore";
import { useProfileStore } from "../libs/stores/useProfileStore";

import { currMonth, currYear, shortMonth } from "../utility/dateTimeServices";
import { columns } from "../config/tableConfig/adminDashboard";
import { GenericSelect } from "./ui/GenericSelect";

// Do not Remove Comments

/**
 * AdminDashboard
 *
 * Responsibilities:
 * - Displays paginated maintenance bills for the selected month/year.
 * - Allows admins to generate current-month bills with penalty for all residents.
 * - Provides per-row actions: view details (always) and edit (only for current month/year).
 * - Coordinates data fetching via useAdminService with server-side pagination.
 *
 * Notes:
 * - Pagination state is centralized in usePaginationService to keep UI generic and reusable.
 * - Month/year selection resets to page 1 to avoid empty pages when filters change.
 * - Modals are controlled with explicit boolean flags and a selected bill object.
 */
const AdminDashboard = () => {
  // Services: server actions for bills and pagination helpers [web:11]
  const { createBillsWithPenaltyForAllResidents, fetchMaintenanceBills } =
    useAdminService(); // Data IO: generate and fetch [web:11]
  const {
    currentPage,
    pageSize,
    setPagination,
    pagination,
    setCurrentPage,
    handlePageChange,
    handlePageSizeChange,
  } = usePaginationService(); // Centralized pagination state [web:6]

  // Stores: session/profile, organization context, reactive bills data [web:11]
  const { profile } = useProfileStore(); // Access control (role) [web:11]
  const { residentOrganization } = useOrganizationStore(); // Tenant context [web:11]
  const { maintenanceBills } = useMaintenanceStore(); // Tabular data source [web:11]

  // Local UI State [web:11]
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false); // Onboarding flow [web:11]
  const [isOpenMaintananceDetailsModal, setIsOpenMaintananceDetailsModal] =
    useState(false); // Read modal [web:11]
  const [
    isOpenUpdateMaintananceDetailsModal,
    setIsOpenUpdateMaintananceDetailsModal,
  ] = useState(false); // Edit modal [web:11]
  const [selectedBill, setSelectedBill] = useState<MaintenanceBill | null>(
    null
  ); // Row context [web:11]

  // Filter (month/year) defaults to current calendar period [web:11]
  const [selectedMonth, setSelectedMonth] = useState({
    month: currMonth,
    year: currYear,
  }); // Server-side filter inputs [web:6]

  // Async flags [web:11]
  const [loading, setLoading] = useState(false); // Data fetch state [web:11]
  const [generateBillLoading, setGenerateBillLoading] = useState(false); // Generation state [web:11]

  /**
   * loadData
   *
   * Fetches maintenance bills using server-side pagination and applied filters.
   * On success, updates the pagination info from the API response.
   */
  const loadData = async () => {
    setLoading(true);
    try {
      const result = await fetchMaintenanceBills({
        page: currentPage,
        pageSize: pageSize,
        filters: {
          billMonth: selectedMonth.month,
          billYear: selectedMonth.year,
        },
      }); // Server-side pagination pattern [web:6]

      if (result) {
        setPagination(result.pagination); // Keep table pagination in sync [web:6]
      }
    } catch (error) {
      // Prefer user feedback in production; console for developer diagnostics
      console.error("Error loading data:", error); // Debug-only logging [web:11]
    } finally {
      setLoading(false);
    }
  };

  /**
   * Effect: Fetch whenever pagination or filters change.
   * Dependency array keeps data in sync with UI controls. [web:6]
   */
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, selectedMonth]);

  /**
   * handleCreateBill
   *
   * Triggers generation of current-month bills with penalty for all residents.
   * Keep UX responsive with loading flag and consider success/error toasts upstream.
   */
  const handleCreateBill = async () => {
    try {
      setGenerateBillLoading(true);
      await createBillsWithPenaltyForAllResidents();
      // Optional: refresh after generation if API does not push updates
      await loadData();
    } catch (error) {
      console.log(error); // Replace with toast/alert in production [web:11]
    } finally {
      setGenerateBillLoading(false);
    }
  };

  /**
   * Row actions: View always; Edit only if selected period is current month/year.
   * The Edit action scopes mutation to the active period to preserve historical integrity. [web:11]
   */
  const actions: TableAction<MaintenanceBill>[] = [
    {
      icon: <Eye className="w-4 h-4" />,
      onClick: (bill: MaintenanceBill) => {
        setSelectedBill(bill);
        setIsOpenMaintananceDetailsModal(true);
      },
      className:
        "cursor-pointer p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors",
      label: "View",
    },
    ...(selectedMonth.month === currMonth && selectedMonth.year === currYear
      ? [
          {
            icon: <Edit className="w-4 h-4" />,
            onClick: (bill: MaintenanceBill) => {
              setSelectedBill(bill);
              setIsOpenUpdateMaintananceDetailsModal(true);
            },
            className:
              "cursor-pointer p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors",
            label: "Edit",
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navigation fixed to admin view-context [web:11] */}
      <TopNav view="admin" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header: Organization context and purpose subtitle [web:11] */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <h1 className="text-2xl poppins-medium ">
                {residentOrganization?.name}
              </h1>
              <p className="text-gray-600 text-sm font-light">
                View and track your society maintenance details
              </p>
            </div>

            {/* Filters: Month and Year selectors; changing resets to page 1 [web:6] */}
            <div className="flex gap-4 self-center w-full sm:w-fit">
              <GenericSelect
                id="months"
                onChange={(value) => {
                  setCurrentPage(1);
                  setSelectedMonth((prev) => ({
                    ...prev,
                    month: value,
                  }));
                }}
                options={shortMonth.map((month, i) => ({
                  label: month,
                  value: (i + 1).toString().padStart(2, "0"),
                }))}
                value={selectedMonth.month}
                label="Month"
              />

              <GenericSelect
                id="years"
                onChange={(value) => {
                  setCurrentPage(1);
                  setSelectedMonth((prev) => ({
                    ...prev,
                    year: value,
                  }));
                }}
                options={Array.from(
                  { length: new Date().getFullYear() - 2000 + 1 },
                  (_, index) => {
                    const year = new Date().getFullYear() - index;
                    return { label: year, value: `${year}` };
                  }
                )}
                value={selectedMonth.year}
                label="Year"
              />
            </div>
          </div>

          {/* Admin-only: bulk bill generation for current month period [web:11] */}
          {profile?.role === "admin" &&
            selectedMonth.month === currMonth &&
            selectedMonth.year === currYear &&
            maintenanceBills?.length === 0 && (
              <button
                disabled={generateBillLoading}
                onClick={handleCreateBill}
                className="w-full sm:w-fit flex items-center whitespace-nowrap justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-70"
                aria-busy={generateBillLoading}
              >
                <ReceiptText className="w-5 h-5" />
                {generateBillLoading ? "Generating..." : "Generate Bill"}
              </button>
            )}

          {/* Main table: paginated, searchable list of bills [web:6] */}
          <GenericTable
            title="Maintenance"
            columns={columns}
            data={maintenanceBills}
            actions={profile?.role === "admin" ? actions : []}
            loading={loading}
            emptyMessage="No maintenence bill is generated this month"
            searchPlaceholder="Search resident"
            showPagination
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[5, 10, 20, 50]}
            onSearch={() => {
              /* Hook into this to wire server-side search; keep debounced input upstream [web:6] */
            }}
          />
        </div>
      </main>

      {/* Ancillary modals: controlled visibility and bill context [web:11] */}
      <OnboardResidentModal
        isOpen={isOnboardModalOpen}
        onClose={() => setIsOnboardModalOpen(false)}
      />

      <ViewMaintananceDetailsModal
        bill={selectedBill}
        isOpen={isOpenMaintananceDetailsModal}
        onClose={() => setIsOpenMaintananceDetailsModal(false)}
      />

      <UpdateMaintananceStatusModal
        bill={selectedBill}
        isOpen={isOpenUpdateMaintananceDetailsModal}
        onClose={() => setIsOpenUpdateMaintananceDetailsModal(false)}
        onSuccess={loadData} // Refresh table after update to reflect latest state [web:6]
      />
    </div>
  );
};

export default AdminDashboard;
