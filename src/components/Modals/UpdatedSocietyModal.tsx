import React, { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
  Building2,
  Phone,
  Hash,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Save,
} from "lucide-react";
import Modal from "./Modal";
import useOrganizationService from "../../hooks/serviceHooks/useOrganizationService";
import { supabase } from "../../libs/supabase/supabaseClient";
import toast from "react-hot-toast";
import type { Organization } from "../../libs/stores/useOrganizationStore";

export interface UpdateSocietyFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  registrationNumber: string;
  establishedDate: string;
  totalFlats: number;
  maintenanceRatePerSqft: number;
  maintenanceFixedAmount: number;
}

interface UpdateSocietyModalProps {
  isOpen: boolean;
  onClose: () => void;
  societyData: Organization | null;
}

const UpdateSocietyModal: React.FC<UpdateSocietyModalProps> = ({
  isOpen,
  onClose,
  societyData,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { fetchOrganization } = useOrganizationService();

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    reset,
    setValue,
  } = useForm<UpdateSocietyFormData>({
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      phone: "",
      registrationNumber: "",
      establishedDate: "",
      totalFlats: 0,
      maintenanceRatePerSqft: 0,
      maintenanceFixedAmount: 0,
    },
  });

  // Populate form with existing data when modal opens
  useEffect(() => {
    if (societyData && isOpen) {
      setValue("name", societyData.name || "");
      setValue("address", societyData.address || "");
      setValue("city", societyData.city || "");
      setValue("state", societyData.state || "");
      setValue("pincode", societyData.pincode || "");
      setValue("phone", societyData.phone || "");
      setValue("registrationNumber", societyData.registration_number || "");
      setValue("establishedDate", societyData.established_date || "");
      setValue("totalFlats", societyData.total_units || 0);
      setValue("maintenanceRatePerSqft", societyData.maintenance_rate || 0);
      setValue("maintenanceFixedAmount", 0); // Add this field to Organization type if needed
    }
  }, [societyData, isOpen, setValue]);

  const steps = [
    { id: 1, title: "Basic Info", icon: Building2 },
    { id: 2, title: "Location", icon: MapPin },
    { id: 3, title: "Contact", icon: Phone },
    { id: 4, title: "Property", icon: Hash },
  ];

  // Define fields for each step for validation
  const stepFields = {
    1: ["name"],
    2: ["address", "city", "state", "pincode"],
    3: ["phone"],
    4: ["totalFlats"],
  } as const;

  const validateStep = async (step: number): Promise<boolean> => {
    const fieldsToValidate = stepFields[step as keyof typeof stepFields];
    const result = await trigger(fieldsToValidate);
    return result;
  };

  const nextStep = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onFormSubmit: SubmitHandler<UpdateSocietyFormData> = async (data) => {
    if (!societyData?.id) {
      toast.error("Society ID not found");
      return;
    }

    setIsSubmitting(true);
    try {
      const updateData = {
        name: data.name,
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        pincode: data.pincode || "",
        phone: data.phone || "",
        maintenance_rate: data.maintenanceRatePerSqft || 0,
        total_units: data.totalFlats || 0,
        registration_number: data.registrationNumber || "",
        established_date: data.establishedDate || "",
      };

      const { error } = await supabase
        .from("organizations")
        .update(updateData)
        .eq("id", societyData.id);

      if (error) {
        throw new Error(error.message);
      }

      await fetchOrganization({});

      onClose();
      setCurrentStep(1);
      toast.success("Society updated successfully!");
    } catch (error) {
      console.error("Error updating society:", error);
      toast.error("Failed to update society!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setCurrentStep(1);
    reset();
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-3">
                <Building2 className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Basic Information
              </h3>
              <p className="text-sm text-gray-600">
                Update your society's basic details
              </p>
            </div>

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
                {...register("registrationNumber")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter registration number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Established Date
              </label>
              <input
                type="date"
                {...register("establishedDate")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-3">
                <MapPin className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Location Details
              </h3>
              <p className="text-sm text-gray-600">
                Update your society's location information
              </p>
            </div>

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
                rows={2}
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

            <div className="grid grid-cols-2 gap-3">
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
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-3">
                <Phone className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Contact Information
              </h3>
              <p className="text-sm text-gray-600">
                Update your society's contact details
              </p>
            </div>

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
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-3">
                <Hash className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Property Information
              </h3>
              <p className="text-sm text-gray-600">
                Update your society's property details
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Number of Flats *
              </label>
              <input
                type="number"
                min="1"
                {...register("totalFlats", {
                  required: "Total flats is required",
                  min: {
                    value: 1,
                    message: "Total flats must be at least 1",
                  },
                  valueAsNumber: true,
                })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.totalFlats ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter total number of flats"
              />
              {errors.totalFlats && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.totalFlats.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maintenance Rate (₹ per sqft)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                {...register("maintenanceRatePerSqft", {
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maintenance Fixed Amount
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                {...register("maintenanceFixedAmount", {
                  min: {
                    value: 0,
                    message: "Amount cannot be negative",
                  },
                  valueAsNumber: true,
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter maintenance fixed amount"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      title="Update Society"
      isOpen={isOpen}
      onClose={handleModalClose}
      size="lg"
    >
      <form onSubmit={handleSubmit(onFormSubmit)}>
        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-all ${
                    step.id <= currentStep
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step.id < currentStep ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={`ml-2 text-xs font-medium ${
                    step.id <= currentStep ? "text-indigo-600" : "text-gray-400"
                  }`}
                >
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 mx-3 h-0.5 ${
                      step.id < currentStep ? "bg-indigo-600" : "bg-gray-300"
                    }`}
                    style={{ minWidth: "20px" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Next Step
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Update Society
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default UpdateSocietyModal;
