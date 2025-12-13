import type { TableColumn } from "../../components/ui/GenericTable";
import type { MaintenanceBill } from "../../libs/stores/useMaintenanceStore";

import { shortMonth } from "../../utility/dateTimeServices";
import StatusBadge from "../../components/ui/StatusBadge";

export const columns: TableColumn<MaintenanceBill>[] = [
  {
    key: "unit",
    header: "Unit",
    render: (bill) => (
      <div>
        <p className="font-medium text-gray-900">
          {bill?.unit_number || "N/A"}
        </p>
        <p className="font-light text-gray-900">{bill.profile?.full_name}</p>
      </div>
    ),
    className: "text-gray-900 font-medium",
  },

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
        <div className=" text-gray-900">₹ {bill?.amount}</div>
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (bill) => <StatusBadge status={bill.status as string} />,
  },
];
