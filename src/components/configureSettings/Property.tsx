import React from "react";
import type {
  FieldErrors,
  UseFormRegister,
  UseFormWatch,
} from "react-hook-form";
import type { IOrganization } from "../../types/organization.types";
import CustomInput from "../ui/CustomInput";
import { siteSetting } from "../../config/siteSetting";

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
          <div>
            <CustomInput
              type="number"
              disabled
              label="Total Number of Units (Cannot be changed)"
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
            <p className="text-xs text-gray-500 mt-2">
              if you want to change the total units, please{" "}
              <a className="font-semibold text-blue-500 cursor-pointer" href={`tel:${siteSetting.contactUsNumber}`}>
                contact us
              </a>{" "}
              so we can help you with that.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Property;
