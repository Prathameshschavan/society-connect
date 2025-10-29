import { useForm } from "react-hook-form";
import { useState } from "react";
import {
  currFullDate,
  currMonth,
  currYear,
} from "../../utility/dateTimeServices";
import { useOrganizationStore } from "../../libs/stores/useOrganizationStore";
import Modal, { ModalBody, ModalFooter } from "./Modal";
import useExpenseService from "../../hooks/serviceHooks/useExpenseService";
import type { ExpenseFormValues } from "../../libs/stores/useReportStore";


type ExpenseModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AddExpenseModal({ isOpen, onClose }: ExpenseModalProps) {
  const { residentOrganization } = useOrganizationStore();
  const { addExpense, fetchExpenses, uploadExpenseImage, updateExpense } = useExpenseService();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ExpenseFormValues>({
    defaultValues: {
      name: "",
      description: "",
      receiver_name: "",
      amount: undefined as unknown as number,
      month: currMonth,
      year: currYear,
      organization_id: residentOrganization?.id,
      date: currFullDate,
      status: "unpaid",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const submit = async (data: ExpenseFormValues) => {
    try {
      // First create the expense
      const expenseId = await addExpense(data);
      
      // If there's a file, upload it and update the expense
      if (selectedFile && expenseId) {
        const imagePath = await uploadExpenseImage(selectedFile, expenseId);
        // Update expense with image URL
        await updateExpense(expenseId, { ...data, image_url: imagePath });
      }
      
      await fetchExpenses();
      
      // Clean up
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setSelectedFile(null);
      setImagePreview(null);
      reset();
      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal title="Add Expense" isOpen={isOpen} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit(submit)}>
        <ModalBody className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expense Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g. Sweeper Payment, Electricity Bill"
              {...register("name", {
                required: "Expense name is required",
                minLength: { value: 2, message: "Min 2 characters" },
                maxLength: { value: 200, message: "Max 200 characters" },
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
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Optional details about the expense"
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
              Receiver Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Name of person who received payment"
              {...register("receiver_name", {
                required: "Receiver name is required",
                minLength: { value: 2, message: "Min 2 characters" },
                maxLength: { value: 100, message: "Max 100 characters" },
              })}
            />
            {errors.receiver_name && (
              <p className="mt-1 text-xs text-red-600">
                {errors.receiver_name.message}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Status
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              {...register("status", {
                required: "Status is required",
              })}
            >
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-xs text-red-600">{errors.status.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Receipt/Photo
            </label>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500">
                Upload receipt image or photo of person who received payment
              </p>
              
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-xs max-h-32 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setImagePreview(null);
                      URL.revokeObjectURL(imagePreview);
                    }}
                    className="mt-1 text-xs text-red-600 hover:text-red-800"
                  >
                    Remove image
                  </button>
                </div>
              )}
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
              }
              setSelectedFile(null);
              setImagePreview(null);
              reset();
              onClose();
            }}
            className="rounded bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Add Expense"}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
