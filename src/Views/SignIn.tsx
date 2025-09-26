// components/SignIn.tsx
import React, { useState } from "react";
import { Building } from "lucide-react";
import { useForm } from "react-hook-form";
import type { TSignIn } from "../types/user.types";
import CustomInput from "../components/ui/CustomInput";
import toast from "react-hot-toast";
import useAuthService from "../hooks/serviceHooks/useAuthService";

const SignIn: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuthService();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<TSignIn>();

  const onSubmit = async (data: TSignIn) => {
    setIsLoading(true);

    try {
      await signIn(data);
    } catch (error: unknown) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="text-center -mt-[60px] mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-2">
              <Building className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              Society Connect
            </h1>
            <p className="text-gray-600  mt-1">
              Manage your society maintenance effortlessly
            </p>
          </div>

          {/* Signin Form */}
          {/* <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Welcome Back
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Sign in to your account
            </p>
          </div> */}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <CustomInput
                label="Phone Number"
                placeholder="xxxxxxxxxx"
                error={errors.phone}
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Please enter a valid 10-digit phone number",
                  },
                })}
              />

              <CustomInput
                label="Password"
                placeholder="Enter your password"
                isPassword
                error={errors.password}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters long",
                  },
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
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>

          {/* <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Sign up here
              </button>
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default SignIn;
