import React from "react";
import { getStatusColor, getStatusIcon } from "../../utility/chipServices";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md" | "lg";
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "md" }) => {
  return (
    <div>
      <span
        className={`capitalize inline-flex text-white! items-center gap-1.5  px-3 py-1 rounded-full ${size === "sm" ? "text-xs" : size === "lg" ? "text-lg" : "text-sm"} font-medium ${getStatusColor(
          status
        )}`}
      >
        {getStatusIcon(status)}
        {status}
      </span>
    </div>
  );
};

export default StatusBadge;
