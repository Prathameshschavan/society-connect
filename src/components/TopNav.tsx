import {
  Home,
  Settings,
  Users,
  LogOut,
  Menu,
  ArrowDownWideNarrow,
  BadgeIndianRupee,
  LayoutDashboard,
  User,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import ConfirmationAlert from "./Modals/ConfirmationAlert";
import { useProfileStore } from "../libs/stores/useProfileStore";
import Drawer from "./ui/Drawer";
import { siteSetting } from "../config/siteSetting";
import type { TRole } from "../types/user.types";
import useAuthApiService from "../hooks/apiHooks/useAuthApiService";

const linkBase = "flex items-center space-x-1 text-sm transition-colors";
const active = "text-[#0154AC] font-medium";
const inactive = "text-black font-light hover:text-[#0154AC]";

const TopNav: React.FC<{ view: TRole }> = ({ view }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [isLogoutConfirmationOpen, setIsLogoutConfirmationOpen] =
    useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { profile } = useProfileStore();
  const { handleLogout } = useAuthApiService();

  // derive menu from array
  const adminLinks = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/income", label: "Income", icon: BadgeIndianRupee },
    { to: "/expenses", label: "Expenses", icon: ArrowDownWideNarrow },
    { to: "/units", label: "Units", icon: Home },
    { to: "/residents", label: "Residents", icon: Users },
    // { to: "/reports", label: "Reports", icon: FileChartColumn },
    ...(profile?.role === "admin"
      ? [
          {
            to: `/configure-settings/${profile?.organization?.id ?? ""}`,
            label: "Settings",
            icon: Settings,
          },
        ]
      : []),
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      )
        setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className={`border-b border-gray-200 sticky top-0 z-40 bg-[white]`}>
      <div className="max-w-7xl mx-auto py-4 md:py-2 px-4 sm:px-6 lg:px-8 flex flex-col gap-1 ">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {view === "admin" && (
              <Menu
                onClick={() => setOpen(!open)}
                className="cursor-pointer md:hidden text-black"
              />
            )}
            {/* <img src="/logo.png" className="h-8 w-8 min-h-8 min-w-8 max-h-8 max-w-8" alt="logo" /> */}
            <div className="flex items-center gap-2">
              <img
                className="h-8 w-8"
                src={siteSetting?.logo}
                alt={siteSetting.logoAlt}
              />
              <h1 className="text-xl font-semibold text-[#0154AC] -mb-0.5 ">
                {siteSetting.siteName}
              </h1>
            </div>
            <Drawer
              open={open}
              onClose={() => setOpen(false)}
              title="MaintainEase"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center">
              {view === "admin" && (
                <div className="hidden md:flex space-x-6">
                  {adminLinks.map(({ to, label, icon: Icon, end }) => (
                    <NavLink
                      key={label}
                      to={to}
                      end={end}
                      className={({ isActive }) =>
                        `${linkBase} ${isActive ? active : inactive}`
                      }
                    >
                      <Icon className="w-4 h-4 " />
                      <span>{label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center text-sm font-extralight space-x-4">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen((s) => !s)}
                  className="cursor-pointer flex items-center space-x-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                >
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-black" />
                  </div>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {profile?.full_name || "User"}
                      </p>
                      <p className="text-xs font-light text-gray-500 capitalize">
                        {profile?.role?.replace("_", " ") || "Role"}
                      </p>
                    </div>

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
