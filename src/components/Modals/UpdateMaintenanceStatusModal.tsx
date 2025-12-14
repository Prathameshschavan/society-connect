import React, { useEffect, useMemo, useState } from "react";
import type { MaintenanceBill } from "../../libs/stores/useMaintenanceStore";
import Modal, { ModalBody, ModalFooter } from "./Modal";
import { useForm } from "react-hook-form";
import useMaintenanceApiService from "../../hooks/apiHooks/useMaintenanceApiService";
import type { DuesLine, TBillStatus } from "../../types/maintenance.types";
import { Switch } from "../ui/GenericSwitch";
import StatusBadge from "../ui/StatusBadge";
import { isPassedDueDate, shortMonth } from "../../utility/dateTimeServices";
import { type ExtraItem } from "../../libs/stores/useOrganizationStore";
import { useProfileStore } from "../../libs/stores/useProfileStore";

interface UpdateMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: MaintenanceBill | null;
  onSuccess?: () => void;
}

interface PayableItem {
  id: string; // bill_id or bill.id
  month: string;
  year: string;
  amount: number;
  baseAmount: number;
  extrasTotal: number;
  extras: ExtraItem[];
  penalty: number;
  status: string;
  isMainBill: boolean;
  originalDue?: DuesLine;
}

const UpdateMaintenanceStatusModal: React.FC<UpdateMaintenanceModalProps> = ({
  isOpen,
  onClose,
  bill,
  onSuccess,
}) => {
  const { handleUpdateMaintenanceBill } = useMaintenanceApiService();
  const { handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const { profile } = useProfileStore();

  // Selected Bill IDs
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // 1. Flatten bills into a sorted list (Oldest -> Newest)
  const allBills = useMemo<PayableItem[]>(() => {
    if (!bill) return [];

    const dues: PayableItem[] = (bill.breakdown.dues || []).map((due) => ({
      id: (due as any).bill_id || `${due.month}-${due.year}`, // Fallback if bill_id missing
      month: String(due.month).padStart(2, "0"),
      year: String(due.year),
      baseAmount: due.base_amount,
      extrasTotal: (due.extras || []).reduce(
        (sum, e) => sum + (e.amount || 0),
        0
      ),
      extras: due.extras || [],
      penalty: due.penalty || 0,
      amount:
        due.base_amount +
        (due.penalty || 0) +
        (due.extras || []).reduce((sum, e) => sum + (e.amount || 0), 0),
      status: due.status,
      isMainBill: false,
      originalDue: due,
    }));

    // Main bill
    const currentExtras = (bill?.breakdown?.extras || []).reduce(
      (sum, e) => sum + (e.amount || 0),
      0
    );

    const current: PayableItem = {
      id: bill.id,
      month: String(bill.bill_month).padStart(2, "0"),
      year: String(bill.bill_year || new Date().getFullYear()),
      baseAmount: bill.breakdown.base_amount,
      extrasTotal: currentExtras,
      extras: bill?.breakdown?.extras || [],
      penalty: bill.penalty || 0,
      amount: bill.breakdown.base_amount + (bill.penalty || 0) + currentExtras,
      status: bill.status || "pending",
      isMainBill: true,
    };

    // Sort by Year then Month
    return [...dues, current].sort((a, b) => {
      if (a.year !== b.year) return Number(a.year) - Number(b.year);
      return Number(a.month) - Number(b.month);
    });
  }, [bill]);

  // Reset selection when bill opens
  useEffect(() => {
    if (isOpen && allBills.length > 0) {
      const paidIds = allBills
        .filter((b) => b.status === "paid")
        .map((b) => b.id);

      setSelectedIds(new Set(paidIds));
    }
  }, [isOpen, allBills]);

  // 2. Toggle Logic with Sequential Dependency
  const handleToggle = (item: PayableItem, isSelected: boolean) => {
    const index = allBills.findIndex((b) => b.id === item.id);
    if (index === -1) return;

    const newSelected = new Set(selectedIds);

    if (isSelected) {
      // Selecting: Select this AND all OLDER bills (indices 0 to index)
      for (let i = 0; i <= index; i++) {
        newSelected.add(allBills[i].id);
      }
    } else {
      // Deselecting: Deselect this AND all NEWER bills (indices index to length-1)
      for (let i = index; i < allBills.length; i++) {
        newSelected.delete(allBills[i].id);
      }
    }

    setSelectedIds(newSelected);
  };

  const totalAmount = useMemo(() => {
    return allBills
      .filter((b) => selectedIds.has(b.id))
      .reduce((sum, b) => sum + b.amount, 0);
  }, [allBills, selectedIds]);

  const onSubmit = async () => {
    if (!bill) return;
    setLoading(true);

    try {
      // 3. Construct Payload
      const newDues = (bill.breakdown.dues || []).map((due) => {
        const id = (due as any).bill_id;
        if (id && selectedIds.has(id)) {
          return { ...due, status: "paid" };
        }
        return { ...due, status: "overdue" };
      });

      const isMainSelected = selectedIds.has(bill.id);
      const newMainStatus = isMainSelected
        ? "paid"
        : isPassedDueDate(
            isNaN(Number(profile?.organization?.due_date))
              ? "last"
              : Number(profile?.organization?.due_date)
          )
        ? "overdue"
        : "pending";

      // Ensure type safety for status
      const safeMainStatus = (newMainStatus as TBillStatus) || "pending";

      await handleUpdateMaintenanceBill({
        id: bill.id,
        status: safeMainStatus,
        breakdown: {
          ...bill.breakdown,
          dues: newDues as DuesLine[],
        },
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error updating bills:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Update Maintenance Payment"
      isOpen={isOpen}
      onClose={onClose}
      size="xl" // Larger modal for the list
    >
      <form onSubmit={handleSubmit(onSubmit)} className="relative">
        <ModalBody>
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 p-4 rounded-xl border border-gray-200 gap-4">
              <div>
                <p className="text-gray-500 text-sm">Total Selected Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{totalAmount.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Bill List */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              <h3 className="text-sm font-semibold text-gray-700">
                Outstanding Bills
              </h3>
              {allBills.map((item) => {
                const isSelected = selectedIds.has(item.id);
                // Determine if this item is togglable?
                // User said "Update Status".
                // If item is already PAID, maybe we shouldn't allow selecting it to pay again?
                // But user might want to mark as PENDING (undo).
                // Let's allow all toggles for now.

                return (
                  <div
                    key={item.id}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? "border-green-500 bg-green-50/50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 w-full">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-700 shrink-0">
                          <span className="text-xs font-bold uppercase">
                            {shortMonth[Number(item.month) - 1]}
                          </span>
                          <span className="text-[10px]">{item.year}</span>
                        </div>
                        <div className="w-full">
                          <div className="flex items-center justify-between gap-4 flex-wrap w-full mb-1">
                            <p className="text-gray-900 font-semibold text-lg">
                              {item.isMainBill ? "Current Bill" : "Past Due"}
                            </p>
                            <StatusBadge status={item.status} size="sm" />
                          </div>

                          <div className="flex flex-col gap-0.5 text-xs text-gray-500 mb-2">
                            <div className="flex justify-between">
                              <span>Base Amount:</span>
                              <span>₹{item.baseAmount.toLocaleString()}</span>
                            </div>
                            {item.penalty > 0 && (
                              <div className="flex justify-between text-red-600">
                                <span>Penalty:</span>
                                <span>+₹{item.penalty.toLocaleString()}</span>
                              </div>
                            )}
                            {item.extrasTotal > 0 && (
                              <div>
                                <span>Extras:</span>
                                {item.extras.map((extra) => (
                                  <div className="flex justify-between">
                                    <span>{extra.name}</span>
                                    <span>
                                      +₹{extra.amount.toLocaleString()}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="border-t border-gray-200 my-1"></div>
                          </div>

                          <p className="text-gray-900 text-sm flex justify-between font-medium">
                            <span>Total:</span>
                            <span>₹{item.amount.toLocaleString()}</span>
                          </p>
                        </div>
                      </div>

                      <div className="self-end sm:self-center">
                        <Switch
                          checked={isSelected}
                          onChange={(val) => handleToggle(item, val)}
                          colorClass="bg-green-500"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="flex justify-end gap-3 pt-4 border-t border-gray-100 sticky bottom-0 left-0 right-0">
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
            {loading ? "Saving..." : `Update`}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default UpdateMaintenanceStatusModal;
