import React, { useState } from "react";
import type { MaintenanceBill } from "../../libs/stores/useMaintenanceStore";
import Modal, { ModalFooter } from "./Modal";
import useCommonService from "../../hooks/serviceHooks/useCommonService";
import useAdminService from "../../hooks/serviceHooks/useAdminService";
import { useForm } from "react-hook-form";

interface UpdateMaintananceModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: MaintenanceBill | null;
  onSuccess?: () => void;
}

const UpdateMaintananceStatusModal: React.FC<UpdateMaintananceModalProps> = ({
  isOpen,
  onClose,
  bill,
  onSuccess,
}) => {
  const { getStatusColor, getStatusIcon } = useCommonService();
  const [selectedStatus, setSelectedStatus] = useState(
    bill?.status || "pending"
  );

  const { updateMaintenanceStatus } = useAdminService();

  const { handleSubmit } = useForm();

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const statusOptions = [
    { value: "pending", label: "Pending", color: "text-yellow-600" },
    { value: "paid", label: "Paid", color: "text-green-600" },
    { value: "overdue", label: "Overdue", color: "text-red-600" },
    { value: "cancelled", label: "Cancelled", color: "text-gray-600" },
  ];

  const onSubmit = async () => {
    setLoading(true);

    try {
      const res = await updateMaintenanceStatus({
        status: selectedStatus,
        id: bill?.id as string,
      });

      console.log(res);
      onSuccess?.();
      // Close modal after successful update
      onClose();
    } catch (error) {
      console.error("Error updating bill status:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`Update Maintanance Details`}
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Bill Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Bill Summary
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Period:</span>
                <span className="ml-2 font-medium">
                  {new Date(
                    2025,
                    Number(bill?.bill_month) - 1
                  ).toLocaleDateString("en-US", { month: "short" })}{" "}
                  {bill?.bill_year}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Amount:</span>
                <span className="ml-2 font-medium">
                  ₹{bill?.amount?.toLocaleString()}
                </span>
              </div>

              <div>
                <span className="text-gray-500">Current Status:</span>
                <span
                  className={`ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    bill?.status as string
                  )}`}
                >
                  {getStatusIcon(bill?.status as string)}
                  {bill?.status}
                </span>
              </div>
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as never)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <ModalFooter className="flex justify-end">
          <button
            disabled={loading}
            type="submit"
            className="bg-blue-600 px-4 py-2 rounded text-white"
          >
            {loading ? "Saving" : "Save"}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default UpdateMaintananceStatusModal;
