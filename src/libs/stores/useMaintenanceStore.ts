// stores/useMaintenanceStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BillBreakdown } from "../../hooks/serviceHooks/useAdminService";
import type { ExtraItem } from "./useOrganizationStore";
import type { TBillStatus } from "../../types/maintenance.types";

export interface MaintenanceBill {
  id: string;
  organization_id: string;
  resident_id: string;
  amount: number;
  bill_month: string;
  bill_year?: string;
  due_date: string;
  status?: TBillStatus;
  razorpay_payment_id?: string | null;
  late_fee?: number;
  penalty?: number;
  created_at?: string;
  updated_at?: string;
  breakdown: BillBreakdown;
  extras: ExtraItem[];
  unit_id: string;
  unit_number: string;
  profile: {
    id: string;
    role: string;
    full_name: string;
    phone: string;
  };
}

interface MaintenanceState {
  // State
  maintenanceBills: MaintenanceBill[];
  billsCount: number;
  totalRevenue: number;
  pendingAmount: number;
  paidAmount: number;
  overdueAmount: number;

  // Actions
  setMaintenanceBills: (bills: MaintenanceBill[]) => void;
  setBillsCount: (count: number) => void;
  setTotalRevenue: (amount: number) => void;
  setPendingAmount: (amount: number) => void;
  setPaidAmount: (amount: number) => void;
  setOverdueAmount: (amount: number) => void;
  updateBillStatus: (
    billId: string,
    status: "pending" | "paid" | "overdue"
  ) => void;
  addMaintenanceBill: (bill: MaintenanceBill) => void;
  updateMaintenanceBill: (
    billId: string,
    updates: Partial<MaintenanceBill>
  ) => void;
  reset: () => void;
}

export const useMaintenanceStore = create<MaintenanceState>()(
  persist(
    (set) => ({
      // Initial state
      maintenanceBills: [],
      billsCount: 0,
      totalRevenue: 0,
      pendingAmount: 0,
      paidAmount: 0,
      overdueAmount: 0,

      // Actions
      setMaintenanceBills: (bills) => set({ maintenanceBills: bills }),
      setBillsCount: (billsCount) => set({ billsCount }),
      setTotalRevenue: (totalRevenue) => set({ totalRevenue }),
      setPendingAmount: (pendingAmount) => set({ pendingAmount }),
      setPaidAmount: (paidAmount) => set({ paidAmount }),
      setOverdueAmount: (overdueAmount) => set({ overdueAmount }),

      updateBillStatus: (billId, status) =>
        set((state) => ({
          maintenanceBills: state.maintenanceBills.map((bill) =>
            bill.id === billId ? { ...bill, status } : bill
          ),
        })),

      addMaintenanceBill: (bill) =>
        set((state) => ({
          maintenanceBills: [bill, ...state.maintenanceBills],
          billsCount: state.billsCount + 1,
        })),

      updateMaintenanceBill: (billId, updates) =>
        set((state) => ({
          maintenanceBills: state.maintenanceBills.map((bill) =>
            bill.id === billId ? { ...bill, ...updates } : bill
          ),
        })),

      reset: () =>
        set({
          maintenanceBills: [],
          billsCount: 0,
          totalRevenue: 0,
          pendingAmount: 0,
          paidAmount: 0,
          overdueAmount: 0,
        }),
    }),
    {
      name: "maintenance-storage",
      partialize: (state) => ({
        maintenanceBills: state.maintenanceBills,
        billsCount: state.billsCount,
        totalRevenue: state.totalRevenue,
        pendingAmount: state.pendingAmount,
        paidAmount: state.paidAmount,
        overdueAmount: state.overdueAmount,
      }),
    }
  )
);
