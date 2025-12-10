import Modal from "./Modal";
import type { IncomeRow } from "../../hooks/serviceHooks/useIncomeService";
import { formatDate } from "../../utility/dateTimeServices";

type ViewIncomeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  income: IncomeRow | null;
};

const ViewIncomeModal = ({ isOpen, onClose, income }: ViewIncomeModalProps) => {
  if (!isOpen || !income) return null;

  return (
    <Modal title="Income Details" isOpen={isOpen} onClose={onClose} size="lg">
      {/* Content */}
      <div className="p-6 max-h-[60vh] overflow-y-auto">
        <div className="space-y-4">
          {/* Header Section */}
          <div className="border-b border-gray-200 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {income.name}
                </h3>
                <div className="flex justify-between items-center gap-3">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <p className="text-gray-900 font-medium px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                {formatDate(income.date)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (INR)
              </label>
              <p className="text-gray-900 font-medium px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                ₹{income.amount?.toLocaleString("en-IN")}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Month / Year
              </label>
              <p className="text-gray-900 font-medium px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                {income.month} / {income.year}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Created On
              </label>
              <p className="text-gray-900 font-medium px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                {formatDate(income.created_at)}
              </p>
            </div>
          </div>

          {/* Description Section */}
          {income.description && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                <p className="text-gray-900 leading-relaxed">
                  {income.description}
                </p>
              </div>
            </div>
          )}

          {/* Metadata Section */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600 font-medium">Income ID:</span>
                <span className="text-gray-900 ml-2 font-mono text-xs">
                  {income.id.slice(0, 8)}...
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end items-center gap-2 p-6 border-t bg-gray-50">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default ViewIncomeModal;
