import React from "react";
import type {
  FieldErrors,
  UseFormRegister,
  UseFormWatch,
} from "react-hook-form";
import type { IOrganization } from "../../types/organization.types";
import CustomInput from "../ui/CustomInput";

const Location: React.FC<{
  register: UseFormRegister<IOrganization>;
  errors: FieldErrors<IOrganization>;
  watch: UseFormWatch<IOrganization>;
}> = ({ errors, register, watch }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Location Details
        </h3>
        <div className="space-y-6">
          <CustomInput
            type="text"
            label="Address line 1"
            {...register("address_line_1", {
              required: "Address is required",
            })}
            error={errors?.address_line_1}
            value={watch("address_line_1")}
          />

          <CustomInput
            type="text"
            label="Address line 2"
            {...register("address_line_2")}
            error={errors?.address_line_2}
            value={watch("address_line_2")}
          />

          <div className="grid grid-cols-2 gap-3">
            <CustomInput
              type="text"
              label="City"
              {...register("city", {
                required: "City is required",
              })}
              error={errors?.city}
              value={watch("city")}
            />

            <CustomInput
              type="text"
              label="State"
              {...register("state", {
                required: "State is required",
              })}
              error={errors?.state}
              value={watch("state")}
            />
          </div>

          <CustomInput
            type="text"
            label="Pincode"
            {...register("pincode", {
              required: "Pincode is required",
            })}
            error={errors?.pincode}
            value={watch("pincode")}
          />
        </div>
      </div>
    </div>
  );
};

export default Location;
