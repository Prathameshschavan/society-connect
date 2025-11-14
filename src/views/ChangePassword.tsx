import React, { useState } from "react";
import { Building, Lock, LogOut } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import CustomInput from "../components/ui/CustomInput";
import toast from "react-hot-toast";
import useAuthService from "../hooks/serviceHooks/useAuthService";
import ConfirmationAlert from "../components/Modals/ConfirmationAlert";
import { supabase } from "../libs/supabase/supabaseClient";
import { useProfileStore } from "../libs/stores/useProfileStore";

type TChangePassword = {
  newPassword: string;
  confirmPassword: string;
};

const ChangePassword: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLogoutConfirmationOpen, setIsLogoutConfirmationOpen] = useState(false);
  const { updatePassword } = useAuthService();
  const { reset: resetProfile } = useProfileStore();
  const navigate = useNavigate();

  const {
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm<TChangePassword>();

  const newPassword = watch("newPassword");

  const onSubmit = async (data: TChangePassword) => {
    setIsLoading(true);

    try {
      await updatePassword(data.newPassword);
    } catch (error: unknown) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      resetProfile();
      navigate("/sign-in");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 pt-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="text-center -mt-[60px] mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-2">
              <Building className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              MaintainEase
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your society maintenance effortlessly
            </p>
          </div>

          {/* Password Change Notice */}
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <Lock className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-yellow-800 mb-1">
                  Password Change Required
                </h3>
                <p className="text-xs text-yellow-700">
                  For security reasons, you must change your password before accessing the application.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <CustomInput
                label="New Password"
                placeholder="Enter new password"
                isPassword
                error={errors.newPassword}
                {...register("newPassword", {
                  required: "New password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters long",
                  },
                })}
              />

              <CustomInput
                label="Confirm Password"
                placeholder="Confirm new password"
                isPassword
                error={errors.confirmPassword}
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === newPassword || "Passwords do not match",
                })}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating Password...
                  </>
                ) : (
                  "Change Password"
                )}
              </button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Your password must be at least 6 characters long.
            </p>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => setIsLogoutConfirmationOpen(true)}
              className="w-full flex items-center justify-center space-x-2 text-red-600 hover:text-red-700 py-2 px-4 rounded-lg hover:bg-red-50 transition-colors font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <ConfirmationAlert
        message="Are you sure you want to logout?"
        isOpen={isLogoutConfirmationOpen}
        onClose={() => setIsLogoutConfirmationOpen(false)}
        onConfirm={handleLogout}
        title="Logout Confirmation"
      />
    </div>
  );
};

export default ChangePassword;
