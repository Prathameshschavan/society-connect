import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { X, FileText, Image as ImageIcon, Archive } from "lucide-react";
import {
  currFullDateForInput,
  currMonth,
  currYear,
  getMonthAndYearFromDate,
} from "../../utility/dateTimeServices";
import Modal from "./Modal";
import type {
  Expense,
  ExpenseFormValues,
} from "../../libs/stores/useReportStore";
import { useProfileStore } from "../../libs/stores/useProfileStore";
import CustomInput from "../ui/CustomInput";
import CustomSelect from "../ui/CustomSelect";
import toast from "react-hot-toast";
import useExpenseApiService from "../../hooks/apiHooks/useExpenseApiService";
import useUploadApiService from "../../hooks/apiHooks/useUploadApiService";

type EditExpenseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  callback: () => void;
};

export function EditExpenseModal({
  isOpen,
  onClose,
  expense,
  callback,
}: EditExpenseModalProps) {
  const { profile } = useProfileStore();
  const { handleUpdateExpense } = useExpenseApiService();
  const { handleUploadFile } = useUploadApiService();

  // State for new files
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<
    { file: File; preview: string | null; type: string }[]
  >([]);

  // State for existing files
  const [existingFiles, setExistingFiles] = useState<
    { type: string; name: string; url: string }[]
  >([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ExpenseFormValues>({
    defaultValues: {
      name: "",
      description: "",
      receiver_name: "",
      amount: undefined as unknown as number,
      month: currMonth,
      year: currYear,
      organization_id: profile?.organization?.id,
      date: currFullDateForInput,
      status: "pending",
    },
  });

  // Populate form with existing data when modal opens or expense changes
  useEffect(() => {
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

      // Set existing files
      if (expense.files && Array.isArray(expense.files)) {
        setExistingFiles(expense.files);
      } else if (expense.image_url) {
        // Fallback for legacy single image support if needed, though type says files[]
        // Assuming conversion or type correctness, but safe to handle empty if needed
        setExistingFiles([]);
      } else {
        setExistingFiles([]);
      }
    }
  }, [isOpen, expense, setValue]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      cleanup();
    }
  }, [isOpen]);

  const cleanup = () => {
    // Revoke object URLs
    filePreviews.forEach((fp) => {
      if (fp.preview) {
        URL.revokeObjectURL(fp.preview);
      }
    });
    setSelectedFiles([]);
    setFilePreviews([]);
    setExistingFiles([]);
    reset();
  };

  const handleModalClose = () => {
    cleanup();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      const newPreviews = newFiles.map((file) => {
        const isImage = file.type.startsWith("image/");
        const preview = isImage ? URL.createObjectURL(file) : null;
        return {
          file,
          preview,
          type: file.type,
        };
      });

      setSelectedFiles((prev) => [...prev, ...newFiles]);
      setFilePreviews((prev) => [...prev, ...newPreviews]);
    }
    // Reset the input value to allow selecting the same file again
    e.target.value = "";
  };

  const removeNewFile = (index: number) => {
    // Revoke object URL if it exists
    if (filePreviews[index].preview) {
      URL.revokeObjectURL(filePreviews[index].preview!);
    }

    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingFile = (index: number) => {
    setExistingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileType = (mimeType: string): string => {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType === "application/pdf") return "pdf";
    if (
      mimeType === "application/zip" ||
      mimeType === "application/x-zip-compressed"
    )
      return "zip";
    return "file";
  };

  const getFileIcon = (type: string) => {
    // Simple check on type string or mime type
    if (type === "image" || type.startsWith("image/")) {
      return <ImageIcon className="w-5 h-5 text-blue-500" />;
    }
    if (type === "pdf" || type === "application/pdf") {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    if (
      type === "zip" ||
      type === "application/zip" ||
      type === "application/x-zip-compressed"
    ) {
      return <Archive className="w-5 h-5 text-yellow-500" />;
    }
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  const submit = async (data: ExpenseFormValues) => {
    if (!expense) return;

    try {
      // 1. Upload new files
      const uploadedFiles: {
        type: string;
        name: string;
        url: string;
      }[] = [];

      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const uploadedUrl = await handleUploadFile(
            file,
            profile?.organization?.id as string
          );
          uploadedFiles.push({
            type: getFileType(file.type),
            name: file.name,
            url: uploadedUrl?.url,
          });
        }
      }

      // 2. Combine existing (not deleted) files + new uploaded files
      const finalFiles = [...existingFiles, ...uploadedFiles];

      // 3. Prepare update data
      // Note: Backend likely expects the full object structure or specific fields
      // Ensure we send what's needed.
      const updatePayload: any = {
        name: data.name,
        description: data.description || "",
        receiver_name: data.receiver_name,
        amount: data.amount,
        date: data.date,
        status: data.status,
        files: finalFiles,
        month: Number(new Date(data.date).getMonth() + 1),
        year: Number(new Date(data.date).getFullYear()),
        organization_id: profile?.organization?.id,
      };

      await handleUpdateExpense({ id: expense.id, data: updatePayload });

      callback();
      handleModalClose();
      toast.success("Expense updated successfully!");
    } catch (error: any) {
      console.log(error);
      toast.error(error?.message || "Failed to update expense");
    }
  };

  if (!isOpen || !expense) return null;

  return (
    <Modal
      title="Edit Expense"
      isOpen={isOpen}
      onClose={handleModalClose}
      size="lg"
    >
      <form onSubmit={handleSubmit(submit)}>
        {/* Form Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto w-full">
          <div className="space-y-4">
            <CustomInput
              key="name"
              label="Expense Name"
              type="text"
              placeholder="e.g. Sweeper Payment, Electricity Bill"
              {...register("name", {
                required: "Expense name is required",
                minLength: { value: 2, message: "Min 2 characters" },
                maxLength: { value: 200, message: "Max 200 characters" },
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
                placeholder="Optional details about the expense"
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
              key="receiver_name"
              label="Receiver Name"
              type="text"
              placeholder="Name of person who received payment"
              {...register("receiver_name", {
                required: "Receiver name is required",
                minLength: { value: 2, message: "Min 2 characters" },
                maxLength: { value: 100, message: "Max 100 characters" },
              })}
              error={errors.receiver_name}
              value={watch("receiver_name")}
            />

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

            <CustomSelect
              key="status"
              label="Payment Status"
              {...register("status", {
                required: "Status is required",
              })}
              error={errors.status}
              placeholder="Select payment status"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </CustomSelect>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Documents (Images, PDFs, ZIP files)
              </label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*,application/pdf,.zip"
                  multiple
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                />
                <p className="text-xs text-gray-500">
                  Upload receipts, images, PDFs, or ZIP files (multiple files
                  allowed)
                </p>

                {/* Existing Files List */}
                {existingFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Existing Files
                    </p>
                    {existingFiles.map((file, index) => (
                      <div
                        key={`existing-${index}`}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50"
                      >
                        {file.type === "image" ? (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-16 h-16 object-cover rounded border"
                          />
                        ) : (
                          <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded border">
                            {getFileIcon(file.type)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            View
                          </a>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExistingFile(index)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Remove file"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New Files List */}
                {filePreviews.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">
                      New Files to Upload
                    </p>
                    {filePreviews.map((filePreview, index) => (
                      <div
                        key={`new-${index}`}
                        className="flex items-center gap-3 p-3 border border-green-100 rounded-lg bg-green-50"
                      >
                        {filePreview.preview ? (
                          <img
                            src={filePreview.preview}
                            alt={filePreview.file.name}
                            className="w-16 h-16 object-cover rounded border"
                          />
                        ) : (
                          <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded border">
                            {getFileIcon(filePreview.type)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {filePreview.file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(filePreview.file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeNewFile(index)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Remove file"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
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
            disabled={
              isSubmitting ||
              (!isDirty &&
                selectedFiles.length === 0 &&
                existingFiles.length === expense.files?.length)
            }
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Updating...
              </>
            ) : (
              "Update Expense"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
