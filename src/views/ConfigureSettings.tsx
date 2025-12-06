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
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import Maintenance from "../components/configureSettings/Maintenance";
import Basic from "../components/configureSettings/Basic";
import Location from "../components/configureSettings/Location";
import Contact from "../components/configureSettings/Contact";
import Property from "../components/configureSettings/Property";
import { getOrganization } from "../apis/organization.apis";
import Layout from "../components/Layout/Layout";
import useOrganizationApiService from "../hooks/apiHooks/useOrganizationApiService";
import type { IOrganization } from "../types/organization.types";
import Loader from "../components/ui/Loader";
import { siteSetting } from "../config/siteSetting";

const SocietyConfigurationPage: React.FC = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [organization, setOrganization] = useState<IOrganization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const { handleUpdateOrganization } = useOrganizationApiService();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
    trigger,
  } = useForm<IOrganization>();

  const onSubmit = async (data: IOrganization) => {
    if (!orgId) {
      toast.error("Organization ID not found");
      return;
    }

    setIsSubmitting(true);
    try {
      const updateData = {
        ...organization,
        name: data.name,
        address_line_1: data.address_line_1 || "",
        address_line_2: data.address_line_2 || "",
        city: data.city || "",
        state: data.state || "",
        pincode: data.pincode || "",
        phone: data.phone || "",
        registration_number: data.registration_number || "",
        established_date: data.established_date || "",
        total_units: data.total_units,
        maintenance_rate: data.maintenance_rate || 0,
        maintenance_amount: data.maintenance_amount || 0,
        tenant_maintenance_rate: data.tenant_maintenance_rate || 0,
        tenant_maintenance_amount: data.tenant_maintenance_amount || 0,
        extras: data.extras || [],
        due_date: Number(data.due_date),
        penalty_rate: data?.penalty_rate || 0,
        penalty_amount: data?.penalty_amount || 0,
        calculate_maintenance_by: data?.calculate_maintenance_by,
      };

      await handleUpdateOrganization({
        data: updateData as IOrganization,
        id: orgId,
      });
      toast.success("Society configuration updated successfully!");
    } catch (error: any) {
      console.error("Error updating society:", error);
      if (error instanceof Error) {
        toast.error(error.message || "Failed to update society configuration!");
      } else {
        toast.error("Failed to update society configuration!");
      }
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
        return <Basic errors={errors} register={register} watch={watch} />;

      case "location":
        return <Location errors={errors} register={register} watch={watch} />;

      case "contact":
        return <Contact errors={errors} register={register} watch={watch} />;

      case "property":
        return <Property errors={errors} register={register} watch={watch} />;

      case "maintenance":
        return (
          <Maintenance
            setValue={setValue}
            watch={watch}
            register={register}
            control={control}
            trigger={trigger}
            errors={errors}
          />
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
          setValue("address_line_1", data?.address_line_1 || "");
          setValue("address_line_2", data?.address_line_2 || "");
          setValue("city", data?.city || "");
          setValue("state", data?.state || "");
          setValue("pincode", data?.pincode || "");
          setValue("phone", data?.phone || "");
          setValue("registration_number", data?.registration_number || "");
          setValue("established_date", establishedDate);
          setValue("total_units", data?.total_units || 0);
          setValue("maintenance_rate", data?.maintenance_rate);
          setValue("maintenance_amount", data?.maintenance_amount);
          setValue("due_date", data?.due_date || "");
          setValue("penalty_amount", data?.penalty_amount);
          setValue("penalty_rate", data?.penalty_rate);
          setValue("tenant_maintenance_rate", data?.tenant_maintenance_rate);
          setValue(
            "tenant_maintenance_amount",
            data?.tenant_maintenance_amount
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

  return (
    <Layout
      role="admin"
      visibileTopSection={false}
      pageHeader={{
        description:
          "Configure your society's information and maintenance settings",
        title: "Society Settings",
        icon: <Building2 className="w-6 h-6 text-[#0154AC]" />,
      }}
    >
      {isLoading ? (
        <div className="min-h-screen bg-gray-50 flex mt-[150px] justify-center">
          <Loader />
        </div>
      ) : true || !organization ? (
        <div className="min-h-screen bg-gray-50 flex mt-[150px] justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Organization not found
            </h2>
            <p className="text-gray-600 mb-4">
              Unable to load organization details.
            </p>
            <button
              onClick={() => navigate(-1)}
              className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2  text-white bg-[${siteSetting?.mainColor}] rounded-lg`}
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>
        </div>
      ) : (
        <div className="mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Tab Navigation - Mobile First */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto scrollbar-hide">
                <nav className="flex gap-1 p-2 bg-gray-50/50" aria-label="Tabs">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                        activeTab === tab.id
                          ? "bg-[#0154AC] text-white shadow-md"
                          : "text-gray-600 hover:bg-white hover:text-gray-900"
                      }`}
                    >
                      <tab.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-4 sm:p-6 bg-white min-h-[400px]">
                {renderTabContent()}
              </div>
            </div>

            {/* Sticky Save Button - Mobile Optimized */}
            <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg rounded-t-xl sm:rounded-xl sm:border sm:shadow-sm p-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto sm:min-w-[200px] inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0154AC] text-white rounded-lg hover:bg-[#013d8a] transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Configuration</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
};

export default SocietyConfigurationPage;
