import {
  Calendar,
  CheckCircle,
  CreditCard,
  Home,
  Phone,
  Receipt,
  User,
} from "lucide-react";
import Modal from "./Modal";
import type React from "react";
import type { MaintenanceBill } from "../../libs/stores/useMaintenanceStore";
import useCommonService from "../../hooks/serviceHooks/useCommonService";

interface ViewMaintananceModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: MaintenanceBill | null;
  residentInfo?: boolean;
}

import { type ExtraItem } from "../../libs/stores/useOrganizationStore";
import { useMemo } from "react";
import BillPdfDownload from "../recieptTemplates.tsx/BasicReceiptTemplate";

const ViewMaintananceDetailsModal: React.FC<ViewMaintananceModalProps> = ({
  isOpen,
  onClose,
  bill,
  residentInfo = true,
}) => {
  const { getStatusColor, getStatusIcon, longMonth } = useCommonService();

  const extrasList = useMemo(() => {
    const bills = bill?.breakdown?.dues?.map((due) => due?.extras);
    return bill
      ? [
          ...(bills || []),
          ...(bill?.breakdown?.extras?.length ? [bill?.breakdown?.extras] : []),
        ]
      : [];
  }, [bill]);

  return (
    <Modal
      title={`Maintanance Details`}
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
    >
      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Resident Information */}
        {residentInfo && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Resident Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Home className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Unit Number</p>
                  <p className="font-medium text-gray-900">
                    {bill?.resident?.unit_number}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-900">
                    {bill?.resident?.full_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">
                    {bill?.resident?.phone}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bill Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Bill Information
            </h3>
            {bill && (
              <BillPdfDownload
                bill={bill as MaintenanceBill}
                extras={extrasList.flat()}
              />
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Bill Period</p>
                <p className="font-medium text-gray-900">
                  {new Date(
                    Number(bill?.bill_year),
                    Number(bill?.bill_month) - 1
                  ).toLocaleDateString("en-US", { month: "long" })}{" "}
                  {bill?.bill_year}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`capitalize inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    bill?.status as string
                  )}`}
                >
                  {getStatusIcon(bill?.status as string)}
                  {bill?.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Amount Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Amount Breakdown
          </h3>
          <div className="space-y-3">
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-2 flex items-center gap-2">
                Maintenance & Penalty
              </h3>
              {/* Prior dues */}
              {(bill?.breakdown?.dues || []).map((due) => (
                <div key={`${due.year}-${due.month}`}>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">
                      Maintenance ({longMonth[Number(due?.month) - 1]}{" "}
                      {bill?.bill_year})
                    </span>
                    <span className="font-medium text-gray-900">
                      ₹{due?.amount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">
                      Penalty ({longMonth[Number(due?.month) - 1]}{" "}
                      {bill?.bill_year})
                    </span>
                    <span className="font-medium text-red-600">
                      ₹{due?.penalty || 0}
                    </span>
                  </div>
                </div>
              ))}
              {/* Current base */}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">
                  Maintenance ({longMonth[Number(bill?.bill_month) - 1]}{" "}
                  {bill?.bill_year})
                </span>
                <span className="font-medium text-gray-900">
                  ₹{bill?.breakdown?.base}
                </span>
              </div>

              {/* Current extras list */}
              {extrasList.length > 0 && (
                <>
                  <h3 className="text-md font-semibold text-gray-900 mb-2 flex items-center gap-2 mt-4">
                    Additional Charges
                  </h3>
                  {extrasList.map((ex) => (
                    <ExtraListItem items={ex} />
                  ))}
                </>
              )}
            </div>

            {/* Grand total */}
            <div className="flex justify-between items-center py-3 bg-gray-50 rounded-lg px-4">
              <span className="text-lg font-semibold text-gray-900">
                Total Amount
              </span>
              <span className="text-xl font-bold text-blue-600">
                ₹{bill?.amount}
              </span>
            </div>
          </div>
        </div>

        {/* Transaction Details (if paid) */}
        {bill?.status === "paid" && bill?.razorpay_payment_id && (
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Transaction Details
            </h3>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Transaction ID</p>
                <p className="font-medium text-gray-900">
                  {bill?.razorpay_payment_id}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

const ExtraListItem = ({ items }: { items: ExtraItem[] }) => {
  const { longMonth } = useCommonService();
  return items.map((item) => {
    return (
      <div
        key={item.id}
        className="flex justify-between items-center py-2 border-b border-gray-100"
      >
        <span className="text-gray-600">
          {item.name} ({longMonth[Number(item.month) - 1]} {item.year})
        </span>
        <span className="font-medium text-gray-900">₹{item.amount || 0}</span>
      </div>
    );
  });
};

export default ViewMaintananceDetailsModal;
