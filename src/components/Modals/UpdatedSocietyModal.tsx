import React, { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
  Building2,
  Phone,
  Hash,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Save,
} from "lucide-react";
import Modal from "./Modal";
import toast from "react-hot-toast";
import ActionModalHeader from "../ActionModalHeader";
import CustomInput from "../ui/CustomInput";
import useOrganizationApiService from "../../hooks/apiHooks/useOrganizationApiService";
import type { TUpdateOrganizationData } from "../../types/organization.types";
import CustomSelect from "../ui/CustomSelect";

interface UpdateSocietyModalProps {
  isOpen: boolean;
  onClose: () => void;
  callback?: () => void;
  orgId: string | null;
}

const UpdateSocietyModal: React.FC<UpdateSocietyModalProps> = ({
  isOpen,
  onClose,
  orgId,
  callback,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleUpdateOrganization, handleGetOrganization } =
    useOrganizationApiService();
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<TUpdateOrganizationData | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    reset,
    setValue,
    watch,
  } = useForm<TUpdateOrganizationData>();

  const stepFields = {
    1: ["name"],
    2: ["address_line_1", "address_line_2", "city", "state", "pincode"],
    3: ["phone"],
    4: ["total_units"],
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

  const onFormSubmit: SubmitHandler<TUpdateOrganizationData> = async (
    input
  ) => {
    setIsSubmitting(true);
    try {
      const payload: TUpdateOrganizationData = {
        ...(input.name ? { name: input?.name } : {}),
        ...(input.registration_number
          ? { registration_number: input?.registration_number }
          : {}),
        ...(input.established_date
          ? { established_date: input?.established_date }
          : {}),
        ...(input.address_line_1
          ? { address_line_1: input?.address_line_1 }
          : {}),
        ...(input.address_line_2
          ? { address_line_2: input?.address_line_2 }
          : {}),
        ...(input.city ? { city: input?.city } : {}),
        ...(input.state ? { state: input?.state } : {}),
        ...(input.pincode ? { pincode: input?.pincode } : {}),
        ...(input.phone ? { phone: input?.phone } : {}),
        ...(input.total_units ? { total_units: input?.total_units } : {}),
        is_prev: `${input.is_prev}` === "true" ? true : false,
      };
      await handleUpdateOrganization({ id: data?.id as string, data: payload });
      callback?.();
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
            <ActionModalHeader
              Icon={Building2}
              currentStep={1}
              totalSteps={4}
              desc="Let's start with your society's basic details"
              title="Basic Information"
            />

            <CustomInput
              type="text"
              label="Society Name"
              {...register("name", {
                required: "Society name is required",
                minLength: {
                  value: 2,
                  message: "Society name must be at least 2 characters",
                },
              })}
              error={errors.name}
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
              totalSteps={4}
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
                  minLength: {
                    value: 2,
                    message: "City name must be at least 2 characters",
                  },
                })}
                error={errors.city}
                value={watch("city")}
              />

              <CustomInput
                type="text"
                label="State"
                {...register("state", {
                  required: "State is required",
                  minLength: {
                    value: 2,
                    message: "State name must be at least 2 characters",
                  },
                })}
                error={errors.state}
                value={watch("state")}
              />
            </div>

            <CustomInput
              type="text"
              label="Pincode"
              {...register("pincode", {
                required: "Pincode is required",
              })}
              error={errors.pincode}
              value={watch("pincode")}
              maxLength={6}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <ActionModalHeader
              Icon={Phone}
              currentStep={3}
              totalSteps={4}
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
              error={errors.phone}
              value={watch("phone")}
              maxLength={10}
              inputMode="numeric"
              pattern="[0-9]*"
              onKeyDown={(e) => {
                if (
                  !e.key.match(/[0-9]/) &&
                  !["Backspace", "ArrowLeft", "ArrowRight", "Tab"].includes(
                    e.key
                  )
                ) {
                  e.preventDefault();
                }
              }}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <ActionModalHeader
              Icon={Hash}
              currentStep={4}
              totalSteps={4}
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

  useEffect(() => {
    if (!isOpen || !orgId) {
      return;
    }

    setLoading(true);
    handleGetOrganization(orgId)
      .then((res) => {
        setValue("name", res?.name);
        setValue("registration_number", res?.registration_number);
        setValue("established_date", res?.established_date);
        setValue("address_line_1", res?.address_line_1);
        setValue("address_line_2", res?.address_line_2);
        setValue("city", res?.city);
        setValue("state", res?.state);
        setValue("pincode", res?.pincode);
        setValue("phone", res?.phone);
        setValue("total_units", res?.total_units);
        setValue("is_prev", res?.is_prev);
        setData(res);
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [orgId, isOpen]);

  if (!isOpen) return null;

  return (
    <Modal
      title="Update Society"
      isOpen={isOpen}
      onClose={handleModalClose}
      size="lg"
    >
      <form onSubmit={handleSubmit(onFormSubmit)}>
        {loading && <p className="text-center text-gray-500">Loading...</p>}

        {!loading && !data && (
          <p className="text-center text-gray-500">No data found.</p>
        )}

        {!loading && data && (
          <>
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

              {currentStep < 4 ? (
                <div className="flex items-center gap-2">
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

                  <button
                    type="button"
                    onClick={nextStep}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Next Step
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
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
          </>
        )}
      </form>
    </Modal>
  );
};

export default UpdateSocietyModal;
