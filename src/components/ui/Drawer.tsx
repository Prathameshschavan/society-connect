import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Settings,
  BadgeIndianRupee,
  ArrowDownWideNarrow,
  LayoutDashboard,
  Users,
} from "lucide-react";
import { useProfileStore } from "../../libs/stores/useProfileStore";
import { siteSetting } from "../../config/siteSetting";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
};

const linkBase = "flex items-center gap-3 px-4 py-2 rounded-md text-sm";
const active = "bg-blue-50 text-blue-700";
const inactive = "text-gray-700 hover:bg-gray-50";

export default function Drawer({ open, onClose, title = "Menu" }: DrawerProps) {
  const { profile } = useProfileStore();
  const panelRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);
  const lastFocusRef = useRef<HTMLButtonElement>(null);

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
  // Focus trap and ESC close
  useEffect(() => {
    if (open) {
      const prev = document.activeElement as HTMLElement | null;
      firstFocusRef.current?.focus();

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
        if (e.key === "Tab") {
          const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
            'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (!focusable || focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            (last as HTMLElement).focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            (first as HTMLElement).focus();
          }
        }
      };
      document.addEventListener("keydown", onKeyDown);
      return () => {
        document.removeEventListener("keydown", onKeyDown);
        prev?.focus();
      };
    }
  }, [open, onClose]);

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-50 md:hidden ${
        open ? "" : "pointer-events-none"
      }`}
    >
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={panelRef}
        className={`fixed top-0 left-0 h-full w-80 max-w-[85%] bg-white shadow-xl transform transition-transform duration-200
        ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center gap-2 px-4 pt-4 pb-2">
          <img
            className="h-8 w-8"
            src={siteSetting?.logo}
            alt={siteSetting.logoAlt}
          />
          <h1 className="text-xl font-semibold text-[#0154AC] -mb-0.5 ">
            {siteSetting.siteName}
          </h1>
        </div>

        <nav className="p-2">
          {adminLinks.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={label}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? active : inactive}`
              }
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Last focus sentinel */}
        <button
          ref={lastFocusRef}
          className="sr-only"
          aria-hidden="true"
          onFocus={() => firstFocusRef.current?.focus()}
        />
      </div>
    </div>
  );
}
