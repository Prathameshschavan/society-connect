import type { LucideIcon } from "lucide-react";
import React from "react";

const ActionModalHeader: React.FC<{
  Icon: LucideIcon;
  title: string;
  desc: string;
  totalSteps: number;
  currentStep: number;
}> = ({ Icon, currentStep, desc, title, totalSteps }) => {
  return (
    <div className="text-center mb-6 relative">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-3">
        <Icon className="w-6 h-6 text-indigo-600" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600">
        {desc}
      </p>
      <p className="text-sm text-gray-900 font-medium absolute top-0 left-0">
        {currentStep} / {totalSteps}
      </p>
    </div>
  );
};

export default ActionModalHeader;
