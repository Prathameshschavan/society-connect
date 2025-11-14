// components/SignIn.tsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import type { TSignIn } from "../types/user.types";
import CustomInput from "../components/ui/CustomInput";
import { siteSetting } from "../config/siteSetting";
import useAuthApiService from "../hooks/apiHooks/useAuthApiService";

const SignIn: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { handleSignIn } = useAuthApiService();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<TSignIn>();

  const onSubmit = async ({ email, password }: TSignIn) => {
    setIsLoading(true);
    await handleSignIn({ email: `${email}@society.app`, password });
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom_right,#0154AC_10%,#0365BA_20%,#0487D7_40%,#22C36E_75%,#22C36E_85%,#22C36E_100%)] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="text-center mb-4 flex flex-col items-center justify-center">
            <div className="flex items-center gap-2">
              <img
                className="h-8 w-8"
                src={siteSetting?.logo}
                alt={siteSetting.logoAlt}
              />
              <h1 className="text-xl font-semibold text-gray-900 ">
                {siteSetting.siteName}
              </h1>
            </div>
            {/* <p className="text-gray-600 mt-1 text-base">
              {siteSetting.siteDescription}
            </p> */}
          </div>

          {/* Signin Form */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Welcome Back
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Sign in to your account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <CustomInput
                label="Phone Number"
                placeholder="xxxxxxxxxx"
                error={errors.email}
                {...register("email", {
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
