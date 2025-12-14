import Modal, { ModalBody, ModalFooter } from "./Modal";
import type React from "react";
import { useMemo } from "react";
import type { MaintenanceBill } from "../../libs/stores/useMaintenanceStore";
import { type ExtraItem } from "../../libs/stores/useOrganizationStore";
import StatusBadge from "../ui/StatusBadge";
import { shortMonth } from "../../utility/dateTimeServices";
import type { DuesLine } from "../../types/maintenance.types";
import BillPdfDownload from "../recieptTemplates.tsx/BasicReceiptTemplate";
import { User, Phone, Home } from "lucide-react";

interface ViewMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: MaintenanceBill | null;
  residentInfo?: boolean;
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

const ViewMaintenanceDetailsModal: React.FC<ViewMaintenanceModalProps> = ({
  isOpen,
  onClose,
  bill,
  residentInfo = true,
}) => {
  // Flatten bills into a sorted list (Oldest -> Newest)
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

  if (!isOpen || !bill) return null;

  return (
    <Modal
      title="Maintenance Bill Details"
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
    >
      <ModalBody className="space-y-6">
        {/* Header / Summary */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 p-4 rounded-xl border border-gray-200 gap-4">
          <div>
            <p className="text-gray-500 text-sm">Total Amount</p>
            <p className="text-2xl font-bold text-gray-900">
              ₹{bill.amount.toLocaleString()}
            </p>
          </div>
          <div className="flex-shrink-0">
            <BillPdfDownload
              bill={bill as MaintenanceBill}
              extras={(bill.breakdown.extras || []).concat(
                (bill.breakdown.dues || []).flatMap((d) => d.extras || [])
              )}
            />
          </div>
        </div>

        {/* Resident Information */}
        {residentInfo && (
          <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Resident Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Home className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Unit</p>
                  <p className="text-sm font-medium text-gray-900">
                    {bill?.unit_number}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="text-sm font-medium text-gray-900">
                    {bill?.profile?.full_name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">
                    {bill?.profile?.phone}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bill List */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          <h3 className="text-sm font-semibold text-gray-700">Bill Details</h3>
          {allBills.map((item) => {
            return (
              <div
                key={item.id}
                className="relative p-4 rounded-xl border border-gray-200 bg-white"
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
                              <div
                                key={extra.id || Math.random()}
                                className="flex justify-between pl-2"
                              >
                                <span>{extra.name}</span>
                                <span>+₹{extra.amount.toLocaleString()}</span>
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
                </div>
              </div>
            );
          })}
        </div>
      </ModalBody>

      <ModalFooter className="flex justify-end gap-3 pt-4 border-t border-gray-100 sticky bottom-0 left-0 right-0">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Close
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default ViewMaintenanceDetailsModal;
