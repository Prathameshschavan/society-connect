import React from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { IOrganization } from "../../types/organization.types";

const Property: React.FC<{
  register: UseFormRegister<IOrganization>;
  errors: FieldErrors<IOrganization>;
}> = ({ errors, register }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Property Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Number of Units *
            </label>
            <input
              type="number"
              min="1"
              {...register("total_units", {
                required: "Total units is required",
                min: {
                  value: 1,
                  message: "Total units must be at least 1",
                },
                valueAsNumber: true,
              })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.total_units ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter total number of units"
            />
            {errors.total_units && (
              <p className="text-red-500 text-xs mt-1">
                {errors.total_units.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Property;
