import {
  LayoutDashboard,
  BadgeIndianRupee,
  ArrowDownWideNarrow,
  Home,
  Users,
  Settings,
  ReceiptText,
} from "lucide-react";
import type { IProfile } from "../types/user.types";

export const getMenus = (profile: IProfile | null) => {
  return [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/maintenance", label: "Maintenance", icon: ReceiptText, end: true },
    { to: "/income", label: "Income", icon: BadgeIndianRupee },
    { to: "/expenses", label: "Expenses", icon: ArrowDownWideNarrow },
    { to: "/units", label: "Units", icon: Home },
    { to: "/residents", label: "Residents", icon: Users },
    ...(profile?.role === "admin" && profile?.organization
      ? [
          {
            to: `/configure-settings/${profile?.organization?.id ?? ""}`,
            label: "Settings",
            icon: Settings,
          },
        ]
      : []),
  ];
};
