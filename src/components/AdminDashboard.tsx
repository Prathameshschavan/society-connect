/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Edit, Eye, ReceiptText } from "lucide-react";
import TopNav from "./TopNav";
import OnboardResidentModal from "./Modals/OnboardResidentModal";
import { useEffect, useState } from "react";
import useAdminService from "../hooks/serviceHooks/useAdminService";
import { useOrganizationStore } from "../libs/stores/useOrganizationStore";
import GenericTable, {
  type PaginationInfo,
  type TableAction,
  type TableColumn,
} from "./ui/GenericTable";
import useCommonService from "../hooks/serviceHooks/useCommonService";
import {
  useMaintenanceStore,
  type MaintenanceBill,
} from "../libs/stores/useMaintenanceStore";
import ViewMaintananceDetailsModal from "./Modals/ViewMaintananceDetailsModal";
import UpdateMaintananceStatusModal from "./Modals/UpdateMaintananceStatusModal";
const AdminDashboard = () => {
  const { createBillsWithPenaltyForAllResidents, fetchMaintenanceBills } =
    useAdminService();
  const { maintenanceBills } = useMaintenanceStore();
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const { residentOrganization } = useOrganizationStore();
  const { shortMonth, getStatusIcon, getStatusColor } = useCommonService();
  const [selectedMonth, setSelectedMonth] = useState({
    month: `${(new Date().getMonth() + 1).toString().padStart(2, "0")}`,
    year: `${new Date().getFullYear()}`,
  });

  const [loading, setLoading] = useState(false);
  const [generateBillLoading, setGenerateBillLoading] = useState(false);
  const [isOpenMaintananceDetailsModal, setIsOpenMaintananceDetailsModal] =
    useState(false);
  const [
    isOpenUpdateMaintananceDetailsModal,
    setIsOpenUpdateMaintananceDetailsModal,
  ] = useState(false);
  const [selectedBill, setSelectedBill] = useState<MaintenanceBill | null>(
    null
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Load data with pagination
  const loadData = async () => {
    setLoading(true);
    try {
      const result = await fetchMaintenanceBills({
        page: currentPage,
        pageSize: pageSize,
        filters: {
          billMonth: selectedMonth?.month,
          billYear: selectedMonth?.year,
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
  };

  useEffect(() => {
    loadData();
  }, [currentPage, pageSize, selectedMonth]);

  const handleCreateBill = async () => {
    try {
      setGenerateBillLoading(true);
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = 15;

      const res = await createBillsWithPenaltyForAllResidents({
        billMonth: `${month}`,
        billYear: `${year}`,
        dueDate: `${year}-${month}-${day}`,
        maintenanceFixedAmount:
          residentOrganization?.maintenance_amount as number,
        penaltyFixedAmount: 100,
        extraCharges: 0,
      });

      console.log(res);
    } catch (error) {
      console.log(error);
    } finally {
      setGenerateBillLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  // function debounce<T extends (...args: any[]) => void>(
  //   func: T,
  //   wait: number
  // ): (...args: Parameters<T>) => void {
  //   let timeout: NodeJS.Timeout;
  //   return (...args: Parameters<T>) => {
  //     clearTimeout(timeout);
  //     timeout = setTimeout(() => func(...args), wait);
  //   };
  // }

  const columns: TableColumn<MaintenanceBill>[] = [
    {
      key: "resident",
      header: "Resident",
      render: (bill) => (
        <div>
          <p className="font-medium text-gray-900">
            {bill.resident?.unit_number || "N/A"}
          </p>
          <p className="font-light text-gray-900">{bill.resident?.full_name}</p>
        </div>
      ),
      className: "text-gray-900 font-medium",
    },

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
    // {
    //   key: "penalty",
    //   header: "Penalty",
    //   render: (bill) => (
    //     <div>
    //       <div className=" text-gray-900">₹ {bill?.amount}</div>
    //     </div>
    //   ),
    // },
    // {
    //   key: "totalAmount",
    //   header: (
    //     <p>
    //       Total <br /> Amount
    //     </p>
    //   ),
    //   render: (bill) => (
    //     <div>
    //       <div className=" text-gray-900">₹ {bill?.amount}</div>
    //     </div>
    //   ),
    // },
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
    ...(selectedMonth?.month ===
      `${(new Date().getMonth() + 1).toString().padStart(2, "0")}` &&
    selectedMonth?.year === `${new Date().getFullYear()}`
      ? [
          {
            icon: <Edit className="w-4 h-4" />,
            onClick: (bill: MaintenanceBill) => {
              setSelectedBill(bill);
              setIsOpenUpdateMaintananceDetailsModal(true);
            },
            className:
              "cursor-pointer p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors",
            label: "Edit",
          },
        ]
      : []),
  ];
  // async function markAllMaintenancePaid() {
  //   const payload = {
  //     status: "paid",
  //   };

  //   const { data, error } = await supabase
  //     .from("maintenance_bills")
  //     .update(payload) // applies to all rows without filters
  //     .eq("bill_month", "0")
  //     .select("id, status"); // return affected ids and status

  //   if (error) throw error;
  //   return data;
  // }
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav view="admin" />
      {/* <button onClick={markAllMaintenancePaid}>all paid</button> */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Stats Cards */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">
                    Total Amount Due
                  </p>
                  <p className="text-3xl font-bold">
                    ₹{adminData.totalDue.toLocaleString()}
                  </p>
                </div>
                <CreditCard className="w-8 h-8 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">
                    Total Paid This Month
                  </p>
                  <p className="text-3xl font-bold">
                    ₹{adminData.totalPaid.toLocaleString()}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-200" />
              </div>
            </div>
          </div> */}

          <div className="flex justify-between gap-4">
            <div className="">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {residentOrganization?.name} Dashboard
              </h1>
              <p className="text-gray-600">
                Manage your society maintenance payments
              </p>
            </div>

            <div className="flex gap-4 self-center">
              <select
                onChange={(e) => {
                  setCurrentPage(1);
                  setSelectedMonth({ ...selectedMonth, month: e.target.value });
                }}
                value={selectedMonth?.month}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${"border-gray-300"}`}
              >
                {shortMonth.map((month, i) => {
                  return (
                    <option
                      key={month}
                      value={(i + 1).toString().padStart(2, "0")}
                    >
                      {month}
                    </option>
                  );
                })}
              </select>
              <select
                value={selectedMonth?.year}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${"border-gray-300"}`}
                onChange={(e) => {
                  setCurrentPage(1);
                  setSelectedMonth({ ...selectedMonth, year: e.target.value });
                }}
              >
                {Array.from(
                  { length: new Date().getFullYear() - 2000 + 1 },
                  (_, index) => {
                    const year = new Date().getFullYear() - index;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  }
                )}
              </select>
            </div>
          </div>
          <button
            disabled={generateBillLoading}
            onClick={handleCreateBill}
            className="flex items-center whitespace-nowrap justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <ReceiptText className="w-5 h-5" />
            {generateBillLoading ? "Generating..." : "Generate Bill"}
          </button>

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
            onSearch={() => {}}
          />
        </div>
      </main>
      <OnboardResidentModal
        isOpen={isOnboardModalOpen}
        onClose={() => setIsOnboardModalOpen(false)}
      />
      <ViewMaintananceDetailsModal
        bill={selectedBill}
        isOpen={isOpenMaintananceDetailsModal}
        onClose={() => setIsOpenMaintananceDetailsModal(false)}
      />
      <UpdateMaintananceStatusModal
        bill={selectedBill}
        isOpen={isOpenUpdateMaintananceDetailsModal}
        onClose={() => setIsOpenUpdateMaintananceDetailsModal(false)}
        onSuccess={loadData}
      />
    </div>
  );
};

export default AdminDashboard;
