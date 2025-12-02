/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
  User,
  Home,
  Users,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Save,
} from "lucide-react";
import Modal from "./Modal";
import toast from "react-hot-toast";
import type { IProfile, TRole } from "../../types/user.types";
import type { IUnit } from "../../types/unit.types";
import ActionModalHeader from "../ActionModalHeader";
import CustomInput from "../ui/CustomInput";
import CustomSelect from "../ui/CustomSelect";
import useProfileApiService from "../../hooks/apiHooks/useProfileApiService";
import useUnitApiService from "../../hooks/apiHooks/useUnitApiService";

export interface UpdateResidentFormData {
  // Personal Info
  fullName: string;
  phone: string;
  role: TRole;
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
  is_tenant: boolean;
}

interface UpdateResidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  resident: IUnit | null;
  callback?: () => void;
}

const UpdateResidentModal: React.FC<UpdateResidentModalProps> = ({
  isOpen,
  onClose,
  resident,
  callback,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleUpdateProfile } = useProfileApiService();
  const { handleUpdateUnit } = useUnitApiService();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    trigger,
    reset,
    watch,
    setValue,
  } = useForm<UpdateResidentFormData>();

  // Populate form when resident data is available
  useEffect(() => {
    if (resident && resident.profile && isOpen) {
      // Basic info from profile
      setValue("fullName", resident.profile.full_name || "");
      setValue("phone", resident.profile.phone || "");
      setValue("role", resident.profile?.role || "");
      setValue("is_tenant", resident.profile.is_tenant || false);

      // Unit info from unit
      setValue("unitNumber", resident.unit_number || "");
      setValue("squareFootage", resident.square_footage?.toString() || "");
      setValue(
        "unitType",
        (resident.unit_type as UpdateResidentFormData["unitType"]) || ""
      );

      // Handle emergency contact (assuming it's stored as JSON)
      const emergencyContact = (resident.profile as any).emergency_contact;
      if (emergencyContact) {
        setValue("emergencyContactName", emergencyContact.name || "");
        setValue("emergencyContact", emergencyContact.phone || "");
      }

      // Handle family members (assuming it's stored as JSON)
      const familyMembers = (resident.profile as any).family_members;
      if (familyMembers) {
        const adults = familyMembers.adult || 1;
        const children = familyMembers.child || 0;
        setValue("adultsCount", adults);
        setValue("childrenCount", children);
        setValue("totalFamilyMembers", adults + children);
      }

      // Handle vehicles (assuming it's stored as JSON)
      const vehicles = (resident.profile as any).vehicles;
      if (vehicles) {
        setValue("twoWheelerCount", vehicles.twoWheeler || 0);
        setValue("fourWheelerCount", vehicles.fourWheeler || 0);
      }
    }
  }, [resident, isOpen, setValue]);

  const stepFields = {
    1: ["fullName", "phone"],
    2: ["unitNumber", "squareFootage"],
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
    if (!resident?.id || !resident?.profile?.id) {
      toast.error("Resident ID not found");
      return;
    }

    setIsSubmitting(true);
    try {
      // Update profile data
      const profileUpdateData: IProfile = {
        full_name: data.fullName,
        phone: data.phone,
        role: data.role,
        is_tenant: data.is_tenant,
        emergency_contact: {
          name: data.emergencyContactName,
          phone: data.emergencyContact,
        },
        family_members: {
          child: data.childrenCount || 0,
          adult: data.adultsCount || 0,
        },
        vehicles: {
          twoWheeler: data.twoWheelerCount,
          fourWheeler: data.fourWheelerCount,
        },
      };

      // Update unit data
      const unitUpdateData: Partial<IUnit> = {
        unit_number: data.unitNumber,
        unit_type: data.unitType,
        square_footage: Number(data?.squareFootage),
      };

      await handleUpdateProfile({
        id: resident.profile.id,
        data: profileUpdateData,
      });
      await handleUpdateUnit({
        id: resident.id,
        data: unitUpdateData as IUnit,
      });

      callback?.();
      onClose();
      setCurrentStep(1);
      toast.success("Resident updated successfully!");
    } catch (error: any) {
      console.error("Error updating resident:", error);
      toast.error(error?.message || "Failed to update resident!");
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log(watch("squareFootage"));

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
            <ActionModalHeader
              Icon={User}
              title="Personal Information"
              desc="Update resident's basic details"
              currentStep={1}
              totalSteps={4}
            />

            <CustomInput
              key="fullName"
              label="Full Name"
              type="text"
              {...register("fullName", {
                required: "Full name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              })}
              error={errors.fullName}
              value={watch("fullName")}
            />

            <CustomInput
              key="phone"
              label="Phone Number"
              type="tel"
              {...register("phone", {
                required: "Phone number is required",
                pattern: {
                  value: /^\d{10}$/,
                  message: "Phone must be exactly 10 digits",
                },
              })}
              error={errors.phone}
              value={watch("phone")}
              maxLength={10}
            />

            <CustomSelect
              key="role"
              label="Role"
              {...register("role", { required: "Role is required" })}
              error={errors.role}
            >
              <option value="resident">Resident</option>
              <option value="admin">Admin</option>
              <option value="committee_member">Committee Member</option>
            </CustomSelect>

            <div className="grid grid-cols-2 gap-3">
              <CustomInput
                key="emergencyContactName"
                label="Emergency Contact Name"
                type="text"
                {...register("emergencyContactName")}
                error={errors.emergencyContactName}
                value={watch("emergencyContactName")}
              />
              <CustomInput
                key="emergencyContact"
                label="Emergency Contact"
                type="tel"
                {...register("emergencyContact", {
                  pattern: {
                    value: /^\d{10}$/,
                    message: "Phone must be exactly 10 digits",
                  },
                })}
                error={errors.emergencyContact}
                value={watch("emergencyContact")}
                maxLength={10}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <ActionModalHeader
              Icon={Home}
              title="Unit Information"
              desc="Update unit details"
              currentStep={2}
              totalSteps={4}
            />

            <div className="grid grid-cols-2 gap-3">
              <CustomInput
                key="unitNumber"
                label="Unit Number"
                type="text"
                {...register("unitNumber", {
                  required: "Unit number is required",
                })}
                error={errors.unitNumber}
                value={watch("unitNumber")}
              />

              <CustomInput
                key="squareFootage"
                label="Square Footage"
                type="number"
                {...register("squareFootage", {
                  required: "Square footage is required",
                })}
                error={errors.squareFootage}
                value={watch("squareFootage")}
              />
            </div>

            <CustomSelect
              key="unitType"
              label="Unit Type"
              {...register("unitType", {
                required: "Unit type is required",
              })}
              error={errors.unitType}
            >
              <option value="Studio">Studio</option>
              <option value="1RK">1 RK</option>
              <option value="1BHK">1 BHK</option>
              <option value="2BHK">2 BHK</option>
              <option value="3BHK">3 BHK</option>
              <option value="4BHK">4 BHK</option>
              <option value="Penthouse">Penthouse</option>
              <option value="Other">Other</option>
            </CustomSelect>

            <div>
              <label className="flex items-center space-x-3 cursor-pointer w-fit">
                <input
                  key="is_tenant"
                  type="checkbox"
                  {...register("is_tenant")}
                  className="w-4 h-4 text-[#0154AC] rounded focus:ring-[#0154AC] accent-[#0154AC]"
                />
                <span className="text-sm font-medium text-gray-700 w-fit ">
                  Has Tenant
                </span>
              </label>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <ActionModalHeader
              Icon={Users}
              title="Family Information"
              desc="Update family member details"
              currentStep={3}
              totalSteps={4}
            />

            <div className="grid grid-cols-2 gap-3">
              <CustomInput
                key="adultsCount"
                label="Adults"
                type="number"
                {...register("adultsCount", {
                  required: "Adults count is required",
                  min: {
                    value: 1,
                    message: "Must be at least 1",
                  },
                  valueAsNumber: true,
                })}
                error={errors.adultsCount}
                value={watch("adultsCount")}
              />

              <CustomInput
                key="childrenCount"
                label="Children"
                type="number"
                {...register("childrenCount", {
                  min: {
                    value: 0,
                    message: "Cannot be negative",
                  },
                  valueAsNumber: true,
                })}
                error={errors.childrenCount}
                value={watch("childrenCount")}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <ActionModalHeader
              Icon={CreditCard}
              title="Vehicle Information"
              desc="Update vehicle details"
              currentStep={4}
              totalSteps={4}
            />

            <div className="grid grid-cols-2 gap-3 mt-4">
              <CustomInput
                key="twoWheelerCount"
                label="Two Wheelers"
                type="number"
                {...register("twoWheelerCount", {
                  min: {
                    value: 0,
                    message: "Cannot be negative",
                  },
                  valueAsNumber: true,
                })}
                error={errors.twoWheelerCount}
                value={watch("twoWheelerCount")}
              />

              <CustomInput
                key="fourWheelerCount"
                label="Four Wheelers"
                type="number"
                {...register("fourWheelerCount", {
                  min: {
                    value: 0,
                    message: "Cannot be negative",
                  },
                  valueAsNumber: true,
                })}
                error={errors.fourWheelerCount}
                value={watch("fourWheelerCount")}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen || !resident || !resident.profile) return null;

  return (
    <Modal
      title={`Update ${resident.profile.full_name}`}
      isOpen={isOpen}
      onClose={handleModalClose}
      size="lg"
    >
      <form onSubmit={handleSubmit(onFormSubmit)}>
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
