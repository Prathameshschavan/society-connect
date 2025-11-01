import { useCallback, useEffect, useState } from "react";
import useCommonService from "../hooks/serviceHooks/useCommonService";
import PaymentModal from "./Modals/PaymentModal";
import TopNav from "./TopNav";
import { useProfileStore } from "../libs/stores/useProfileStore";
import type {
  PaginationInfo,
  TableAction,
  TableColumn,
} from "./ui/GenericTable";
import { useMaintenanceStore, type MaintenanceBill } from "../libs/stores/useMaintenanceStore";
import { Eye } from "lucide-react";
import GenericTable from "./ui/GenericTable";
import useResidentService from "../hooks/serviceHooks/useResidentService";
import { useResidentStore } from "../libs/stores/useResidentStore";
import ViewMaintananceDetailsModal from "./Modals/ViewMaintananceDetailsModal";
import usePaginationService from "../hooks/serviceHooks/usePaginationService";
import useAdminService from "../hooks/serviceHooks/useAdminService";

const RoomOwnerDashboard = () => {
  const { getStatusIcon, getStatusColor, longMonth, shortMonth } =
    useCommonService();
  const { profile } = useProfileStore();
  const { maintenanceBills } = useMaintenanceStore();
  const { fetchMaintenanceBills } =
    useAdminService();

  const [loading, setLoading] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<MaintenanceBill | null>(
    null
  );
  const [isOpenMaintananceDetailsModal, setIsOpenMaintananceDetailsModal] =
    useState(false);

  // Pagination state

  const { pagination, setPagination, handlePageChange, handlePageSizeChange, currentPage, pageSize } = usePaginationService();


  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchMaintenanceBills({
        page: currentPage,
        pageSize: pageSize,
        filters: {
          unitNumber: profile?.unit_number,
        },
      });

      if (result) {
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    pageSize,
    setPagination,
  ]);


  useEffect(() => {
    loadData();
  }, [currentPage, pageSize,]);

  const columns: TableColumn<MaintenanceBill>[] = [
    {
      key: "monthYear",
      header: "Month/Year",
      render: (bill) => (
        <div>
          <div className=" text-gray-900">
            {shortMonth[Number(bill.bill_month) - 1]} {bill?.bill_year}
          </div>
        </div>
      ),
    },
    {
      key: "currentAmount",
      header: <p>Maintenance Amount</p>,
      render: (bill) => (
        <div>
          <div className=" text-gray-900">₹ {bill?.amount}</div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (bill) => (
        <div>
          <span
            className={`capitalize inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
              bill.status as string
            )}`}
          >
            {getStatusIcon(bill.status as string)}
            {bill.status}
          </span>
        </div>
      ),
    },
  ];

  const actions: TableAction<MaintenanceBill>[] = [
    {
      icon: <Eye className="w-4 h-4" />,
      onClick: (bill: MaintenanceBill) => {
        setSelectedBill(bill);
        setIsOpenMaintananceDetailsModal(true);
      },
      className:
        "cursor-pointer p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors",
      label: "View",
    },
  ];
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav view="owner" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Payment Ledger
                </h1>
                <p className="text-gray-600 mt-1">
                  {profile?.full_name} • Room {profile?.unit_number}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Current Month</p>
                <p className="text-lg font-semibold text-gray-900">
                  {longMonth[new Date().getMonth()]} {new Date().getFullYear()}
                </p>
              </div>
            </div>
          </div>

          {/* Current Pending Amount */}
          {/* <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <h2 className="text-xl font-semibold text-red-900">
                  Current Pending Amount
                </h2>
              </div>
              <span className="text-sm text-red-600 font-medium">
                Overdue since Aug 5, 2025
              </span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div>
                <p className="text-3xl font-bold text-red-900">₹5,500</p>
                <p className="text-red-700 text-sm mt-1">
                  ₹5,000 + ₹500 penalty
                </p>
              </div>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-lg"
              >
                Pay Now
              </button>
            </div>
          </div> */}

          {/* Payment History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <GenericTable
              title="Maintenance"
              columns={columns}
              data={maintenanceBills}
              actions={actions}
              loading={loading}
              emptyMessage="No maintenence bill is generated this month"
              searchPlaceholder="Search resident"
              showPagination
              pagination={pagination}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[5, 10, 20, 50]}
              onSearch={() => { }}
            />
          </div>
          {showPaymentModal && <PaymentModal setOpen={setShowPaymentModal} />}
        </div>
      </main>
      <ViewMaintananceDetailsModal
        bill={selectedBill}
        residentInfo={false}
        isOpen={isOpenMaintananceDetailsModal}
        onClose={() => setIsOpenMaintananceDetailsModal(false)}
      />
    </div>
  );
};

export default RoomOwnerDashboard;
