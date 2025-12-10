/* eslint-disable @typescript-eslint/no-explicit-any */
import { Plus, Edit, Eye, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useOrganizationStore } from "../libs/stores/useOrganizationStore";
import usePaginationService from "../hooks/serviceHooks/usePaginationService";
import type { IOrganization } from "../types/organization.types";
import useOrganizationApiService from "../hooks/apiHooks/useOrganizationApiService";
import { deleteOrganization } from "../apis/organization.apis";
import type { TableAction, TableColumn } from "../components/ui/GenericTable";
import TopNav from "../components/TopNav";
import GenericTable from "../components/ui/GenericTable";
import OnboardSocietyModal from "../components/Modals/OnboardSocietyModal";
import UpdateSocietyModal from "../components/Modals/UpdateSocietyModal";
import ViewSocietyDetailsModal from "../components/Modals/ViewSocietyDetailsModal";
import ConfirmationAlert from "../components/Modals/ConfirmationAlert";

const SuperAdminDashboard = () => {
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [isUpdateSocietyModalOpen, setIsUpdateSocietyModalOpen] =
    useState(false);
  const [isViewSocietyModalOpen, setIsViewSocietyModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmationAlert, setConfirmationAlert] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<IOrganization | null>(null);

  const {
    currentPage,
    pageSize,
    pagination,
    handlePageChange,
    handlePageSizeChange,
    setPagination,
  } = usePaginationService();
  const { organizations } = useOrganizationStore();
  const { handleGetAllOrganizations } = useOrganizationApiService();

  // Load data with pagination
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await handleGetAllOrganizations({
        page: currentPage,
        limit: pageSize,
      });
      setPagination(res?.meta);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentPage, pageSize]);

  const columns: TableColumn<IOrganization>[] = [
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
  ];

  const actions: TableAction<IOrganization>[] = [
    {
      icon: <Eye className="w-4 h-4" />,
      onClick: (org) => {
        setSelectedOrg(org);
        setIsViewSocietyModalOpen(true);
      },
      className:
        "cursor-pointer p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors",
      label: "View",
    },
    {
      icon: <Edit className="w-4 h-4" />,
      onClick: (org) => {
        setSelectedOrg(org);
        setIsUpdateSocietyModalOpen(true);
      },
      className:
        "cursor-pointer p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors",
      label: "Edit",
    },
    {
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (org) => {
        setSelectedOrg(org);
        setConfirmationAlert(true);
      },
      className:
        "cursor-pointer p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors",
      label: "Delete",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav view="super_admin" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex  justify-end items-end">
            <button
              onClick={() => {
                setIsOnboardModalOpen(true);
              }}
              className="cursor-pointer  flex items-center gap-2 bg-[#22C36E] text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Onboard New Society
            </button>
          </div>

          <GenericTable
            title="Societies"
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
          />
        </div>
      </main>
      <OnboardSocietyModal
        isOpen={isOnboardModalOpen}
        onClose={() => setIsOnboardModalOpen(false)}
        callback={() => loadData()}
      />
      {isUpdateSocietyModalOpen && (
        <UpdateSocietyModal
          isOpen={isUpdateSocietyModalOpen}
          onClose={() => setIsUpdateSocietyModalOpen(false)}
          orgId={selectedOrg?.id as string}
          callback={() => loadData()}
        />
      )}
      {isViewSocietyModalOpen && (
        <ViewSocietyDetailsModal
          isOpen={isViewSocietyModalOpen}
          onClose={() => setIsViewSocietyModalOpen(false)}
          orgId={selectedOrg?.id as string}
        />
      )}
      <ConfirmationAlert
        isOpen={confirmationAlert}
        onClose={() => setConfirmationAlert(false)}
        message="Are you sure want to delete this organization?"
        showIcon
        onConfirm={async () => {
          await deleteOrganization(selectedOrg?.id as string);
          loadData();
          setConfirmationAlert(false);
        }}
      />
    </div>
  );
};
//
export default SuperAdminDashboard;
