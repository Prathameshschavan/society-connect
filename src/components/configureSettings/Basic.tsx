import React from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { Organization } from "../../libs/stores/useOrganizationStore";

const Basic: React.FC<{
  register: UseFormRegister<Organization>;
  errors: FieldErrors<Organization>;
}> = ({ register, errors }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Society Name *
            </label>
            <input
              type="text"
              {...register("name", {
                required: "Society name is required",
                minLength: {
                  value: 2,
                  message: "Society name must be at least 2 characters",
                },
              })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter society name"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Registration Number
            </label>
            <input
              type="text"
              {...register("registration_number")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter registration number"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Established Date
            </label>
            <input
              type="date"
              {...register("established_date")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Basic;
