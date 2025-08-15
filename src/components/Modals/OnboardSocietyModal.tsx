import React, { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
  Building2,
  Phone,
  User,
  Hash,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  MapPin,
} from "lucide-react";
import Modal from "./Modal";
import useOrganizationService from "../../hooks/serviceHooks/useOrganizationService";
import { supabase } from "../../libs/supabase/supabaseClient";
import toast from "react-hot-toast";
import { supabaseAdmin } from "../../libs/supabase/supabaseAdmin";
import type { Organization } from "../../libs/stores/useOrganizationStore";

export interface SocietyFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  //   email: string;
  adminContactName: string;
  adminPhone: string;
  adminUnitNumber: string;
  adminSquareFootage: string;
  //   adminEmail: string;
  registrationNumber: string;
  establishedDate: string;
  totalFlats: number;
  maintenanceRatePerSqft: number;
  maintenanceFixedAmount: number;
}

interface OnboardSocietyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OnboardSocietyModal: React.FC<OnboardSocietyModalProps> = ({
  isOpen,
  onClose,
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
  } = useForm<SocietyFormData>({
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      phone: "",
      //   email: "",
      adminContactName: "",
      adminPhone: "",
      adminSquareFootage: "",
      adminUnitNumber: "",
      //   adminEmail: "",
      registrationNumber: "",
      establishedDate: "",
      totalFlats: 0,
      maintenanceRatePerSqft: 0,
      maintenanceFixedAmount: 0,
    },
  });

  const steps = [
    { id: 1, title: "Basic Info", icon: Building2 },
    { id: 2, title: "Location", icon: MapPin },
    { id: 3, title: "Contact", icon: Phone },
    { id: 4, title: "Admin", icon: User },
    { id: 5, title: "Property", icon: Hash },
  ];

  // Define fields for each step for validation
  const stepFields = {
    1: ["name"],
    2: ["address", "city", "state", "pincode"],
    3: ["phone"],
    4: ["adminContactName", "adminPhone"],
    5: ["totalFlats"],
  } as const;

  const validateStep = async (step: number): Promise<boolean> => {
    const fieldsToValidate = stepFields[step as keyof typeof stepFields];
    const result = await trigger(fieldsToValidate);
    return result;
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onFormSubmit: SubmitHandler<SocietyFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const { data: existingUser } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("phone", data.adminPhone)
        .single();

      if (existingUser) {
        toast.error("Admin with is phone number already registered");
        return;
      }

      const syntheticEmail = `${data.adminPhone}@society.app`;

      const organizationData: Omit<
        Organization,
        "id" | "created_at" | "admin"
      > = {
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

      const { data: orgData, error } = await supabase
        .from("organizations")
        .insert([organizationData])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // 4. Create admin user using admin client
      const { error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: syntheticEmail,
        password: "123456",
        email_confirm: true,
        user_metadata: {
          role: "admin",
          full_name: data.adminContactName,
          phone: data.adminPhone,
          organization_id: orgData?.id,
        },
      });

      if (authError) {
        console.error("Auth error:", authError);

        // Cleanup organization if user creation fails
        await supabase.from("organizations").delete().eq("id", orgData.id);

        toast.error(authError.message);
        return;
      }

      await fetchOrganization({});

      onClose();
      setCurrentStep(1);
      reset();
      toast.success("Society and admin created successfully!");
    } catch (error) {
      console.error("Error creating society:", error);
      toast.error("Society onboarding failed!");
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
                Let's start with your society's basic details
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
                Where is your society located?
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
                How can residents reach your society?
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

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Society Email Address *
              </label>
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please enter a valid email address",
                  },
                })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter society email"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div> */}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-3">
                <User className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Admin Contact
              </h3>
              <p className="text-sm text-gray-600">
                Who will be the primary administrator?
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Name *
              </label>
              <input
                type="text"
                {...register("adminContactName", {
                  required: "Admin name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.adminContactName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter admin name"
              />
              {errors.adminContactName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.adminContactName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Phone *
              </label>
              <input
                type="tel"
                {...register("adminPhone", {
                  required: "Admin phone is required",
                  pattern: {
                    value: /^\d{10}$/,
                    message: "Phone must be exactly 10 digits",
                  },
                })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.adminPhone ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter admin phone"
                maxLength={10}
              />
              {errors.adminPhone && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.adminPhone.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Unit
              </label>
              <input
                type="text"
                {...register("adminUnitNumber", {})}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.adminUnitNumber ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter admin unit"
                maxLength={10}
              />
              {errors.adminUnitNumber && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.adminUnitNumber.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Unit's Square Footage
              </label>
              <input
                type="text"
                {...register("adminSquareFootage", {})}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.adminSquareFootage
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Enter admin unit's square footage"
                maxLength={10}
              />
              {errors.adminSquareFootage && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.adminSquareFootage.message}
                </p>
              )}
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Administrator Email *
              </label>
              <input
                type="email"
                {...register("adminEmail", {
                  required: "Administrator email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please enter a valid email address",
                  },
                })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.adminEmail ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter administrator email"
              />
              {errors.adminEmail && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.adminEmail.message}
                </p>
              )}
            </div> */}
          </div>
        );

      case 5:
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
                Final details about your society
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
              <p className="text-xs text-gray-500 mt-1">
                Optional: You can set this up later
              </p>
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
              <p className="text-xs text-gray-500 mt-1">
                Optional: You can set this up later
              </p>
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
      title="Onboard Society"
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

          {currentStep < 5 ? (
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
              className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Complete Setup
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default OnboardSocietyModal;
