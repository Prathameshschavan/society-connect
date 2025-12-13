import {
  Calendar,
  CheckCircle,
  CreditCard,
  Home,
  Phone,
  Receipt,
  User,
} from "lucide-react";
import Modal, { ModalBody, ModalFooter } from "./Modal";
import type React from "react";
import type { MaintenanceBill } from "../../libs/stores/useMaintenanceStore";
import useCommonService from "../../hooks/serviceHooks/useCommonService";
import { type ExtraItem } from "../../libs/stores/useOrganizationStore";
import { useMemo } from "react";
import BillPdfDownload from "../recieptTemplates.tsx/BasicReceiptTemplate";
import StatusBadge from "../ui/StatusBadge";

interface ViewMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: MaintenanceBill | null;
  residentInfo?: boolean;
}

const ViewMaintenanceDetailsModal: React.FC<ViewMaintenanceModalProps> = ({
  isOpen,
  onClose,
  bill,
  residentInfo = true,
}) => {
  console.log("Selected Bill:", bill);
  const { longMonth } = useCommonService();

  const extrasList = useMemo(() => {
    // const bills = bill?.breakdown?.dues?.map((due) => due?.extras);
    return bill
      ? [
          // ...(bills || []),
          ...(bill?.breakdown?.extras?.length ? [bill?.breakdown?.extras] : []),
        ]
      : [];
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
        {/* Bill Summary Section with Gradient Background */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">
              {longMonth[Number(bill.bill_month) - 1]} {bill.bill_year} -
              Maintenance Bill
            </h3>
            <div className="flex-shrink-0">
              <BillPdfDownload
                bill={bill as MaintenanceBill}
                extras={extrasList.flat()}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Unit Number */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Home className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Unit Number</p>
                <p className="text-sm font-semibold text-gray-900">
                  {bill?.unit_number}
                </p>
              </div>
            </div>

            {/* Bill Period */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Period</p>
                <p className="text-sm font-semibold text-gray-900">
                  {longMonth[Number(bill.bill_month) - 1]} {bill.bill_year}
                </p>
              </div>
            </div>

            {/* Total Amount */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Amount</p>
                <p className="text-sm font-semibold text-gray-900">
                  ₹{bill.amount}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>

                <StatusBadge status={bill.status as string} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Resident Information */}
            {residentInfo && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Resident Information
                </label>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Home className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-blue-700">Unit Number</p>
                        <p className="font-medium text-blue-900">
                          {bill?.unit_number}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-blue-700">Full Name</p>
                        <p className="font-medium text-blue-900">
                          {bill?.profile?.full_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Phone className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-blue-700">Phone</p>
                        <p className="font-medium text-blue-900">
                          {bill?.profile?.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction Details (if paid) */}
            {bill.status === "paid" && bill.razorpay_payment_id && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Transaction Details
                </label>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-green-700">Transaction ID</p>
                      <p className="font-medium text-green-900 font-mono text-sm">
                        {bill.razorpay_payment_id}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Amount Breakdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Amount Breakdown
            </label>
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className=" border-b border-gray-200">
                <h4 className="font-medium text-gray-900 p-3">
                  Maintenance & Penalty
                </h4>
                <div className="space-y-2">
                  {/* Prior dues */}
                  {(bill.breakdown?.dues || [])?.reverse().map((due) => (
                    <div
                      key={`${due.year}-${due.month}`}
                      className="space-y-2 "
                    >
                      <div className="flex justify-between items-center  p-3 text-sm">
                        <span className="text-gray-600">
                          Maintenance ({longMonth[Number(due?.month) - 1]}{" "}
                          {due.year})
                        </span>
                        <span className="font-medium text-gray-900">
                          ₹{due?.base_amount}
                        </span>
                      </div>
                      {due.penalty > 0 && (
                        <div className="flex justify-between items-center p-3 text-sm">
                          <span className="text-gray-600">
                            Penalty ({longMonth[Number(due?.month) - 1]}{" "}
                            {due.year})
                          </span>
                          <span className="font-medium text-red-600">
                            ₹{due?.penalty}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Current base */}
                  <div className="flex justify-between items-center p-3 text-sm ">
                    <span className="text-gray-600">
                      Maintenance ({longMonth[Number(bill.bill_month) - 1]}{" "}
                      {bill.bill_year})
                    </span>
                    <span className="font-medium text-gray-900">
                      ₹{bill.breakdown?.base_amount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Charges */}
              {extrasList.length > 0 && (
                <div className="p-4 border-b border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Additional Charges
                  </h4>
                  <div className="space-y-2">
                    {extrasList.map((ex) => (
                      <ExtraListItem key={Math.random()} items={ex} />
                    ))}
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="p-4 bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">
                    Total Amount
                  </span>
                  <span className="text-xl font-bold text-blue-600">
                    ₹{bill.amount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ModalBody>

      <ModalFooter className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200 font-medium transition-colors"
        >
          Close
        </button>
      </ModalFooter>
    </Modal>
  );
};

const ExtraListItem = ({ items }: { items: ExtraItem[] }) => {
  const { longMonth } = useCommonService();
  return (
    <>
      {items.map((item) => (
        <div
          key={item.id}
          className="flex justify-between items-center py-2 text-sm"
        >
          <span className="text-gray-600">
            {item.name} ({longMonth[Number(item.month) - 1]} {item.year})
          </span>
          <span className="font-medium text-gray-900">₹{item.amount || 0}</span>
        </div>
      ))}
    </>
  );
};

export default ViewMaintenanceDetailsModal;
