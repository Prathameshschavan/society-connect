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
import toast from "react-hot-toast";
import type { TCreateOrganizationData } from "../../types/organization.types";
import ActionModalHeader from "../ActionModalHeader";
import CustomInput from "../ui/CustomInput";
import useOrganizationApiService from "../../hooks/apiHooks/useOrganizationApiService";
import CustomSelect from "../ui/CustomSelect";

interface OnboardSocietyModalProps {
  isOpen: boolean;
  onClose: () => void;
  callback?: () => void;
}

const OnboardSocietyModal: React.FC<OnboardSocietyModalProps> = ({
  isOpen,
  onClose,
  callback,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleCreateOrganization } = useOrganizationApiService();

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    reset,
    watch,
  } = useForm<TCreateOrganizationData>({
    reValidateMode: "onChange",
    mode: "onChange",
    defaultValues: {
      name: "",
      address_line_1: "",
      address_line_2: "",
      city: "",
      state: "",
      pincode: "",
      phone: "",
      admin: {
        name: "",
        email: "",
        password: "",
        unit_number: "",
      },
      registration_number: "",
      established_date: "",
      total_units: 0,
      is_prev: false,
    },
  });

  const stepFields = {
    1: ["name"],
    2: ["address_line_1", "address_line_2", "city", "state", "pincode"],
    3: ["phone"],
    4: ["admin.email", "admin.name", "admin.password", "admin.unit_number"],
    5: ["total_units"],
  } as const;

  const validateStep = async (step: number): Promise<boolean> => {
    // You can enable below for step validations if needed:
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
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onFormSubmit: SubmitHandler<TCreateOrganizationData> = async (data) => {
    setIsSubmitting(true);
    try {
      const payload: TCreateOrganizationData = {
        ...(data.name ? { name: data?.name } : {}),
        ...(data.address_line_1
          ? { address_line_1: data?.address_line_1 }
          : {}),
        ...(data.address_line_2
          ? { address_line_2: data?.address_line_2 }
          : {}),
        ...(data.city ? { city: data?.city } : {}),
        ...(data.state ? { state: data?.state } : {}),
        ...(data.pincode ? { pincode: data?.pincode } : {}),
        ...(data.registration_number
          ? { registration_number: data?.registration_number }
          : {}),
        ...(data.established_date
          ? { established_date: data?.established_date }
          : {}),
        ...(data.phone ? { phone: data?.phone } : {}),
        ...(data.total_units ? { total_units: data?.total_units } : {}),
        is_prev: `${data.is_prev}` === "true" ? true : false,
        admin: {
          ...data?.admin,
          email: `${data?.admin?.phone}@society.app`,
          password: "123456",
        },
      };

      await handleCreateOrganization(payload);
      callback?.();
      onClose();
      setCurrentStep(1);
      reset();
      toast.success("Society and admin created successfully!");
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        toast.error(error.message || "Society onboarding failed!");
      } else {
        toast.error("Society onboarding failed!");
      }
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
            <ActionModalHeader
              Icon={Building2}
              currentStep={1}
              totalSteps={5}
              desc="Let's start with your society's basic details"
              title="Basic Information"
            />

            <CustomInput
              type="text"
              label="Society Name"
              {...register("name", {
                required: "Society Name is required",
              })}
              error={errors?.name}
              value={watch("name")}
            />

            <CustomInput
              type="text"
              label="Registration Number"
              {...register("registration_number")}
              error={errors?.registration_number}
              value={watch("registration_number")}
            />

            <CustomInput
              type="date"
              label="Established Date"
              {...register("established_date")}
              error={errors?.established_date}
              value={watch("established_date")}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <ActionModalHeader
              Icon={MapPin}
              currentStep={2}
              totalSteps={5}
              desc="Where is your society located?"
              title="Location Details"
            />

            <CustomInput
              type="text"
              label="Address line 1"
              {...register("address_line_1", {
                required: "Address is required",
              })}
              error={errors?.address_line_1}
              value={watch("address_line_1")}
            />

            <CustomInput
              type="text"
              label="Address line 2"
              {...register("address_line_2")}
              error={errors?.address_line_2}
              value={watch("address_line_2")}
            />

            <div className="grid grid-cols-2 gap-3">
              <CustomInput
                type="text"
                label="City"
                {...register("city", {
                  required: "City is required",
                })}
                error={errors?.city}
                value={watch("city")}
              />

              <CustomInput
                type="text"
                label="State"
                {...register("state", {
                  required: "State is required",
                })}
                error={errors?.state}
                value={watch("state")}
              />
            </div>

            <CustomInput
              type="text"
              label="Pincode"
              {...register("pincode", {
                required: "Pincode is required",
              })}
              error={errors?.pincode}
              value={watch("pincode")}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <ActionModalHeader
              Icon={Phone}
              currentStep={3}
              totalSteps={5}
              desc="How can residents reach your society?"
              title="Contact Information"
            />

            <CustomInput
              type="tel"
              label="Society Phone Number"
              {...register("phone", {
                required: "Phone number is required",
                pattern: {
                  value: /^\d{10}$/,
                  message: "Phone must be exactly 10 digits",
                },
              })}
              error={errors?.phone}
              value={watch("phone")}
              maxLength={10}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <ActionModalHeader
              Icon={User}
              currentStep={4}
              totalSteps={5}
              desc="Who will be the primary administrator?"
              title="Admin Contact"
            />

            <CustomInput
              type="text"
              label="Admin Name"
              {...register("admin.name", {
                required: "Admin name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              })}
              error={errors?.admin?.name}
              value={watch("admin.name")}
            />

            <CustomInput
              type="tel"
              label="Admin Phone"
              {...register("admin.phone", {
                required: "Admin phone is required",
                pattern: {
                  value: /^\d{10}$/,
                  message: "Phone must be exactly 10 digits",
                },
              })}
              error={errors?.admin?.phone}
              value={watch("admin.phone")}
              maxLength={10}
            />

            <CustomInput
              type="text"
              label="Admin Unit"
              {...register("admin.unit_number")}
              error={errors?.admin?.unit_number}
              value={watch("admin.unit_number")}
            />
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <ActionModalHeader
              Icon={Hash}
              currentStep={5}
              totalSteps={5}
              desc="Final details about your society"
              title="Property Information"
            />

            <CustomInput
              type="number"
              label="Total Number of Flats"
              {...register("total_units", {
                required: "Total flats is required",
                min: {
                  value: 1,
                  message: "Total flats must be more than 0",
                },
                valueAsNumber: true,
              })}
              error={errors?.total_units}
              value={watch("total_units")}
            />

            <CustomSelect
              {...register("is_prev")}
              label="Create Previous Month Bill"
            >
              <option value={"true"}>Yes</option>
              <option value={"false"}>No</option>
            </CustomSelect>
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
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {renderStepContent()}
        </div>

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
