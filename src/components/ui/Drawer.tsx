import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { X, Home, Settings, BadgeIndianRupee, ArrowDownWideNarrow, FileChartColumn } from "lucide-react";
import { useOrganizationStore } from "../../libs/stores/useOrganizationStore";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
};

const linkBase = "flex items-center gap-3 px-4 py-2 rounded-md text-sm";
const active = "bg-blue-50 text-blue-700";
const inactive = "text-gray-700 hover:bg-gray-50";

export default function Drawer({ open, onClose, title = "Menu" }: DrawerProps) {
  const { residentOrganization } = useOrganizationStore();
  const panelRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);
  const lastFocusRef = useRef<HTMLButtonElement>(null);

    const links = [
    { to: "/admin", label: "Dashboard", icon: Home, end: true },
    { to: "/income", label: "Income", icon: BadgeIndianRupee },
    { to: "/expenses", label: "Expenses", icon: ArrowDownWideNarrow },
    { to: "/reports", label: "Reports", icon: FileChartColumn },
    {
      to: `/configure-settings/${residentOrganization?.id ?? ""}`,
      label: "Settings",
      icon: Settings,
    },
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
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="text-base font-semibold">{title}</span>
          <button
            ref={firstFocusRef}
            onClick={onClose}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close menu</span>
          </button>
        </div>

        <nav className="p-2">
          {links.map(({ to, label, icon: Icon, end }) => (
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
