import type { TableColumn } from "../../components/ui/GenericTable";
import type { IUnit } from "../../types/unit.types";

export const columns: TableColumn<IUnit>[] = [
  {
    key: "room",
    header: "Room",
    render: (unit) => (
      <div className="font-medium text-gray-900">
        {unit.unit_number || "N/A"}
      </div>
    ),
    className: "text-gray-900 font-medium",
  },
  {
    key: "name",
    header: "Resident Name",
    render: (unit) => (
      <div>
        <div className="font-medium text-gray-900">{unit.profile?.full_name}</div>
        <div className="text-sm text-gray-500">{unit.profile?.id}</div>
      </div>
    ),
  },
  {
    key: "role",
    header: "Role",
    className: "text-gray-700",
    render: (unit) => (
      <div className=" capitalize text-gray-500">{unit.profile?.role}</div>
    ),
  },
];
