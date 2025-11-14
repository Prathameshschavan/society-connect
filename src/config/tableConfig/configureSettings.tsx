import type { TableColumn } from "../../components/ui/GenericTable";
import type { IProfile } from "../../types/user.types";

export const columns: TableColumn<IProfile>[] = [
  {
    key: "room",
    header: "Room",
    render: (profile) => (
      <div className="font-medium text-gray-900">
        {profile.unit_number || "N/A"}
      </div>
    ),
    className: "text-gray-900 font-medium",
  },
  {
    key: "name",
    header: "Resident Name",
    render: (profile) => (
      <div>
        <div className="font-medium text-gray-900">{profile.full_name}</div>
        <div className="text-sm text-gray-500">{profile.id}</div>
      </div>
    ),
  },
  {
    key: "role",
    header: "Role",
    className: "text-gray-700",
    render: (profile) => (
      <div className=" capitalize text-gray-500">{profile.role}</div>
    ),
  },
];
