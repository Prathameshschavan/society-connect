/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Building2,
  Phone,
  MapPin,
  Hash,
  IndianRupee,
  Save,
  ArrowLeft,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import GenericTable, { type TableAction } from "../components/ui/GenericTable";
import { useProfileStore } from "../libs/stores/useProfileStore";
import useAdminService from "../hooks/serviceHooks/useAdminService";
import OnboardResidentModal from "../components/Modals/OnboardResidentModal";
import ViewResidentDetailsModal from "../components/Modals/ViewResidentDetailsModal";
import UpdateResidentModal from "../components/Modals/UpdateResidentModal";
import ConfirmationAlert from "../components/Modals/ConfirmationAlert";
import Maintenance from "../components/configureSettings/Maintenance";
import Basic from "../components/configureSettings/Basic";
import Location from "../components/configureSettings/Location";
import Contact from "../components/configureSettings/Contact";
import Property from "../components/configureSettings/Property";
import usePaginationService from "../hooks/serviceHooks/usePaginationService";
import { columns } from "../config/tableConfig/configureSettings";
import type { IProfile } from "../types/user.types";
import { getOrganization } from "../apis/organization.apis";
import useProfileApiService from "../hooks/apiHooks/useProfileApiService";
import Layout from "../components/Layout/Layout";
import useOrganizationApiService from "../hooks/apiHooks/useOrganizationApiService";
import type { IOrganization } from "../types/organization.types";

const SocietyConfigurationPage: React.FC = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<IProfile | null>(null);
  const [isViewResidentModalOpen, setIsViewResidentModalOpen] =
    useState<boolean>(false);
  const [isUpdateResidentModalOpen, setIsUpdateResidentModalOpen] =
    useState<boolean>(false);
  const [isDeleteConfirmationModalOpen, setIsDeleteConfirmationModalOpen] =
    useState<boolean>(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [organization, setOrganization] = useState<IOrganization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { residents, profile } = useProfileStore();
  const { fetchResidents, permanentlyDeleteResident } = useAdminService();
  const { handleGetAllProfiles } = useProfileApiService();
  const [loading, setLoading] = useState(false);
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);

  const { handleUpdateOrganization } = useOrganizationApiService();

  const {
    currentPage,
    handlePageChange,
    handlePageSizeChange,
    pageSize,
    pagination,
    setPagination,
  } = usePaginationService();

  // Load data with pagination
  const loadData = async () => {
    setLoading(true);
    try {
      const result = await handleGetAllProfiles({
        page: currentPage,
        limit: pageSize,
        sortBy: "unit_number",
        order: "asc",
        organization_id: orgId,
      });

      if (result) {
        setPagination(result.meta);
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

  const actions: TableAction<IProfile>[] = [
    {
      icon: <Eye className="w-4 h-4" />,
      onClick: (profile) => {
        setSelectedProfile(profile);
        setIsViewResidentModalOpen(true);
      },
      className:
        "cursor-pointer p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors",
      label: "View",
    },
    {
      icon: <Edit className="w-4 h-4" />,
      onClick: (profile) => {
        setSelectedProfile(profile);
        setIsUpdateResidentModalOpen(true);
      },
      className:
        "cursor-pointer p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors",
      label: "Edit",
    },
    {
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (profile) => {
        setSelectedProfile(profile);
        setIsDeleteConfirmationModalOpen(true);
      },
      className:
        "cursor-pointer p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors",
      label: "Delete",
    },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
  } = useForm<IOrganization>({
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      phone: "",
      registration_number: "",
      established_date: "",
      total_units: 0,
      maintenance_rate: 0,
      maintenance_amount: 0,
      tenant_maintenance_rate: 0,
      tenant_maintenance_amount: 0,
      penalty_amount: 0,
      penalty_rate: 0,
      extras: [],
      due_date: 0,
    },
  });

  const onSubmit = async (data: IOrganization) => {
    if (!orgId) {
      toast.error("Organization ID not found");
      return;
    }

    setIsSubmitting(true);
    try {
      const updateData = {
        ...profile?.organization,
        name: data.name,
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        pincode: data.pincode || "",
        phone: data.phone || "",
        registration_number: data.registration_number || "",
        established_date: data.established_date || "",
        total_units: data.total_units || 0,
        maintenance_rate: data.maintenance_rate || 0,
        maintenance_amount: data.maintenance_amount || 0,
        tenant_maintenance_rate: data.tenant_maintenance_rate || 0,
        tenant_maintenance_amount: data.tenant_maintenance_amount || 0,
        extras: data.extras || [],
        due_date: Number(data.due_date),
        penalty_rate: data?.penalty_rate,
        penalty_amount: data?.penalty_amount,
        calculate_maintenance_by: data?.calculate_maintenance_by,
      };

      handleUpdateOrganization({
        data: updateData as IOrganization,
        id: orgId,
      });
    } catch (error) {
      console.error("Error updating society:", error);
      toast.error("Failed to update society configuration!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: "basic", label: "Basic Info", icon: Building2 },
    { id: "location", label: "Location", icon: MapPin },
    { id: "contact", label: "Contact", icon: Phone },
    { id: "property", label: "Property", icon: Hash },
    { id: "maintenance", label: "Maintenance", icon: IndianRupee },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "basic":
        return <Basic errors={errors} register={register} />;

      case "location":
        return <Location errors={errors} register={register} />;

      case "contact":
        return <Contact errors={errors} register={register} />;

      case "property":
        return <Property errors={errors} register={register} />;

      case "maintenance":
        return (
          <Maintenance setValue={setValue} watch={watch} register={register} />
        );

      default:
        return null;
    }
  };

  useEffect(() => {
    const handleFetchOrganization = async () => {
      if (!orgId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const res = await getOrganization(orgId);

        if (!res) {
          setOrganization(null);
          return;
        }

        const data = res?.data?.data;

        let establishedDate = "";

        if (data?.established_date) {
          const date = new Date(data?.established_date);
          // Fix: Format as YYYY-MM-DD with leading zeros
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          establishedDate = `${year}-${month}-${day}`;
        }

        if (data) {
          setOrganization(data);
          // Populate form fields
          setValue("name", data?.name || "");
          setValue("address", data?.address || "");
          setValue("city", data?.city || "");
          setValue("state", data?.state || "");
          setValue("pincode", data?.pincode || "");
          setValue("phone", data?.phone || "");
          setValue("registration_number", data?.registration_number || "");
          setValue("established_date", establishedDate);
          setValue("total_units", data?.total_units || 0);
          setValue("maintenance_rate", data?.maintenance_rate || 0);
          setValue("maintenance_amount", data?.maintenance_amount || 0);
          setValue("due_date", data?.due_date || "");
          setValue("penalty_amount", data?.penalty_amount || 0);
          setValue("penalty_rate", data?.penalty_rate || 0);
          setValue(
            "tenant_maintenance_rate",
            data?.tenant_maintenance_rate || 0
          );
          setValue(
            "tenant_maintenance_amount",
            data?.tenant_maintenance_amount || 0
          );
          setValue("extras", data?.extras || []);
          setValue("calculate_maintenance_by", data?.calculate_maintenance_by);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        toast.error("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    handleFetchOrganization();
  }, [orgId, setValue]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading organization details...
          </h2>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Organization not found
          </h2>
          <p className="text-gray-600 mb-4">
            Unable to load organization details for configuration.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4)" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout role="admin">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 overflow-auto">
            <nav className="flex items-center" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex whitespace-nowrap items-center gap-2 py-4 px-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">{renderTabContent()}</div>
          <div className="pr-6 pb-6 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Configuration
                </>
              )}
            </button>
          </div>
        </div>
      </form>
      <button
        type="button"
        onClick={() => setIsOnboardModalOpen(true)}
        className={`bg-[#22C36E] w-full sm:w-fit flex items-center whitespace-nowrap justify-center gap-2 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-70`}
      >
        <Plus className="w-5 h-5" />
        Add Room Owner
      </button>
      <GenericTable
        title="Residents"
        columns={columns}
        data={residents}
        actions={actions}
        loading={loading}
        emptyMessage="No Resident Found"
        searchPlaceholder="Search resident"
        showPagination
        pagination={pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={[5, 10, 20, 50]}
        onSearch={() => {}}
      />
      <OnboardResidentModal
        isOpen={isOnboardModalOpen}
        onClose={() => setIsOnboardModalOpen(false)}
      />
      <ViewResidentDetailsModal
        resident={selectedProfile}
        isOpen={isViewResidentModalOpen}
        onClose={() => setIsViewResidentModalOpen(false)}
      />
      <UpdateResidentModal
        resident={selectedProfile}
        isOpen={isUpdateResidentModalOpen}
        onClose={() => setIsUpdateResidentModalOpen(false)}
      />
      <ConfirmationAlert
        isOpen={isDeleteConfirmationModalOpen}
        onClose={() => setIsDeleteConfirmationModalOpen(false)}
        message="Are you sure want to delete this resident?"
        onConfirm={async () => {
          await permanentlyDeleteResident(selectedProfile?.id as string);
          fetchResidents({ orgId, sortBy: "unit_number", sortOrder: "asc" });
          setIsDeleteConfirmationModalOpen(false);
        }}
      />
    </Layout>
  );
};

export default SocietyConfigurationPage;
