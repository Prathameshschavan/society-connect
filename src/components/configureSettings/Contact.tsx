import React from "react";
import type {
  FieldErrors,
  UseFormRegister,
  UseFormWatch,
} from "react-hook-form";
import type { IOrganization } from "../../types/organization.types";
import CustomInput from "../ui/CustomInput";

const Contact: React.FC<{
  register: UseFormRegister<IOrganization>;
  errors: FieldErrors<IOrganization>;
  watch: UseFormWatch<IOrganization>;
}> = ({ errors, register, watch }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         
          <CustomInput
            type="tel"
            label="Society Phone Number"
            {...register("phone", {
              required: "Phone number is required",
              pattern: {
                value: /^\d{10}$/,
                message: "Phone must be exactly 10 digits",
              },
            })}
            error={errors.phone}
            value={watch("phone")}
          />
        </div>
      </div>
    </div>
  );
};

export default Contact;
