import { useForm } from "react-hook-form";
import {
  currFullDate,
  currMonth,
  currYear,
} from "../../utility/dateTimeServices";
import { useOrganizationStore } from "../../libs/stores/useOrganizationStore";
import Modal, { ModalBody, ModalFooter } from "./Modal";
import useIncomeService from "../../hooks/serviceHooks/useIncomeService";

export type IncomeFormValues = {
  name: string;
  description?: string;
  amount: number;
  month: string;
  year: string;
  organization_id: string;
  date: string;
};

type IncomeModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AddIncomeModal({ isOpen, onClose }: IncomeModalProps) {
  const { residentOrganization } = useOrganizationStore();
  const { addIncome } = useIncomeService();
  const { fetchIncomes } = useIncomeService();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<IncomeFormValues>({
    defaultValues: {
      name: "",
      description: "",
      amount: undefined as unknown as number,
      month: currMonth,
      year: currYear,
      organization_id: residentOrganization?.id,
      date: currFullDate,
    },
  });

  const submit = async (data: IncomeFormValues) => {
    try {
      await addIncome(data);
      await fetchIncomes();
      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal title={`Add Income`} isOpen={isOpen} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit(submit)}>
        <ModalBody className="space-y-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g. Clubhouse Rent"
              {...register("name", {
                required: "Name is required",
                minLength: { value: 2, message: "Min 2 characters" },
                maxLength: { value: 120, message: "Max 120 characters" },
              })}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Optional notes"
              {...register("description", {
                maxLength: { value: 500, message: "Max 500 characters" },
              })}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (INR)
            </label>
            <input
              type="number"
              step="0.01"
              inputMode="decimal"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="0.00"
              {...register("amount", {
                required: "Amount is required",
                valueAsNumber: true,
                min: { value: 0, message: "Must be ≥ 0" },
                max: { value: 9999999999.99, message: "Too large" },
                validate: (v) => isFinite(Number(v)) || "Invalid number",
              })}
            />
            {errors.amount && (
              <p className="mt-1 text-xs text-red-600">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              {...register("date", {
                required: "Date is required",
              })}
            />
            {errors.date && (
              <p className="mt-1 text-xs text-red-600">{errors.date.message}</p>
            )}
          </div>
        </ModalBody>

        <ModalFooter className="flex items-center justify-end gap-2">
          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Save Income"}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
