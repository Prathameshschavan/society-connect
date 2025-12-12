import React, { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
  User,
  Users,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  CheckCircle,
} from "lucide-react";
import Modal from "./Modal";
import toast from "react-hot-toast";
import type { IProfile, TRole } from "../../types/user.types";
import ActionModalHeader from "../ActionModalHeader";
import CustomInput from "../ui/CustomInput";
import useProfileApiService from "../../hooks/apiHooks/useProfileApiService";
import { GenericSelect } from "../ui/GenericSelect";

export interface UpdateResidentFormData {
  // Personal Info
  fullName: string;
  phone: string;
  role: TRole;
  emergencyContact: string;
  emergencyContactName: string;

  // Family Info
  adultsCount: number;
  childrenCount: number;

  // Vehicle Info
  twoWheelerCount: number;
  fourWheelerCount: number;
  is_tenant: boolean;
}

interface UpdateResidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  resident: IProfile | null;
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
    if (resident && isOpen) {
      // Basic info from profile
      setValue("fullName", resident.full_name || "");
      setValue("phone", resident.phone || "");
      setValue("role", resident?.role || "");
      setValue("is_tenant", resident.is_tenant || false);

      // Handle emergency contact (assuming it's stored as JSON)
      const emergencyContact = resident.emergency_contact;
      if (emergencyContact) {
        setValue("emergencyContactName", emergencyContact.name || "");
        setValue("emergencyContact", emergencyContact.phone || "");
      }

      // Handle family members (assuming it's stored as JSON)
      const familyMembers = resident.family_members;
      if (familyMembers) {
        const adults = familyMembers.adult || 1;
        const children = familyMembers.child || 0;
        setValue("adultsCount", adults);
        setValue("childrenCount", children);
      }

      // Handle vehicles (assuming it's stored as JSON)
      const vehicles = resident.vehicles;
      if (vehicles) {
        setValue("twoWheelerCount", vehicles.twoWheeler || 0);
        setValue("fourWheelerCount", vehicles.fourWheeler || 0);
      }
    }
  }, [resident, isOpen, setValue]);

  const stepFields = {
    1: ["fullName", "phone"],
    2: ["adultsCount", "childrenCount"],
    3: [], // Vehicle step doesn't have required fields
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
      setCurrentStep((prev) => Math.min(prev + 1, 3));
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
      const profileUpdateData = {
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
          twoWheeler: Number(data.twoWheelerCount || 0),
          fourWheeler: Number(data.fourWheelerCount || 0),
        },
      };

      await handleUpdateProfile({
        id: resident.id,
        data: profileUpdateData,
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

  const handleModalClose = () => {
    setCurrentStep(1);
    reset();
    onClose();
  };

  const onError = (errors: any) => {
    console.log("Form Errors:", errors);
    toast.error(
      "Please check the form for errors. Some required fields are missing or invalid."
    );
  };

  const renderStepContent = () => {
    return (
      <>
        <div className={currentStep === 1 ? "block" : "hidden"}>
          <div className="space-y-4">
            <ActionModalHeader
              Icon={User}
              title="Personal Information"
              desc="Update resident's basic details"
              currentStep={1}
              totalSteps={3}
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

            <GenericSelect
              id="role"
              key={"role"}
              label="Role"
              onChange={(e) => {
                setValue("role", e);
              }}
              options={[
                { value: "resident", label: "Resident" },
                { value: "admin", label: "Admin" },
                { value: "committee_member", label: "Committee Member" },
              ]}
              value={watch("role")}
            />

            <div>
              <label className="flex items-center space-x-3 cursor-pointer w-fit">
                <input
                  type="checkbox"
                  {...register("is_tenant")}
                  className="w-4 h-4 text-[#0154AC] rounded focus:ring-[#0154AC] accent-[#0154AC]"
                />
                <span className="text-sm font-medium text-gray-700 w-fit ">
                  Has Tenant
                </span>
              </label>
            </div>

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

        <div className={currentStep === 2 ? "block" : "hidden"}>
          <div className="space-y-4">
            <ActionModalHeader
              Icon={Users}
              title="Family Information"
              desc="Update family member details"
              currentStep={2}
              totalSteps={3}
            />

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

        <div className={currentStep === 3 ? "block" : "hidden"}>
          <div className="space-y-4">
            <ActionModalHeader
              Icon={CreditCard}
              title="Vehicle Information"
              desc="Update vehicle details"
              currentStep={3}
              totalSteps={3}
            />

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
      </>
    );
  };

  if (!isOpen || !resident) return null;

  return (
    <Modal
      title={`Update ${resident.full_name}`}
      isOpen={isOpen}
      onClose={handleModalClose}
      size="lg"
    >
      <form onSubmit={handleSubmit(onFormSubmit, onError)}>
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
            <ArrowLeft className="md:w-4 md:h-4 w-6 h-6" />
            <span className="hidden md:inline">Previous</span>
          </button>

          {currentStep < 3 ? (
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting || !isDirty}
                className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="hidden md:inline">Updating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="md:w-4 md:h-4 w-6 h-6" />
                    <span className="hidden md:inline">Complete Update</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <span className="hidden md:inline">Next Step</span>
                <ArrowRight className="md:w-4 md:h-4 w-6 h-6" />
              </button>
            </div>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="hidden md:inline">Updating...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span className="hidden md:inline">Complete Update</span>
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
