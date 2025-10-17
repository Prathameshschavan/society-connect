import Modal, { ModalBody, ModalFooter } from "./Modal";
import type { IncomeRow } from "../../hooks/serviceHooks/useIncomeService";
import { formatDate } from "../../utility/dateTimeServices";
import { IndianRupee } from "lucide-react";

type ViewIncomeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  income: IncomeRow | null;
};

const ViewIncomeModal = ({ isOpen, onClose, income }: ViewIncomeModalProps) => {
  if (!isOpen || !income) return null;

  return (
    <Modal title="Income Details" isOpen={isOpen} onClose={onClose} size="lg">
      <ModalBody className="space-y-6">
        {/* Header Section */}
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {income.name}
              </h3>
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border bg-green-100 text-green-800 border-green-200">
                  Income
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  ₹{income.amount?.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Income Source
              </label>
              <p className="text-gray-900 font-medium text-lg">{income.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Date Received
              </label>
              <p className="text-gray-900 font-medium">
                {formatDate(income.date)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Month & Year
              </label>
              <p className="text-gray-900">
                {income.month}/{income.year}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Created On
              </label>
              <p className="text-gray-900 text-sm">
                {formatDate(income.created_at)}
              </p>
            </div>
          </div>

          {/* Right Column - Summary Card */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Income Summary
            </label>
            <div className="border border-gray-200 rounded-lg bg-gradient-to-br from-green-50 to-blue-50 p-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <IndianRupee className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-sm text-gray-600 mb-2">Total Amount</p>
                <p className="text-3xl font-bold text-green-600">
                  ₹{income.amount?.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Received on {formatDate(income.date)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        {income.description && (
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Description
            </label>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-900 leading-relaxed">
                {income.description}
              </p>
            </div>
          </div>
        )}

        {/* Additional Info Card */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center mb-2">
            <svg
              className="h-5 w-5 text-green-600 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h4 className="text-sm font-medium text-green-900">
              Additional Information
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-green-700 font-medium">Income ID:</span>
              <span className="text-green-900 ml-2 font-mono text-xs">
                {income.id.slice(0, 8)}...
              </span>
            </div>
            <div>
              <span className="text-green-700 font-medium">Amount:</span>
              <span className="text-green-900 ml-2">
                ₹{income.amount?.toLocaleString("en-IN")}
              </span>
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

export default ViewIncomeModal;
