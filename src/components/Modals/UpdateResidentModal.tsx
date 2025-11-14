/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
  User,
  Home,
  Users,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Save,
} from "lucide-react";
import Modal from "./Modal";
import toast from "react-hot-toast";
import { supabase } from "../../libs/supabase/supabaseClient";
import { useProfileStore } from "../../libs/stores/useProfileStore";
import useAdminService from "../../hooks/serviceHooks/useAdminService";
import type { IProfile } from "../../types/user.types";

export interface UpdateResidentFormData {
  // Personal Info
  fullName: string;
  phone: string;
  role: string;
  emergencyContact: string;
  emergencyContactName: string;

  // Unit Info
  unitNumber: string;
  squareFootage: string;
  unitType:
    | "1BHK"
    | "2BHK"
    | "3BHK"
    | "4BHK"
    | "Studio"
    | "Penthouse"
    | "Other";

  // Family Info
  totalFamilyMembers: number;
  adultsCount: number;
  childrenCount: number;

  // Vehicle Info
  hasVehicle: boolean;
  twoWheelerCount: number;
  fourWheelerCount: number;
}

interface UpdateResidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  resident: IProfile | null;
}

const UpdateResidentModal: React.FC<UpdateResidentModalProps> = ({
  isOpen,
  onClose,
  resident,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { profile } = useProfileStore();
  const { fetchResidents } = useAdminService();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    trigger,
    reset,
    watch,
    setValue,
  } = useForm<UpdateResidentFormData>({
    defaultValues: {
      fullName: "",
      phone: "",
      role: "resident",
      emergencyContact: "",
      emergencyContactName: "",
      unitNumber: "",
      squareFootage: "",
      unitType: "2BHK",
      totalFamilyMembers: 1,
      adultsCount: 1,
      childrenCount: 0,
      hasVehicle: false,
      twoWheelerCount: 0,
      fourWheelerCount: 0,
    },
  });

  const watchHasVehicle = watch("hasVehicle");

  const steps = [
    { id: 1, title: "Personal", icon: User },
    { id: 2, title: "Unit Info", icon: Home },
    { id: 3, title: "Family", icon: Users },
    { id: 4, title: "Vehicles", icon: CreditCard },
  ];

  // Populate form when resident data is available
  useEffect(() => {
    if (resident && isOpen) {
      // Basic info
      setValue("fullName", resident.full_name || "");
      setValue("phone", resident.phone || "");
      setValue("role", resident?.role || "");
      setValue("unitNumber", resident.unit_number || "");
      setValue("squareFootage", resident.square_footage?.toString() || "");

      // Handle emergency contact (assuming it's stored as JSON)
      const emergencyContact = (resident as any).emergency_contact;
      if (emergencyContact) {
        setValue("emergencyContactName", emergencyContact.name || "");
        setValue("emergencyContact", emergencyContact.phone || "");
      }

      // Handle family members (assuming it's stored as JSON)
      const familyMembers = (resident as any).family_members;
      if (familyMembers) {
        const adults = familyMembers.adult || 1;
        const children = familyMembers.child || 0;
        setValue("adultsCount", adults);
        setValue("childrenCount", children);
        setValue("totalFamilyMembers", adults + children);
      }

      // Handle vehicles (assuming it's stored as JSON)
      const vehicles = (resident as any).vehicles;
      if (vehicles) {
        setValue("hasVehicle", vehicles.hasVehicles || false);
        setValue("twoWheelerCount", vehicles.twoWheeler || 0);
        setValue("fourWheelerCount", vehicles.fourWheeler || 0);
      }

      // Handle unit type
      const unitType = (resident as any).unit_type;
      if (unitType) {
        setValue("unitType", unitType);
      }
    }
  }, [resident, isOpen, setValue]);

  const stepFields = {
    1: ["fullName", "phone"],
    2: ["unitNumber"],
    3: ["totalFamilyMembers", "adultsCount", "childrenCount"],
    4: [], // Vehicle step doesn't have required fields
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

  const onFormSubmit: SubmitHandler<UpdateResidentFormData> = async (data) => {
    if (!resident?.id) {
      toast.error("Resident ID not found");
      return;
    }

    setIsSubmitting(true);
    try {
      const updateData = {
        full_name: data.fullName,
        phone: data.phone,
        role: data.role,
        unit_number: data.unitNumber,
        unit_type: data.unitType,
        square_footage: data.squareFootage
          ? parseInt(data.squareFootage)
          : null,
        emergency_contact: {
          name: data.emergencyContactName,
          phone: data.emergencyContact,
        },
        family_members: {
          child: data.childrenCount,
          adult: data.adultsCount,
        },
        vehicles: {
          hasVehicles: data.hasVehicle,
          twoWheeler: data.twoWheelerCount,
          fourWheeler: data.fourWheelerCount,
        },
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", resident.id);

      if (error) {
        console.error("Update error:", error);
        toast.error(error.message);
        return;
      }

      await fetchResidents({
        orgId: profile?.organization_id,
        sortBy: "unit_number",
        sortOrder: "asc",
      });

      onClose();
      setCurrentStep(1);
      toast.success("Resident updated successfully!");
    } catch (error) {
      console.error("Error updating resident:", error);
      toast.error("Failed to update resident!");
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
                <User className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Personal Information
              </h3>
              <p className="text-sm text-gray-600">
                Update resident's basic details
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                {...register("fullName", {
                  required: "Full name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.fullName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter full name"
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <select
                {...register("role", {
                  required: "Role is required",
                })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.role ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="admin">Admin</option>
                <option value="committee_member">committee_member</option>
                <option value="resident">Resident</option>
                <option value="tenant">Tenant</option>
              </select>
              {errors.role && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.role.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  {...register("emergencyContactName")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Contact person name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Contact
                </label>
                <input
                  type="tel"
                  {...register("emergencyContact", {
                    pattern: {
                      value: /^\d{10}$/,
                      message: "Phone must be exactly 10 digits",
                    },
                  })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.emergencyContact
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Emergency phone"
                  maxLength={10}
                />
                {errors.emergencyContact && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.emergencyContact.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-3">
                <Home className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Unit Information
              </h3>
              <p className="text-sm text-gray-600">Update unit details</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit Number *
                </label>
                <input
                  type="text"
                  {...register("unitNumber", {
                    required: "Unit number is required",
                  })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.unitNumber ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., A-101"
                />
                {errors.unitNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.unitNumber.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Square Footage
                </label>
                <input
                  type="number"
                  min="0"
                  {...register("squareFootage")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., 1200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Type *
              </label>
              <select
                {...register("unitType", {
                  required: "Unit type is required",
                })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.unitType ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="Studio">Studio</option>
                <option value="1RK">1 RK</option>
                <option value="1BHK">1 BHK</option>
                <option value="2BHK">2 BHK</option>
                <option value="3BHK">3 BHK</option>
                <option value="4BHK">4 BHK</option>
                <option value="Penthouse">Penthouse</option>
                <option value="Other">Other</option>
              </select>
              {errors.unitType && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.unitType.message}
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
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Family Information
              </h3>
              <p className="text-sm text-gray-600">
                Update family member details
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Family Members *
              </label>
              <input
                type="number"
                min="1"
                {...register("totalFamilyMembers", {
                  required: "Total family members is required",
                  min: {
                    value: 1,
                    message: "Must be at least 1",
                  },
                  valueAsNumber: true,
                })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.totalFamilyMembers
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Total number of family members"
              />
              {errors.totalFamilyMembers && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.totalFamilyMembers.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adults *
                </label>
                <input
                  type="number"
                  min="1"
                  {...register("adultsCount", {
                    required: "Adults count is required",
                    min: {
                      value: 1,
                      message: "Must be at least 1",
                    },
                    valueAsNumber: true,
                  })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.adultsCount ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Number of adults"
                />
                {errors.adultsCount && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.adultsCount.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Children
                </label>
                <input
                  type="number"
                  min="0"
                  {...register("childrenCount", {
                    min: {
                      value: 0,
                      message: "Cannot be negative",
                    },
                    valueAsNumber: true,
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Number of children"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-3">
                <CreditCard className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Vehicle Information
              </h3>
              <p className="text-sm text-gray-600">Update vehicle details</p>
            </div>

            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("hasVehicle")}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  I have vehicle(s)
                </span>
              </label>
            </div>

            {watchHasVehicle && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Two Wheelers
                  </label>
                  <input
                    type="number"
                    min="0"
                    {...register("twoWheelerCount", {
                      min: {
                        value: 0,
                        message: "Cannot be negative",
                      },
                      valueAsNumber: true,
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Number of bikes/scooters"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Four Wheelers
                  </label>
                  <input
                    type="number"
                    min="0"
                    {...register("fourWheelerCount", {
                      min: {
                        value: 0,
                        message: "Cannot be negative",
                      },
                      valueAsNumber: true,
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Number of cars"
                  />
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen || !resident) return null;

  return (
    <Modal
      title={`Update ${resident.full_name}`}
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
              disabled={isSubmitting || !isDirty}
              className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Update Resident
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default UpdateResidentModal;
