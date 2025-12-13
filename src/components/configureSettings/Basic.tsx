import React from "react";
import type {
  FieldErrors,
  UseFormRegister,
  UseFormWatch,
} from "react-hook-form";
import type { IOrganization } from "../../types/organization.types";
import CustomInput from "../ui/CustomInput";

const Basic: React.FC<{
  register: UseFormRegister<IOrganization>;
  errors: FieldErrors<IOrganization>;
  watch: UseFormWatch<IOrganization>;
}> = ({ register, errors, watch }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CustomInput
            type="text"
            label="Society Name"
            {...register("name", {
              required: "Society name is required",
              minLength: {
                value: 2,
                message: "Society name must be at least 2 characters",
              },
            })}
            error={errors.name}
            value={watch("name")}
          />
          
          <CustomInput
            type="text"
            label="Registration Number"
            {...register("registration_number")}
            error={errors.registration_number}
            value={watch("registration_number")}
          />

          <CustomInput
            type="date"
            label="Established Date"
            {...register("established_date", {
              required: "Established date is required",
            })}
            error={errors.established_date}
            value={watch("established_date")}
          />
        </div>
      </div>
    </div>
  );
};

export default Basic;
