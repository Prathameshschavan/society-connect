import {
  FileText,
  Home,
  Settings,
  Users,
  ChevronDown,
  LogOut,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { useAuthContext } from "../libs/contexts/useAuthContext"; // Adjust path as needed
import ConfirmationAlert from "./Modals/ConfirmationAlert";
import { supabase } from "../libs/supabase/supabaseClient";

const TopNav: React.FC<{ view: "admin" | "owner" }> = ({ view }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoutConfirmationOpen, setIsLogoutConfirmationOpen] =
    useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  // const { signOut, profile } = useAuthContext();

  const clearLocalStorage = (): void => {
    localStorage.removeItem("supabase_session");
    localStorage.removeItem("user_data");
    localStorage.removeItem("user_profile");
  };

  const signOut = async (): Promise<{ error: unknown }> => {
    console.log("object");
    const { error } = await supabase.auth.signOut();
    if (!error) {
      clearLocalStorage();
    }

    return { error };
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSettings = () => {
    setIsDropdownOpen(false);
    navigate("/settings");
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                SocietyTracker
              </span>
            </div>

            {view === "admin" && (
              <div className="hidden md:flex space-x-8">
                <button className="flex items-center space-x-2 text-blue-600 font-medium">
                  <Home className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                  <FileText className="w-4 h-4" />
                  <span>Reports</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* User Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="cursor-pointer flex items-center space-x-2 text-gray-600 hover:text-gray-900 focus:outline-none"
              >
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-gray-600" />
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  {/* User Info */}
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {/* {profile?.full_name || "User"} */}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {/* {profile?.role?.replace("_", " ") || "Role"} */}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <button
                    onClick={handleSettings}
                    className="cursor-pointer flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </button>

                  <button
                    onClick={() => setIsLogoutConfirmationOpen(true)}
                    className="cursor-pointer flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ConfirmationAlert
        message="Are you sure want to logout?"
        isOpen={isLogoutConfirmationOpen}
        onClose={() => setIsLogoutConfirmationOpen(false)}
        onConfirm={handleLogout}
        title="Confirmation Alert"
      />
    </nav>
  );
};

export default TopNav;
