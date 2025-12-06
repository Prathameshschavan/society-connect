import React, { useEffect, useState } from "react";
import type { MaintenanceBill } from "../../libs/stores/useMaintenanceStore";
import Modal, { ModalBody, ModalFooter } from "./Modal";
import useCommonService from "../../hooks/serviceHooks/useCommonService";
import { useForm } from "react-hook-form";
import useMaintenanceApiService from "../../hooks/apiHooks/useMaintenanceApiService";
import { GenericSelect } from "../ui/GenericSelect";
import type { TBillStatus } from "../../types/maintenance.types";

interface UpdateMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: MaintenanceBill | null;
  onSuccess?: () => void;
}

const UpdateMaintenanceStatusModal: React.FC<UpdateMaintenanceModalProps> = ({
  isOpen,
  onClose,
  bill,
  onSuccess,
}) => {
  const { getStatusColor, getStatusIcon } = useCommonService();
  const [selectedStatus, setSelectedStatus] = useState(
    bill?.status || "pending"
  );

  const { handleUpdateMaintenanceBill } = useMaintenanceApiService();

  const { handleSubmit } = useForm();

  const [loading, setLoading] = useState(false);

  const statusOptions: { value: TBillStatus; label: string }[] = [
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Paid" },
    { value: "overdue", label: "Overdue" },
  ];

  const onSubmit = async () => {
    setLoading(true);

    try {
      await handleUpdateMaintenanceBill({
        status: selectedStatus,
        id: bill?.id as string,
      });

      onSuccess?.();
      // Close modal after successful update
      onClose();
    } catch (error) {
      console.error("Error updating bill status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedStatus(bill?.status || "pending");
  }, [bill]);

  return (
    <Modal
      title="Update Maintenance Details"
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody>
          <div className="space-y-6">
            {/* Bill Summary */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Bill Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Unit</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {bill?.unit_number}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Period</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(
                        2025,
                        Number(bill?.bill_month) - 1
                      ).toLocaleDateString("en-US", { month: "short" })}{" "}
                      {bill?.bill_year}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="text-sm font-semibold text-gray-900">
                      ₹{bill?.amount?.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 ">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Current Status</p>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        bill?.status as string
                      )}`}
                    >
                      {getStatusIcon(bill?.status as string)}
                      <span className="capitalize">{bill?.status}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Selection */}
            {/* <GenericSelect
              key="status"
              label="Update Status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as never)}
              placeholder="Select new status"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </GenericSelect> */}

            <GenericSelect
              id="statusFilter"
              onChange={(value: TBillStatus) => setSelectedStatus(value)}
              options={statusOptions}
              value={selectedStatus}
              label="UpdateStatus"
            />
          </div>
        </ModalBody>

        <ModalFooter className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            disabled={loading}
            type="submit"
            className="px-6 py-2 bg-[#22C36E] text-white rounded-lg hover:bg-[#1ea05f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default UpdateMaintenanceStatusModal;
