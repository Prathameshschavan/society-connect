import type { TableColumn } from "../../components/ui/GenericTable";
import type { Expense } from "../../libs/stores/useReportStore";
import { formatDate } from "../../utility/dateTimeServices";

export const columns: TableColumn<Expense>[] = [
  {
    key: "Name",
    header: "Expense Name",
    render: (expense) => (
      <div>
        <p className="font-medium text-gray-900">{expense.name || "N/A"}</p>
      </div>
    ),
    className: "text-gray-900 font-medium",
  },
  {
    key: "receiver",
    header: "Receiver",
    render: (expense) => (
      <div>
        <p className="text-gray-900 font-medium">
          {expense.receiver_name || "N/A"}
        </p>
      </div>
    ),
    className: "text-gray-900",
  },
  {
    key: "desc",
    header: "Description",
    render: (expense) => (
      <div>
        <p className="text-gray-900">
          {expense.description && expense.description?.length > 20
            ? expense.description?.slice(0, 20) + "..."
            : expense.description || "N/A"}
        </p>
      </div>
    ),
    className: "text-gray-900",
  },
  {
    key: "currentAmount",
    header: <p>Amount</p>,
    render: (expense) => (
      <div>
        <div className="text-gray-900">₹ {expense?.amount}</div>
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (expense) => (
      <div>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            expense.status === "paid"
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {expense.status?.charAt(0).toUpperCase() + expense.status?.slice(1) ||
            "N/A"}
        </span>
      </div>
    ),
  },
  {
    key: "files",
    header: "Files",
    render: (expense) => (
      <div>
        {expense.files?.length ? (
          <div className="flex items-center">
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
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <span className="ml-1 text-xs text-green-600">Available</span>
          </div>
        ) : (
          <span className="text-xs text-gray-400">No Files</span>
        )}
      </div>
    ),
  },
  {
    key: "Date",
    header: "Date",
    render: (expense) => (
      <div>
        <div className="text-gray-900">{formatDate(expense?.date)}</div>
      </div>
    ),
  },
];
