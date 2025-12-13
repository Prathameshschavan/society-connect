import React, { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import Modal, { ModalBody, ModalFooter } from "./Modal";
import CustomInput from "../ui/CustomInput";
import CustomSelect from "../ui/CustomSelect";
import Autocomplete from "../ui/Autocomplete";
import type { IUnit } from "../../types/unit.types";
import useUnitApiService from "../../hooks/apiHooks/useUnitApiService";
import useProfileApiService from "../../hooks/apiHooks/useProfileApiService";
import { useProfileStore } from "../../libs/stores/useProfileStore";
import toast from "react-hot-toast";
import OnboardResidentModal from "./OnboardResidentModal";

interface UnitFormData {
  unitNumber: string;
  squareFootage: string;
  unitType:
    | "1RK"
    | "1BHK"
    | "2BHK"
    | "3BHK"
    | "4BHK"
    | "shop"
    | "Other";
  profileId: string;
}

interface AddUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  callback?: () => void;
}

const AddUnitModal: React.FC<AddUnitModalProps> = ({
  isOpen,
  onClose,
  callback,
}) => {
  const { handleAddUnit } = useUnitApiService();
  const { handleGetAllProfiles } = useProfileApiService();
  const { profile, residents } = useProfileStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddResidentModalOpen, setIsAddResidentModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UnitFormData>();

  const selectedProfileId = watch("profileId");

  // Fetch residents when modal opens
  useEffect(() => {
    if (isOpen) {
      handleGetAllProfiles({
        organization_id: profile?.organization_id,
        limit: 1000, // Get all residents
      });
    }
  }, [isOpen, profile?.organization_id]);

  const onFormSubmit: SubmitHandler<UnitFormData> = async (data) => {
    try {
      setIsSubmitting(true);

      const unitData: IUnit = {
        unit_number: data.unitNumber,
        square_footage: parseFloat(data.squareFootage),
        unit_type: data.unitType,
        organization_id: profile?.organization_id as string,
        ...(data.profileId
          ? {
              profile_id: data.profileId,
            }
          : {}),
      };

      await handleAddUnit(unitData);
      toast.success("Unit added successfully!");
      handleModalClose();
      if (callback) callback();
    } catch (error: any) {
      toast.error(error.message || "Failed to add unit");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Add Unit"
      onClose={handleModalClose}
      size="lg"
    >
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomInput
              key="unitNumber"
              label="Unit Number"
              type="text"
              placeholder="e.g., 101, A-12"
              {...register("unitNumber", {
                required: "Unit number is required",
              })}
              error={errors.unitNumber?.message}
            />

            <CustomInput
              key="squareFootage"
              label="Square Footage"
              type="number"
              placeholder="e.g., 1200"
              {...register("squareFootage", {
                required: "Square footage is required",
                min: {
                  value: 1,
                  message: "Square footage must be greater than 0",
                },
              })}
              error={errors.squareFootage?.message}
            />

            <CustomSelect
              key="unitType"
              label="Unit Type"
              {...register("unitType", {
                required: "Unit type is required",
              })}
              error={errors.unitType?.message}
            >
              <option value="1RK">1RK</option>
              <option value="1BHK">1BHK</option>
              <option value="2BHK">2BHK</option>
              <option value="3BHK">3BHK</option>
              <option value="4BHK">4BHK</option>
              <option value="shop">Shop</option>
              <option value="Other">Other</option>
            </CustomSelect>

            <Autocomplete
              label="Assign Resident (Optional)"
              options={residents.map((resident) => ({
                value: resident.id || "",
                label: `${resident.full_name} (${resident.phone})`,
              }))}
              value={selectedProfileId}
              onChange={(value) => setValue("profileId", value)}
              onAddNew={() => setIsAddResidentModalOpen(true)}
              placeholder="Search for a resident..."
            />
          </div>
        </ModalBody>

        <ModalFooter className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleModalClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-[#22C36E] text-white rounded-lg hover:bg-[#1ea05f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Adding..." : "Add Unit"}
          </button>
        </ModalFooter>
      </form>

      {/* Onboard Resident Modal */}
      <OnboardResidentModal
        isOpen={isAddResidentModalOpen}
        onClose={() => setIsAddResidentModalOpen(false)}
        callback={async () => {
          // Refresh residents list after adding new resident
          const res = await handleGetAllProfiles({
            organization_id: profile?.organization_id,
            limit: 1000,
          });
          setValue("profileId", res.data?.[0]?.id);
        }}
      />
    </Modal>
  );
};

export default AddUnitModal;
