import type React from "react";
import type {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormTrigger,
  UseFormWatch,
} from "react-hook-form";
import { Controller } from "react-hook-form";
import type { ExtraItem } from "../../libs/stores/useOrganizationStore";
import { useEffect, useState } from "react";
import { AlertCircle, Minus, Plus, Info } from "lucide-react";
import { Switch } from "../ui/GenericSwitch";
import type { IOrganization } from "../../types/organization.types";
import CustomInput from "../ui/CustomInput";
import CustomSelect from "../ui/CustomSelect";

const Maintenance: React.FC<{
  register: UseFormRegister<IOrganization>;
  setValue: UseFormSetValue<IOrganization>;
  watch: UseFormWatch<IOrganization>;
  control: Control<IOrganization>;
  trigger: UseFormTrigger<IOrganization>;
  errors: FieldErrors<IOrganization>;
}> = ({ register, setValue, watch, control, trigger, errors }) => {
  const watchedExtras = watch("extras") || [];
  const [extras, setExtras] = useState<ExtraItem[]>([]);
  const [isMaintenanceCalculatedByFixed, setIsMaintenanceCalculatedByFixed] =
    useState(watch("calculate_maintenance_by") === "fixed");

  // Sync local state with form state when form value changes externally
  useEffect(() => {
    if (watchedExtras.length !== extras.length) {
      setExtras(watchedExtras);
    } else {
      // Deep comparison by IDs
      const currentIds = extras
        .map((e) => e.id)
        .sort()
        .join(",");
      const watchedIds = watchedExtras
        .map((e) => e.id)
        .sort()
        .join(",");
      if (currentIds !== watchedIds) {
        setExtras(watchedExtras);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedExtras]);

  const addExtra = () => {
    const newExtra: ExtraItem = {
      id: Date.now().toString(),
      name: "",
      month: "",
      amount: 0,
      year: "",
    };
    const updatedExtras = [...extras, newExtra];
    setExtras(updatedExtras);
    setValue("extras", updatedExtras, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const removeExtra = async (id: string) => {
    const updatedExtras = extras.filter((extra) => extra.id !== id);
    setExtras(updatedExtras);
    // Create a new array reference to ensure react-hook-form recognizes the change
    setValue("extras", [...updatedExtras], {
      shouldDirty: true,
      shouldValidate: true,
    });
    // Trigger validation to update form state
    await trigger("extras");
  };

  const updateExtra = (
    id: string,
    field: "name" | "amount",
    value: string | number
  ) => {
    const updatedExtras = extras.map((extra) =>
      extra.id === id ? { ...extra, [field]: value } : extra
    );
    setExtras(updatedExtras);
    setValue("extras", updatedExtras, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // Get error for a specific extra field
  const getExtraError = (index: number, field: "name" | "amount") => {
    const extraErrors = errors.extras as
      | Array<{ name?: { message?: string }; amount?: { message?: string } }>
      | undefined;
    return extraErrors?.[index]?.[field];
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Basic Maintenance Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
            Maintenance Configuration
          </h3>
          <p className="text-sm text-gray-600">
            Configure how maintenance fees are calculated for your society
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-[#0154AC]/5 border border-[#0154AC]/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-[#0154AC] mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                How It Works
              </h4>
              <p className="text-xs sm:text-sm text-gray-700 mt-1">
                Choose between monthly fixed amount or per square foot
                calculation. Tenant rates can be configured separately.
              </p>
            </div>
          </div>
        </div>

        {/* Calculation Type Toggle */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <p className="font-medium text-sm sm:text-base text-gray-900">
              Calculation Method:
            </p>
            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-2">
              <span
                className={`text-xs sm:text-sm font-medium transition-colors ${
                  !isMaintenanceCalculatedByFixed
                    ? "text-[#0154AC]"
                    : "text-gray-600"
                }`}
              >
                Per Sq Ft
              </span>
              <Switch
                checked={isMaintenanceCalculatedByFixed}
                onChange={(value) => {
                  setValue(
                    "calculate_maintenance_by",
                    value ? "fixed" : "perSQFT",
                    { shouldDirty: true }
                  );
                  setIsMaintenanceCalculatedByFixed((prev) => !prev);
                }}
              />
              <span
                className={`text-xs sm:text-sm font-medium transition-colors ${
                  isMaintenanceCalculatedByFixed
                    ? "text-[#0154AC]"
                    : "text-gray-600"
                }`}
              >
                Fixed Amount
              </span>
            </div>
          </div>
        </div>

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Owner Maintenance */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
            <h4 className="font-medium text-gray-900 text-sm sm:text-base flex items-center gap-2">
              <span className="w-1.5 h-5 bg-[#0154AC] rounded-full"></span>
              Owner Maintenance
            </h4>

            {!isMaintenanceCalculatedByFixed ? (
              <div>
                <CustomInput
                  label="Rate (₹ per sq ft)"
                  type="number"
                  {...register("maintenance_rate", {
                    required: "Maintenance rate is required",
                    min: {
                      value: 1,
                      message: "Rate must be at least ₹1",
                    },
                    valueAsNumber: true,
                  })}
                  error={errors?.maintenance_rate}
                  value={watch("maintenance_rate")}
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  💡 Ex: ₹2.50 × 1000 sq ft = ₹2,500/month
                </p>
              </div>
            ) : (
              <CustomInput
                label="Fixed Amount (₹ per month)"
                type="number"
                {...register("maintenance_amount", {
                  required: "Maintenance amount is required",
                  min: {
                    value: 1,
                    message: "Amount must be at least ₹1",
                  },
                  valueAsNumber: true,
                })}
                error={errors?.maintenance_amount}
                value={watch("maintenance_amount")}
              />
            )}
          </div>

          {/* Tenant Maintenance */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-4">
            <h4 className="font-medium text-gray-900 text-sm sm:text-base flex items-center gap-2">
              <span className="w-1.5 h-5 bg-amber-500 rounded-full"></span>
              Tenant Maintenance
            </h4>

            {!isMaintenanceCalculatedByFixed ? (
              <div>
                <CustomInput
                  label="Rate (₹ per sq ft)"
                  type="number"
                  {...register("tenant_maintenance_rate", {
                    required: "Tenant maintenance rate is required",
                    min: {
                      value: 1,
                      message: "Rate must be at least ₹1",
                    },
                    valueAsNumber: true,
                  })}
                  error={errors?.tenant_maintenance_rate}
                  value={watch("tenant_maintenance_rate")}
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  💡 Ex: ₹3.00 × 1000 sq ft = ₹3,000/month
                </p>
              </div>
            ) : (
              <CustomInput
                label="Fixed Amount (₹ per month)"
                type="number"
                {...register("tenant_maintenance_amount", {
                  required: "Tenant maintenance amount is required",
                  min: {
                    value: 1,
                    message: "Amount must be at least ₹1",
                  },
                  valueAsNumber: true,
                })}
                error={errors?.tenant_maintenance_amount}
                value={watch("tenant_maintenance_amount")}
              />
            )}
          </div>

          {/* Penalty */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h4 className="font-medium text-gray-900 text-sm sm:text-base flex items-center gap-2 mb-4">
              <span className="w-1.5 h-5 bg-red-500 rounded-full"></span>
              Late Payment Penalty
            </h4>

            {!isMaintenanceCalculatedByFixed ? (
              <CustomInput
                label="Penalty Rate (₹ per sq ft)"
                type="number"
                {...register("penalty_rate", {
                  required: "Penalty rate is required",
                  min: {
                    value: 1,
                    message: "Rate must be at least ₹1",
                  },
                  valueAsNumber: true,
                })}
                error={errors?.penalty_rate}
                value={watch("penalty_rate")}
              />
            ) : (
              <CustomInput
                label="Penalty Amount (₹)"
                type="number"
                {...register("penalty_amount", {
                  required: "Penalty amount is required",
                  min: {
                    value: 1,
                    message: "Amount must be at least ₹1",
                  },
                  valueAsNumber: true,
                })}
                error={errors?.penalty_amount}
                value={watch("penalty_amount")}
              />
            )}
          </div>

          {/* Due Date */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <h4 className="font-medium text-gray-900 text-sm sm:text-base flex items-center gap-2 mb-4">
              <span className="w-1.5 h-5 bg-green-500 rounded-full"></span>
              Payment Due Date
            </h4>

            <CustomSelect
              label="Due Date Each Month"
              {...register("due_date", { required: "Due date is required" })}
              value={watch("due_date")}
              error={errors?.due_date}
            >
              {[...Array(28).keys()].map((d) => {
                const day = d + 1;
                const suffix =
                  day === 1 ? "st" : day === 2 ? "nd" : day === 3 ? "rd" : "th";
                return (
                  <option key={day} value={day.toString()}>
                    {day}
                    {suffix} of every month
                  </option>
                );
              })}
              <option value="last">Last day of the month</option>
            </CustomSelect>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200"></div>

      {/* Extras Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
              Additional Charges
            </h3>
            <p className="text-sm text-gray-600">
              Add extra charges like parking, generator, etc.
            </p>
          </div>
          <button
            type="button"
            onClick={addExtra}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#22C36E] text-white text-sm font-medium rounded-lg hover:bg-[#1ea05f] transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Add Charge
          </button>
        </div>

        {extras.length > 0 && (
          <div className="bg-amber-50/50 border border-amber-200/50 rounded-xl p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-amber-800">
                These charges will be added to the basic maintenance amount for
                all units.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {extras.map((extra, index) => {
            const nameError = getExtraError(index, "name");
            const amountError = getExtraError(index, "amount");

            return (
              <div
                key={extra.id}
                className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                      Charge Name <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name={`extras.${index}.name` as const}
                      control={control}
                      rules={{
                        required: "Charge name is required",
                        minLength: {
                          value: 1,
                          message: "Name cannot be empty",
                        },
                      }}
                      render={({ field }) => (
                        <>
                          <input
                            type="text"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              updateExtra(extra.id, "name", e.target.value);
                            }}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#0154AC] focus:border-transparent transition-all ${
                              nameError
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300"
                            }`}
                            placeholder="e.g., Parking Fee, Security"
                          />
                          {nameError && (
                            <p className="mt-1 text-xs text-red-600">
                              {nameError.message}
                            </p>
                          )}
                        </>
                      )}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                      Amount (₹) <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name={`extras.${index}.amount` as const}
                      control={control}
                      rules={{
                        required: "Amount is required",
                        min: {
                          value: 0.01,
                          message: "Amount must be greater than 0",
                        },
                      }}
                      render={({ field }) => (
                        <>
                          <input
                            type="number"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => {
                              const value =
                                e.target.value === ""
                                  ? 0
                                  : parseFloat(e.target.value);
                              field.onChange(value);
                              updateExtra(extra.id, "amount", value);
                            }}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#0154AC] focus:border-transparent transition-all ${
                              amountError
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300"
                            }`}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                          />
                          {amountError && (
                            <p className="mt-1 text-xs text-red-600">
                              {amountError.message}
                            </p>
                          )}
                        </>
                      )}
                    />
                  </div>

                  <div className="flex items-end sm:pb-0">
                    <button
                      type="button"
                      onClick={() => removeExtra(extra.id)}
                      className="w-full sm:w-auto p-2.5 rounded-lg transition-all duration-200 text-red-600 hover:bg-red-50 hover:text-red-700 active:scale-95"
                      title="Remove this charge"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {extras.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                <Plus className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                No additional charges
              </p>
              <p className="text-xs text-gray-500">
                Click "Add Charge" to include extra fees
              </p>
            </div>
          )}
        </div>

        {extras.length > 0 && (
          <div className="bg-gradient-to-r from-[#0154AC]/5 to-[#22C36E]/5 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Total Additional Charges:
              </span>
              <span className="text-lg font-bold text-[#0154AC]">
                ₹
                {extras
                  .reduce((total, extra) => total + (extra.amount || 0), 0)
                  .toFixed(2)}
                <span className="text-sm font-normal text-gray-600">
                  {" "}
                  /month
                </span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Maintenance;
