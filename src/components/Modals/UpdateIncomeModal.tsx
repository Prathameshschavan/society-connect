import { useForm } from "react-hook-form";
import { useEffect } from "react";
import {
  currFullDateForInput,
  currMonth,
  currYear,
  getMonthAndYearFromDate,
} from "../../utility/dateTimeServices";
import Modal from "./Modal";
import type { IncomeRow } from "../../hooks/serviceHooks/useIncomeService";
import type { IncomeFormValues } from "../../libs/stores/useReportStore";
import { useProfileStore } from "../../libs/stores/useProfileStore";
import CustomInput from "../ui/CustomInput";
import toast from "react-hot-toast";
import useIncomeApiService from "../../hooks/apiHooks/useIncomeApiService";

type UpdateIncomeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  income: IncomeRow;
  callback: () => void;
};

export function UpdateIncomeModal({
  isOpen,
  onClose,
  income,
  callback,
}: UpdateIncomeModalProps) {
  const { profile } = useProfileStore();
  const { handleUpdateIncome } = useIncomeApiService();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<IncomeFormValues>({
    defaultValues: {
      name: "",
      description: "",
      amount: undefined as unknown as number,
      month: currMonth,
      year: currYear,
      organization_id: profile?.organization?.id,
      date: currFullDateForInput,
    },
  });

  // Populate form when modal opens
  useEffect(() => {
    if (isOpen && income) {
      setValue("organization_id", profile?.organization?.id || "");
      setValue("name", income.name || "");
      setValue("description", income.description || "");
      setValue("amount", income.amount || 0);
      setValue("date", income.date || "");

      const { month, year } = getMonthAndYearFromDate(income.date);
      setValue("month", month.toString());
      setValue("year", year.toString());
    }
  }, [isOpen, income, setValue, profile]);

  const submit = async (data: IncomeFormValues) => {
    try {
      const incomeData = {
        name: data.name,
        organization_id: profile?.organization?.id as string,
        description: data.description || "",
        amount: data.amount,
        date: data.date,
        month: Number(new Date(data.date).getMonth() + 1),
        year: Number(new Date(data.date).getFullYear()),
      };

      await handleUpdateIncome({ id: income.id, data: incomeData });

      reset();
      callback();
      onClose();
      toast.success("Income updated successfully!");
    } catch (error: any) {
      console.log(error);
      toast.error(error?.message || "Failed to update income");
    }
  };

  const handleModalClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      title="Update Income"
      isOpen={isOpen}
      onClose={handleModalClose}
      size="lg"
    >
      <form onSubmit={handleSubmit(submit)}>
        {/* Form Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            <CustomInput
              key="name"
              label="Name"
              type="text"
              placeholder="e.g. Clubhouse Rent"
              {...register("name", {
                required: "Name is required",
                minLength: { value: 2, message: "Min 2 characters" },
                maxLength: { value: 120, message: "Max 120 characters" },
              })}
              error={errors.name}
              value={watch("name")}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                placeholder="Optional notes"
                {...register("description", {
                  maxLength: { value: 500, message: "Max 500 characters" },
                })}
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <CustomInput
              key="amount"
              label="Amount (INR)"
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              {...register("amount", {
                required: "Amount is required",
                valueAsNumber: true,
                min: { value: 0, message: "Must be ≥ 0" },
                max: { value: 9999999999.99, message: "Too large" },
                validate: (v) => isFinite(Number(v)) || "Invalid number",
              })}
              error={errors.amount}
              value={watch("amount")}
            />

            <CustomInput
              key="date"
              label="Date"
              type="date"
              {...register("date", {
                required: "Date is required",
              })}
              error={errors.date}
              value={watch("date")}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end items-center gap-2 p-6 border-t bg-gray-50">
          <button
            type="button"
            onClick={handleModalClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Updating...
              </>
            ) : (
              "Update Income"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
