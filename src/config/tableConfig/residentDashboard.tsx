import type { TableColumn } from "../../components/ui/GenericTable";
import type { MaintenanceBill } from "../../libs/stores/useMaintenanceStore";
import { getStatusColor, getStatusIcon } from "../../utility/chipServices";
import { shortMonth } from "../../utility/dateTimeServices";

export const columns: TableColumn<MaintenanceBill>[] = [
  {
    key: "monthYear",
    header: "Month/Year",
    render: (bill) => (
      <div>
        <div className=" text-gray-900">
          {shortMonth[Number(bill.bill_month) - 1]} {bill?.bill_year}
        </div>
      </div>
    ),
  },
  {
    key: "currentAmount",
    header: <p>Amount</p>,
    render: (bill) => (
      <div>
        <div className=" text-gray-900">₹ {bill?.breakdown?.base_amount}</div>
      </div>
    ),
  },
  {
    key: "penalty",
    header: <p>Penalty</p>,
    render: (bill) => (
      <div>
        <div className=" text-gray-900">₹ {bill?.breakdown?.penalty}</div>
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (bill) => (
      <div>
        <span
          className={`capitalize inline-flex text-white! items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
            bill.status as string
          )}`}
        >
          {getStatusIcon(bill.status as string)}
          {bill.status}
        </span>
      </div>
    ),
  },
];
