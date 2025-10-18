import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import {
  currFullDate,
  currMonth,
  currYear,
  getMonthAndYearFromDate,
} from "../../utility/dateTimeServices";
import { useOrganizationStore } from "../../libs/stores/useOrganizationStore";
import Modal, { ModalBody, ModalFooter } from "./Modal";
import useExpenseService from "../../hooks/serviceHooks/useExpenseService";
import type {
  Expense,
  ExpenseFormValues,
} from "../../libs/stores/useReportStore";

type EditExpenseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
};

export function EditExpenseModal({
  isOpen,
  onClose,
  expense,
}: EditExpenseModalProps) {
  const { residentOrganization } = useOrganizationStore();
  const {
    updateExpense,
    fetchExpenses,
    uploadExpenseImage,
    getExpenseImageUrl,
  } = useExpenseService();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
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

  // Populate form with existing data when modal opens or expense changes
  useEffect(() => {
    const populateForm = async () => {
      if (isOpen && expense) {
        const fields: (keyof ExpenseFormValues)[] = [
          "name",
          "description",
          "receiver_name",
          "amount",
          "organization_id",
          "date",
          "status",
        ];

        fields.forEach((field) => {
          setValue(field, expense[field]);
        });

        // Set month and year from date
        const { month, year } = getMonthAndYearFromDate(expense.date);
        setValue("month", month.toString());
        setValue("year", year.toString());

        // Load existing image if available
        if (expense.image_url) {
          try {
            const imageUrl = await getExpenseImageUrl(expense.image_url);
            setCurrentImageUrl(imageUrl);
          } catch (error) {
            console.error("Error loading existing image:", error);
          }
        }
      }
    };

    populateForm();
  }, [isOpen, expense]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
      setSelectedFile(null);
      setImagePreview(null);
      setCurrentImageUrl("");
    }
  }, [isOpen, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setValue("image_url", previewUrl, { shouldDirty: true });
    }
  };

  const removeCurrentImage = () => {
    setCurrentImageUrl("");
    setSelectedFile(null);
    setImagePreview(null);
  };

  console.log(currentImageUrl, selectedFile, imagePreview);
  const submit = async (data: ExpenseFormValues) => {
    if (!expense) return;

    try {
      const updatedData = { ...data };

      // If there's a new file, upload it
      if (selectedFile) {
        const imagePath = await uploadExpenseImage(selectedFile, expense.id);
        updatedData.image_url = imagePath;
      } else if (!currentImageUrl) {
        // If current image was removed and no new file
        updatedData.image_url = "";
      }

      await updateExpense(expense.id, updatedData);
      await fetchExpenses();

      // Clean up
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setSelectedFile(null);
      setImagePreview(null);
      setCurrentImageUrl("");
      reset();
      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  if (!isOpen || !expense) return null;

  return (
    <Modal title="Edit Expense" isOpen={isOpen} onClose={onClose} size="lg">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <p className="mt-1 text-xs text-red-600">
                  {errors.status.message}
                </p>
              )}
            </div>
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
              Receipt/Photo
            </label>
            <div className="space-y-3">
              {/* Current Image Display */}
              {currentImageUrl && !imagePreview && (
                <div className="relative">
                  <img
                    src={currentImageUrl}
                    alt="Current receipt"
                    className="max-w-xs max-h-32 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={removeCurrentImage}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                  <p className="text-xs text-gray-500 mt-1">Current image</p>
                </div>
              )}

              {/* New Image Preview */}
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="New preview"
                    className="max-w-xs max-h-32 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setImagePreview(null);
                      if (imagePreview) {
                        URL.revokeObjectURL(imagePreview);
                      }
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                  <p className="text-xs text-green-600 mt-1">
                    New image (will replace current)
                  </p>
                </div>
              )}

              {/* File Input */}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500">
                {currentImageUrl
                  ? "Upload new image to replace current one"
                  : "Upload receipt image or photo"}
              </p>
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
              setCurrentImageUrl("");
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
            {isSubmitting ? "Updating..." : "Update Expense"}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
