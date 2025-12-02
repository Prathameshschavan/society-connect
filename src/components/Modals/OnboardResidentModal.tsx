import React, { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
  User,
  Home,
  Users,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  CreditCard,
} from "lucide-react";
import Modal from "./Modal";
import toast from "react-hot-toast";
import { useProfileStore } from "../../libs/stores/useProfileStore";
import useProfileApiService from "../../hooks/apiHooks/useProfileApiService";
import type { TRole } from "../../types/user.types";
import ActionModalHeader from "../ActionModalHeader";
import CustomInput from "../ui/CustomInput";
import CustomSelect from "../ui/CustomSelect";
import type { AddResidentParams } from "../../apis/resident.apis";
import useUnitApiService from "../../hooks/apiHooks/useUnitApiService";

export interface ResidentFormData {
  // Personal Info
  fullName: string;
  phone: string;
  email: string;
  role: TRole;
  emergencyContact: string;
  emergencyContactName: string;

  // Unit Info
  unitNumber: string;
  squareFootage: string;
  unitType:
    | "1RK"
    | "1BHK"
    | "2BHK"
    | "3BHK"
    | "4BHK"
    | "Studio"
    | "Penthouse"
    | "Other";
  occupancyType: "Owner" | "Tenant";

  // Family Info
  totalFamilyMembers: number;
  adultsCount: number;
  childrenCount: number;

  twoWheelerCount: number;
  fourWheelerCount: number;
  is_tenant: boolean;
}

interface OnboardResidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  callback?: () => void;
}

const OnboardResidentModal: React.FC<OnboardResidentModalProps> = ({
  isOpen,
  onClose,
  callback,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { profile } = useProfileStore();
  const { handleAddProfile } = useProfileApiService();

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    reset,
    watch,
  } = useForm<ResidentFormData>();

  // Define fields for each step for validation
  const stepFields = {
    1: ["fullName", "phone", "email"],
    2: [ "adultsCount", "childrenCount"],
    3: [], // Vehicle step doesn't have required fields
  } as const;

  const validateStep = async (step: number): Promise<boolean> => {
    const fieldsToValidate = stepFields[step as keyof typeof stepFields];

    const result = await trigger(fieldsToValidate);
    return result;
  };

  const nextStep = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onFormSubmit: SubmitHandler<ResidentFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const userObject: AddResidentParams = {
        organization_id: profile?.organization_id as string,
        role: data?.role,
        full_name: data?.fullName,
        phone: data?.phone,
        is_tenant: data?.is_tenant,
        emergency_contact: {
          name: data?.emergencyContactName,
          phone: data?.emergencyContact,
        },
        family_members: {
          child: data?.childrenCount || 0,
          adult: data?.adultsCount || 0,
        },
        vehicles: {
          twoWheeler: Number(data?.twoWheelerCount || 0),
          fourWheeler: Number(data?.fourWheelerCount || 0),
        },
        user: {
          email: `${data?.phone}@society.app`,
          password: "123456",
        },
      };

      await handleAddProfile(userObject);
      callback?.();
      onClose();
      setCurrentStep(1);
      reset();
      toast.success("Resident onboarded successfully!");
    } catch (error: any) {
      toast.error(error?.message || "Resident onboarding failed!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setCurrentStep(1);
    reset();
    onClose();
  };

  // const unitNumbers = [
  //   { roomNo: "001", name: "Vinit Bharti", number: "8983153894" },
  //   { roomNo: "002", name: "Pratibha Bhatkar", number: "8433631562" },
  //   { roomNo: "003", name: "Shailesh Devale", number: "9773960445" },
  //   { roomNo: "004", name: "Bhushan Dalvi", number: null },
  //   { roomNo: "005", name: "Mahendra Gavnang", number: "9619395317" },
  //   { roomNo: "006", name: "Suhas Shetkar", number: "9404915304" },
  //   { roomNo: "008", name: "Eknath Patil", number: "8820263031" },
  //   { roomNo: "009", name: "Chellengi Gala", number: null },
  //   { roomNo: "101", name: "Kamlesh Bhosle", number: "9969461624" },
  //   { roomNo: "102", name: "Durga Prasad Yadav", number: "8450938601" },
  //   { roomNo: "103", name: "Shiva Prasad Yadav", number: "null" },
  //   { roomNo: "104", name: "Milind Parad", number: "8530605153" },
  //   { roomNo: "105", name: "Shyam Ayre", number: "7030759071" },
  //   { roomNo: "106", name: "Ulka Krishna Lakhan", number: "9322410490" },
  //   { roomNo: "107", name: "Amit Arun Pirdankar", number: "8805602685" },
  //   { roomNo: "108", name: "Nilesh kisan Bhosle", number: "8983316198" },
  //   { roomNo: "201", name: "Atul Bovlekar", number: "9920554171" },
  //   { roomNo: "202", name: "Archana More", number: "9220260882" },
  //   { roomNo: "203", name: "Mahesh Yashavant Bhamat", number: "9029548856" },
  //   { roomNo: "204", name: "Mohan Panchal", number: "7700026054" },
  //   { roomNo: "205", name: "Suraj Shankar Masaye", number: "9220793967" },
  //   { roomNo: "206", name: "Manoj Jaiswal", number: "8828979771" },
  //   { roomNo: "207", name: "Lalita Gangaram Mali", number: "9167456491" },
  //   { roomNo: "208", name: "Samir Sonu Karan", number: "9820518922" },
  //   { roomNo: "301", name: "Jitu Patel", number: "9867299205" },
  //   { roomNo: "302", name: "Rongaji Shivgan", number: "8149622998" },
  //   {
  //     roomNo: "303",
  //     name: "Satish Kumar Kailashnath Singh",
  //     number: "7039844259",
  //   },
  //   { roomNo: "304", name: "Shivaji Patil", number: "9702508085" },
  //   { roomNo: "305", name: "Laxmi Muddalmani", number: "9769386581" },
  //   { roomNo: "306", name: "Santosh Kumar Pandey", number: "9022404735" },
  //   { roomNo: "307", name: "Chetan Fagare", number: "9022900427" },
  //   { roomNo: "308", name: "Sharad Patil", number: "9764600777" },
  //   { roomNo: "401", name: "Bhumi Monde", number: "9004715662" },
  //   { roomNo: "402", name: "Rakesh More", number: "8692884588" },
  //   { roomNo: "403", name: "Vrushal Pichurle", number: null },
  //   { roomNo: "404", name: "Jaymanjay Singh", number: "9920436406" },
  //   { roomNo: "405", name: "Akshay Kadvadkar", number: "9768597275" },
  //   { roomNo: "406", name: "Yam Bahadur Rai", number: "9920859707" },
  //   { roomNo: "407", name: "Sandeep Dhivar", number: "9867614563" },
  //   { roomNo: "408", name: "Ajay Dambare", number: "8652044573" },
  //   { roomNo: "501", name: "Lakdewala", number: null },
  //   { roomNo: "502", name: "Mohan Bhanushali", number: "8600364341" },
  //   { roomNo: "503", name: "Chellengi", number: null },
  //   { roomNo: "504", name: "Chellengi", number: null },
  // ];

  // const addBulkResidents = () => {
  //   try {
  //     unitNumbers.forEach(async (unit) => {
  //       const data = {
  //         organization_id: residentOrganization?.id,
  //         role: "resident",
  //         full_name: unit?.name,
  //         phone: unit?.number ? unit?.number : `9000000${unit?.roomNo}`,
  //         unit_number: unit?.roomNo,
  //         square_footage: 300,
  //         must_change_password: false,
  //         created_at: new Date(),
  //         updated_at: new Date(),
  //         emergency_contact: { name: "", phone: "" },
  //         unit_type: "1RK",
  //         family_members: { child: 0, adult: 1 },
  //         vehicles: { hasVehicles: false, twoWheeler: 0, fourWheeler: 0 },
  //         is_deleted: false,
  //       };
  //       const { error: authError } = await supabaseAdmin.auth.admin.createUser({
  //         email: `${data.phone}@society.app`,
  //         password: "123456", // Default password - user should change this
  //         email_confirm: true,
  //         user_metadata: data,
  //       });

  //       console.log(authError);
  //     });
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <ActionModalHeader
              Icon={User}
              title="Personal Information"
              desc="Let's start with your basic details"
              currentStep={1}
              totalSteps={3}
            />

            <CustomInput
              key="fullName"
              label="Full Name"
              type="text"
              {...register("fullName", {
                required: "Full name is required",
              })}
              error={errors.fullName}
              value={watch("fullName")}
            />

            <CustomInput
              key="phone"
              label="Phone Number"
              type="tel"
              {...register("phone", {
                required: "Phone number is required",
                pattern: {
                  value: /^\d{10}$/,
                  message: "Phone must be exactly 10 digits",
                },
              })}
              error={errors.phone}
              value={watch("phone")}
              maxLength={10}
            />

            <CustomSelect
              key="role"
              label="Role"
              {...register("role", { required: "Role is required" })}
              error={errors.role}
            >
              <option value="resident">Resident</option>
              <option value="admin">Admin</option>
              <option value="committee_member">Committee Member</option>
            </CustomSelect>

            <div>
              <label className="flex items-center space-x-3 cursor-pointer w-fit">
                <input
                  type="checkbox"
                  {...register("is_tenant")}
                  className="w-4 h-4 text-[#0154AC] rounded focus:ring-[#0154AC] accent-[#0154AC]"
                />
                <span className="text-sm font-medium text-gray-700 w-fit ">
                  Has Tenant
                </span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <CustomInput
                key="emergencyContactName"
                label="Emergency Contact Name"
                type="text"
                {...register("emergencyContactName")}
                error={errors.emergencyContactName}
                value={watch("emergencyContactName")}
              />
              <CustomInput
                key="emergencyContact"
                label="Emergency Contact"
                type="tel"
                {...register("emergencyContact", {
                  pattern: {
                    value: /^\d{10}$/,
                    message: "Phone must be exactly 10 digits",
                  },
                })}
                error={errors.emergencyContact}
                value={watch("emergencyContact")}
                maxLength={10}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <ActionModalHeader
              Icon={Users}
              title="Family Information"
              desc="Tell us about your family members"
              currentStep={2}
              totalSteps={3}
            />

            <CustomInput
              key="adultsCount"
              label="Adults"
              type="number"
              {...register("adultsCount", {
                required: "Adults count is required",
                min: {
                  value: 1,
                  message: "Must be at least 1",
                },
                valueAsNumber: true,
              })}
              error={errors.adultsCount}
              value={watch("adultsCount")}
            />

            <CustomInput
              key="childrenCount"
              label="Children"
              type="number"
              {...register("childrenCount", {
                min: {
                  value: 1,
                  message: "Must be at least 1",
                },
                valueAsNumber: true,
              })}
              error={errors.childrenCount}
              value={watch("childrenCount")}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <ActionModalHeader
              Icon={CreditCard}
              title="Vehicle Information"
              desc="Do you have any vehicles?"
              currentStep={3}
              totalSteps={3}
            />

            <CustomInput
              key="twoWheelerCount"
              label="Two Wheelers"
              type="number"
              {...register("twoWheelerCount", {
                min: {
                  value: 1,
                  message: "Must be at least 1",
                },
                valueAsNumber: true,
              })}
              error={errors.twoWheelerCount}
              value={watch("twoWheelerCount")}
            />

            <CustomInput
              key="fourWheelerCount"
              label="Four Wheelers"
              type="number"
              {...register("fourWheelerCount", {
                min: {
                  value: 1,
                  message: "Must be at least 1",
                },
                valueAsNumber: true,
              })}
              error={errors.fourWheelerCount}
              value={watch("fourWheelerCount")}
            />
          </div>
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      title="Onboard Resident"
      isOpen={isOpen}
      onClose={handleModalClose}
      size="lg"
    >
      {/* <button onClick={addBulkResidents}>add bulk test residents</button> */}
      <form onSubmit={handleSubmit(onFormSubmit)}>
        {/* Form Content */}
        <div className="p-6 max-h-[50vh] overflow-y-auto">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Next Step
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Complete Onboarding
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default OnboardResidentModal;
