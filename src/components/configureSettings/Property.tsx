import React from "react";
import type {
  FieldErrors,
  UseFormRegister,
  UseFormWatch,
} from "react-hook-form";
import type { IOrganization } from "../../types/organization.types";
import CustomInput from "../ui/CustomInput";

const Property: React.FC<{
  register: UseFormRegister<IOrganization>;
  errors: FieldErrors<IOrganization>;
  watch: UseFormWatch<IOrganization>;
}> = ({ errors, register, watch }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Property Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CustomInput
            type="number"
            disabled
            label="Total Number of Units"
            {...register("total_units", {
              required: "Total units is required",
              min: {
                value: 1,
                message: "Total units must be at least 1",
              },
              valueAsNumber: true,
            })}
            error={errors.total_units}
            value={watch("total_units")}
          />
        </div>
      </div>
    </div>
  );
};

export default Property;
