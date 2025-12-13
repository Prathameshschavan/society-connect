// stores/useMaintenanceStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ExtraItem } from "./useOrganizationStore";
import type { BillBreakdown, TBillStatus } from "../../types/maintenance.types";

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
  maintenanceBills: { bills: MaintenanceBill[]; is_bill_generated: boolean };
  billsCount: number;
  totalRevenue: number;
  pendingAmount: number;
  paidAmount: number;
  overdueAmount: number;

  // Actions
  setMaintenanceBills: ({
    bills,
    is_bill_generated,
  }: {
    bills: MaintenanceBill[];
    is_bill_generated: boolean;
  }) => void;
  setBillsCount: (count: number) => void;
  setTotalRevenue: (amount: number) => void;
  setPendingAmount: (amount: number) => void;
  setPaidAmount: (amount: number) => void;
  setOverdueAmount: (amount: number) => void;
  addMaintenanceBill: (bill: MaintenanceBill) => void;
  reset: () => void;
}

export const useMaintenanceStore = create<MaintenanceState>()(
  persist(
    (set) => ({
      // Initial state
      maintenanceBills: { bills: [], is_bill_generated: false },
      billsCount: 0,
      totalRevenue: 0,
      pendingAmount: 0,
      paidAmount: 0,
      overdueAmount: 0,

      // Actions
      setMaintenanceBills: (data) =>
        set({
          maintenanceBills: {
            bills: data.bills,
            is_bill_generated: data.is_bill_generated,
          },
        }),
      setBillsCount: (billsCount) => set({ billsCount }),
      setTotalRevenue: (totalRevenue) => set({ totalRevenue }),
      setPendingAmount: (pendingAmount) => set({ pendingAmount }),
      setPaidAmount: (paidAmount) => set({ paidAmount }),
      setOverdueAmount: (overdueAmount) => set({ overdueAmount }),

      addMaintenanceBill: (bill) =>
        set((state) => ({
          maintenanceBills: {bills:[bill, ...state.maintenanceBills.bills], is_bill_generated: state.maintenanceBills.is_bill_generated},
          billsCount: state.billsCount + 1,
        })),

      reset: () =>
        set({
          maintenanceBills: { bills: [], is_bill_generated: false },
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
