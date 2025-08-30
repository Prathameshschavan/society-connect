/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
  Building2,
  Phone,
  MapPin,
  Hash,
  IndianRupee,
  Save,
  ArrowLeft,
  Settings,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import type { Organization } from "../libs/stores/useOrganizationStore";
import useOrganizationService, {
  type FetchOrganizationResponse,
} from "../hooks/serviceHooks/useOrganizationService";
import toast from "react-hot-toast";
import { supabase } from "../libs/supabase/supabaseClient";
import { useNavigate, useParams } from "react-router-dom";
import GenericTable, {
  type PaginationInfo,
  type TableAction,
  type TableColumn,
} from "../components/ui/GenericTable";
import type { Profile } from "../types/user.types";
import { useProfileStore } from "../libs/stores/useProfileStore";
import useAdminService from "../hooks/serviceHooks/useAdminService";
import OnboardResidentModal from "../components/Modals/OnboardResidentModal";
import ViewResidentDetailsModal from "../components/Modals/ViewResidentDetailsModal";
import UpdateResidentModal from "../components/Modals/UpdateResidentModal";
import ConfirmationAlert from "../components/Modals/ConfirmationAlert";

const SocietyConfigurationPage: React.FC = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isViewResidentModalOpen, setIsViewResidentModalOpen] =
    useState<boolean>(false);
  const [isUpdateResidentModalOpen, setIsUpdateResidentModalOpen] =
    useState<boolean>(false);
  const [isDeleteConfirmationModalOpen, setIsDeleteConfirmationModalOpen] =
    useState<boolean>(false);
  const [activeTab, setActiveTab] = useState("basic");
  const { fetchOrganization } = useOrganizationService();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { residents } = useProfileStore();
  const { fetchResidents, permanentlyDeleteResident } = useAdminService();
  const [loading, setLoading] = useState(false);
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
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

  // Load data with pagination
  const loadData = async () => {
    setLoading(true);
    try {
      const result = await fetchResidents({
        page: currentPage,
        pageSize: pageSize,
        sortBy: "unit_number",
        sortOrder: "asc",
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

  const columns: TableColumn<Profile>[] = [
    {
      key: "room",
      header: "Room",
      render: (profile) => (
        <div className="font-medium text-gray-900">
          {profile.unit_number || "N/A"}
        </div>
      ),
      className: "text-gray-900 font-medium",
    },
    {
      key: "name",
      header: "Resident Name",
      render: (profile) => (
        <div>
          <div className="font-medium text-gray-900">{profile.full_name}</div>
          <div className="text-sm text-gray-500">{profile.id}</div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      className: "text-gray-700",
      render: (profile) => (
        <div className=" capitalize text-gray-500">{profile.role}</div>
      ),
    },
  ];

  const actions: TableAction<Profile>[] = [
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when page size changes
  };

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    debounce((searchQuery: string) => {}, 500),
    []
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
  } = useForm<Organization>({
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
    },
  });

  const onSubmit: SubmitHandler<Organization> = async (data) => {
    if (!orgId) {
      toast.error("Organization ID not found");
      return;
    }

    setIsSubmitting(true);
    try {
      const updateData: Partial<Organization> = {
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
      };

      const { error } = await supabase
        .from("organizations")
        .update(updateData)
        .eq("id", orgId);

      if (error) {
        throw new Error(error.message);
      }

      toast.success("Society configuration updated successfully!");
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
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Society Name *
                  </label>
                  <input
                    type="text"
                    {...register("name", {
                      required: "Society name is required",
                      minLength: {
                        value: 2,
                        message: "Society name must be at least 2 characters",
                      },
                    })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter society name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    {...register("registration_number")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter registration number"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Established Date
                  </label>
                  <input
                    type="date"
                    {...register("established_date")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "location":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Location Details
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complete Address *
                  </label>
                  <textarea
                    {...register("address", {
                      required: "Address is required",
                      minLength: {
                        value: 10,
                        message: "Please enter a complete address",
                      },
                    })}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.address ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter complete address"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      {...register("city", {
                        required: "City is required",
                        minLength: {
                          value: 2,
                          message: "City name must be at least 2 characters",
                        },
                      })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        errors.city ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter city"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.city.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      {...register("state", {
                        required: "State is required",
                        minLength: {
                          value: 2,
                          message: "State name must be at least 2 characters",
                        },
                      })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        errors.state ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter state"
                    />
                    {errors.state && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.state.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      {...register("pincode", {
                        required: "Pincode is required",
                        pattern: {
                          value: /^\d{6}$/,
                          message: "Pincode must be exactly 6 digits",
                        },
                      })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        errors.pincode ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter 6-digit pincode"
                      maxLength={6}
                    />
                    {errors.pincode && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.pincode.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "contact":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Society Phone Number *
                  </label>
                  <input
                    type="tel"
                    {...register("phone", {
                      required: "Phone number is required",
                      pattern: {
                        value: /^\d{10}$/,
                        message: "Phone must be exactly 10 digits",
                      },
                    })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter 10-digit phone number"
                    maxLength={10}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case "property":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Property Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Number of Units *
                  </label>
                  <input
                    type="number"
                    min="1"
                    {...register("total_units", {
                      required: "Total units is required",
                      min: {
                        value: 1,
                        message: "Total units must be at least 1",
                      },
                      valueAsNumber: true,
                    })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.total_units ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter total number of units"
                  />
                  {errors.total_units && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.total_units.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case "maintenance":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Maintenance Configuration
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">
                      Maintenance Rate Information
                    </h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Set the maintenance rate per square foot. This will be
                      used to calculate monthly maintenance charges for
                      residents based on their unit size.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maintenance Rate (₹ per sq ft)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    {...register("maintenance_rate", {
                      min: {
                        value: 0,
                        message: "Rate cannot be negative",
                      },
                      valueAsNumber: true,
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter maintenance rate per sqft"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Example: If rate is ₹2.50, a 1000 sq ft unit will pay
                    ₹2,500/month
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maintenance Fixed Amount (₹ per month)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    {...register("maintenance_amount", {
                      min: {
                        value: 0,
                        message: "Rate cannot be negative",
                      },
                      valueAsNumber: true,
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter maintenance rate per sqft"
                  />
                </div>
              </div>
            </div>
          </div>
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
        const res = await fetchOrganization({ orgId });

        if (!res) {
          setOrganization(null);
          return;
        }

        const { data }: FetchOrganizationResponse = res;

        let establishedDate = "";

        if (data?.[0].established_date) {
          const date = new Date(data?.[0].established_date);
          // Fix: Format as YYYY-MM-DD with leading zeros
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          establishedDate = `${year}-${month}-${day}`;
        }

        if (data?.[0]) {
          setOrganization(data?.[0]);
          // Populate form fields
          setValue("name", data?.[0].name || "");
          setValue("address", data?.[0].address || "");
          setValue("city", data?.[0].city || "");
          setValue("state", data?.[0].state || "");
          setValue("pincode", data?.[0].pincode || "");
          setValue("phone", data?.[0].phone || "");
          setValue("registration_number", data?.[0].registration_number || "");
          setValue("established_date", establishedDate);
          setValue("total_units", data?.[0].total_units || 0);
          setValue("maintenance_rate", data?.[0].maintenance_rate || 0);
          setValue("maintenance_amount", data?.[0].maintenance_amount || 0);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        toast.error("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    handleFetchOrganization();
    fetchResidents({ orgId, sortBy: "unit_number", sortOrder: "asc" });
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    Society Configuration
                  </h1>
                  <p className="text-sm text-gray-500">{organization.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex whitespace-nowrap items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
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
        <div className="mt-8">
          <button
            type="button"
            onClick={() => setIsOnboardModalOpen(true)}
            className="mb-4 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
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
            onSearch={(searchQuery) => {
              debouncedSearch(searchQuery);
            }}
          />
        </div>
      </div>
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
          setIsDeleteConfirmationModalOpen(false)
        }}
      />
    </div>
  );
};

export default SocietyConfigurationPage;
