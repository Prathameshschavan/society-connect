import type { TableColumn } from "../../components/ui/GenericTable";
import type { IncomeRow } from "../../hooks/serviceHooks/useIncomeService";
import { formatDate } from "../../utility/dateTimeServices";

export const columns: TableColumn<IncomeRow>[] = [
  {
    key: "Name",
    header: "Name",
    render: (income) => (
      <div>
        <p className="font-medium text-gray-900">{income.name || "N/A"}</p>
      </div>
    ),
    className: "text-gray-900 font-medium",
  },
  {
    key: "desc",
    header: "Description",
    render: (income) => (
      <div>
        <p className=" text-gray-900">
          {income.description && income.description?.length > 20
            ? income.description?.slice(0, 20) + "..."
            : income.description || "N/A"}
        </p>
      </div>
    ),
    className: "text-gray-900 ",
  },

  {
    key: "currentAmount",
    header: <p>Amount</p>,
    render: (income) => (
      <div>
        <div className=" text-gray-900">₹ {income?.amount}</div>
      </div>
    ),
  },

  {
    key: "Date",
    header: "Date",
    render: (income) => (
      <div>
        <div className=" text-gray-900">
          {formatDate(income?.date)}
        </div>
      </div>
    ),
  },
];
