import { AlertCircle, CheckCircle, Clock } from "lucide-react";

export const getStatusIcon = (status: string) => {
  switch (status) {
    case "paid":
      return <CheckCircle className="w-4 h-4 !text-white" />;
    case "pending":
      return <Clock className="w-4 h-4 !text-white" />;
    case "overdue":
      return <AlertCircle className="w-4 h-4 !text-white" />;
    default:
      return <Clock className="w-4 h-4 !text-white" />;
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "paid":
      return "!text-white bg-green-500";
    case "pending":
      return "!text-white bg-yellow-500";
    case "overdue":
      return "!text-white bg-red-500";
    default:
      return "!text-white bg-gray-500";
  }
};
