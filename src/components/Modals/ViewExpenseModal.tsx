import Modal, { ModalBody, ModalFooter } from "./Modal";
import { formatDate } from "../../utility/dateTimeServices";
import type { Expense } from "../../libs/stores/useReportStore";
import { useSignedImageUrl } from "../../hooks/serviceHooks/useSignedImageUrl";

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


  const {
    signedUrl: signedImageUrl,
    loading: imageLoading,
    error: imageError,
  } = useSignedImageUrl(expense?.image_url);

  if (!isOpen || !expense) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      case "unpaid":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Modal title="Expense Details" isOpen={isOpen} onClose={onClose} size="lg">
      <ModalBody className="space-y-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Receiver Name
              </label>
              <p className="text-gray-900 font-medium text-lg">
                {expense.receiver_name}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Date
              </label>
              <p className="text-gray-900 font-medium">
                {formatDate(expense.date)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Month & Year
              </label>
              <p className="text-gray-900">
                {expense.month}/{expense.year}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Created On
              </label>
              <p className="text-gray-900 text-sm">
                {formatDate(expense.created_at)}
              </p>
            </div>
          </div>

          {/* Right Column - Image or Placeholder */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Receipt / Photo
            </label>
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
              {expense.image_url ? (
                <div className="relative">
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                  {imageError ? (
                    <div className="h-48 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </svg>
                        <p className="mt-2 text-sm">Failed to load image</p>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={signedImageUrl}
                      alt="Expense receipt"
                      className="w-full h-48 object-cover"
                    />
                  )}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="mt-2 text-sm">No image available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description Section */}
        {expense.description && (
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Description
            </label>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-900 leading-relaxed">
                {expense.description}
              </p>
            </div>
          </div>
        )}

        {/* Additional Info Card */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center mb-2">
            <svg
              className="h-5 w-5 text-blue-600 mr-2"
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
            <h4 className="text-sm font-medium text-blue-900">
              Additional Information
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-blue-700 font-medium">Expense ID:</span>
              <span className="text-blue-900 ml-2 font-mono text-xs">
                {expense.id.slice(0, 8)}...
              </span>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Amount:</span>
              <span className="text-blue-900 ml-2">
                ₹{expense.amount?.toLocaleString("en-IN")}
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
        {expense.image_url && (
          <a
            href={signedImageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 font-medium transition-colors inline-flex items-center gap-2"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            View Full Image
          </a>
        )}
      </ModalFooter>
    </Modal>
  );
}
