import Modal from "./Modal";
import { formatDate } from "../../utility/dateTimeServices";
import type { Expense } from "../../libs/stores/useReportStore";
import {
  FileText,
  Image as ImageIcon,
  Archive,
  ExternalLink,
} from "lucide-react";

type ViewExpenseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
};

export function ViewExpenseModal({
  isOpen,
  onClose,
  expense,
}: ViewExpenseModalProps) {
  if (!isOpen || !expense) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      case "unpaid":
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === "image") {
      return <ImageIcon className="w-5 h-5 text-blue-500" />;
    }
    if (fileType === "pdf") {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    if (fileType === "zip") {
      return <Archive className="w-5 h-5 text-yellow-500" />;
    }
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  return (
    <Modal title="Expense Details" isOpen={isOpen} onClose={onClose} size="lg">
      {/* Form Content */}
      <div className="p-6 max-h-[60vh] overflow-y-auto">
        <div className="space-y-4">
          {/* Header Section */}
          <div className="border-b border-gray-200 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {expense.name}
                </h3>
                <div className="flex justify-between items-center gap-3">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                      expense.status
                    )}`}
                  >
                    {expense.status?.charAt(0).toUpperCase() +
                      expense.status?.slice(1)}
                  </span>
                  <span className="text-2xl font-bold text-gray-900">
                    ₹{expense.amount?.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Receiver Name
              </label>
              <p className="text-gray-900 font-medium px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                {expense.receiver_name}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <p className="text-gray-900 font-medium px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                {formatDate(expense.date)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (INR)
              </label>
              <p className="text-gray-900 font-medium px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                ₹{expense.amount?.toLocaleString("en-IN")}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Status
              </label>
              <p className="text-gray-900 font-medium px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                {expense.status?.charAt(0).toUpperCase() +
                  expense.status?.slice(1)}
              </p>
            </div>
          </div>

          {/* Description Section */}
          {expense.description && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                <p className="text-gray-900 leading-relaxed">
                  {expense.description}
                </p>
              </div>
            </div>
          )}

          {/* Documents/Files Section */}
          {expense.files && expense.files.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Documents
              </label>
              <div className="space-y-2">
                {expense.files.map((file: any, index: number) => (
                  <div
                    key={index}
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
                      <p className="text-xs text-gray-500 capitalize">
                        {file.type} file
                      </p>
                    </div>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Open file"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata Section */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600 font-medium">Expense ID:</span>
                <span className="text-gray-900 ml-2 font-mono text-xs">
                  {expense.id.slice(0, 8)}...
                </span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Created On:</span>
                <span className="text-gray-900 ml-2">
                  {formatDate(expense.created_at)}
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
}
