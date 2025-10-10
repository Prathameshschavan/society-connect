import React from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { Organization } from "../../libs/stores/useOrganizationStore";

const Contact: React.FC<{
  register: UseFormRegister<Organization>;
  errors: FieldErrors<Organization>;
}> = ({ errors, register }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Society Phone Number *
            </label>
            <input
              type="tel"
              {...register("phone", {
                required: "Phone number is required",
                pattern: {
                  value: /^\d{10}$/,
                  message: "Phone must be exactly 10 digits",
                },
              })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.phone ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter 10-digit phone number"
              maxLength={10}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
