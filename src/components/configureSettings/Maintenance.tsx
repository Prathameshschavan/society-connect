import type React from "react";
import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import type { ExtraItem } from "../../libs/stores/useOrganizationStore";
import { useEffect, useState } from "react";
import { AlertCircle, Minus, Plus } from "lucide-react";
import { Switch } from "../ui/GenericSwitch";
import type { IOrganization } from "../../types/organization.types";
import CustomInput from "../ui/CustomInput";
import CustomSelect from "../ui/CustomSelect";

const Maintenance: React.FC<{
  register: UseFormRegister<IOrganization>;
  setValue: UseFormSetValue<IOrganization>;
  watch: UseFormWatch<IOrganization>;
  errors: FieldErrors<IOrganization>;
}> = ({ register, setValue, watch, errors }) => {
  const watchedExtras = watch("extras") || [];
  const [extras, setExtras] = useState<ExtraItem[]>([]);
  const [isMaintenanceCalculatedByFixed, setIsMaintenanceCalculatedByFixed] =
    useState(watch("calculate_maintenance_by") === "fixed");

  // Sync local state with form state
  useEffect(() => {
    if (watchedExtras.length > 0) {
      setExtras(watchedExtras);
    }
  }, [watchedExtras]);

  const addExtra = () => {
    const newExtra: ExtraItem = {
      id: Date.now().toString(),
      name: "",
      month: "",
      amount: Number("null"),
      year: "",
    };
    const updatedExtras = [...extras, newExtra];
    setExtras(updatedExtras);
    setValue("extras", updatedExtras, { shouldDirty: true });
  };

  const removeExtra = (id: string) => {
    const updatedExtras = extras.filter((extra) => extra.id !== id);
    setExtras(updatedExtras);
    setValue("extras", updatedExtras, { shouldDirty: true });
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
    setValue("extras", updatedExtras, { shouldDirty: true });
  };

  console.log(errors);

  return (
    <div className="space-y-8">
      {/* Basic Maintenance Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Basic Maintenance Configuration
        </h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">
                Maintenance Rate Information
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                Set the maintenance rate per square foot. This will be used to
                calculate monthly maintenance charges for residents based on
                their unit size.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 mb-6">
          <p className="font-medium">Calculate Maintenance Amount By : </p>
          <div className="flex items-center gap-2">
            <span>Monthly Per SQFT</span>
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
            <span>Monthly Fixed</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {!isMaintenanceCalculatedByFixed ? (
            <div>
              <CustomInput
                label="Maintenance Rate (₹ per sq ft)"
                type="number"
                step="0.01"
                {...register("maintenance_rate", {
                  required:
                    "Maintenance rate should be greater than and equal to 1",
                  min: {
                    value: 1,
                    message:
                      "Maintenance rate should be greater than and equal to 1",
                  },
                  valueAsNumber: true,
                })}
                error={errors?.maintenance_rate}
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Example: If rate is ₹2.50, a 1000 sq ft unit will pay
                ₹2,500/month
              </p>
            </div>
          ) : (
            <CustomInput
              label="Maintenance Fixed Amount (₹ per month)"
              type="number"
              step="0.01"
              {...register("maintenance_amount", {
                required:
                  "Maintenance amount should be greater than and equal to 1",
                min: {
                  value: 1,
                  message:
                    "Maintenance amount should be greater than and equal to 1",
                },
                valueAsNumber: true,
              })}
              error={errors?.maintenance_amount}
            />
          )}

          {!isMaintenanceCalculatedByFixed ? (
            <div>
              <CustomInput
                label="Tenant Maintenance Rate (₹ per sq ft)"
                type="number"
                min="0"
                step="0.01"
                {...register("tenant_maintenance_rate", {
                  required:
                    "Tenant maintenance rate should be greater than and equal to 1",
                  min: {
                    value: 1,
                    message:
                      "Tenant maintenance rate should be greater than and equal to 1",
                  },
                  valueAsNumber: true,
                })}
                error={errors?.tenant_maintenance_rate}
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Example: If rate is ₹2.50, a 1000 sq ft unit will pay
                ₹2,500/month
              </p>
            </div>
          ) : (
            <CustomInput
              label="Tenant Maintenance Fixed Amount (₹ per month)"
              type="number"
              min="0"
              step="0.01"
              {...register("tenant_maintenance_amount", {
                required:
                  "Tenant maintenance amount should be greater than and equal to 1",
                min: {
                  value: 1,
                  message:
                    "Tenant maintenance amount should be greater than and equal to 1",
                },
                valueAsNumber: true,
              })}
              error={errors?.tenant_maintenance_amount}
            />
          )}

          {!isMaintenanceCalculatedByFixed ? (
            <CustomInput
              label="Penalty Rate (₹ per sq ft)"
              type="number"
              min="0"
              step="0.01"
              {...register("penalty_rate", {
                required: "Penalty rate should be greater than and equal to 1",
                min: {
                  value: 1,
                  message: "Penalty rate should be greater than and equal to 1",
                },
                valueAsNumber: true,
              })}
              error={errors?.penalty_rate}
            />
          ) : (
            <CustomInput
              label="Penalty Fixed Amount (₹ per month)"
              type="number"
              min="0"
              step="0.01"
              {...register("penalty_amount", {
                required:
                  "Penalty amount should be greater than and equal to 1",
                min: {
                  value: 1,
                  message:
                    "Penalty amount should be greater than and equal to 1",
                },
                valueAsNumber: true,
              })}
              error={errors?.penalty_amount}
            />
          )}

          <CustomSelect
            label="Due Date Per Month"
            {...register("due_date", { required: "Due date is required" })}
          >
            {[...Array(28).keys()].map((d) => {
              const day = d + 1;
              return (
                <option key={day} value={day.toString()}>
                  {day}
                  {day === 1
                    ? "st"
                    : day === 2
                    ? "nd"
                    : day === 3
                    ? "rd"
                    : "th"}{" "}
                  of every month
                </option>
              );
            })}
            <option value="last">Last day of the month</option>
          </CustomSelect>
        </div>
      </div>

      {/* Extras Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Additional Charges (Extras)
          </h3>
          <button
            type="button"
            onClick={addExtra}
            className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Extra
          </button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-900">
                Additional Charges Information
              </h4>
              <p className="text-sm text-amber-700 mt-1">
                Add any additional charges like parking fees, generator charges,
                security deposits, etc. These will be added to the basic
                maintenance amount.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {extras.map((extra) => (
            <div
              key={extra.id}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Extra Name
                </label>
                <input
                  type="text"
                  required
                  value={extra.name}
                  onChange={(e) =>
                    updateExtra(extra.id, "name", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Parking Fee, Generator Charge"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  step="0.01"
                  value={extra.amount}
                  onChange={(e) =>
                    updateExtra(extra.id, "amount", parseFloat(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div className="flex items-end pb-2">
                <button
                  type="button"
                  onClick={() => removeExtra(extra.id)}
                  className="p-2 rounded-lg transition-colors mt-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                  title="Remove this extra"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {extras.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No additional charges added yet.</p>
              <p className="text-sm">
                Click "Add Extra" to add additional charges.
              </p>
            </div>
          )}
        </div>

        {extras.length > 0 && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg">
            <div className="text-sm text-gray-600">
              <strong>Total Additional Charges: </strong>₹
              {extras
                .reduce((total, extra) => total + (extra.amount || 0), 0)
                .toFixed(2)}{" "}
              per month
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Maintenance;
