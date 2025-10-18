import { useEffect, useState } from "react";
import { GenericSelect } from "./ui/GenericSelect";
import { currMonth, currYear, shortMonth } from "../utility/dateTimeServices";
import TopNav from "./TopNav";
import usePaginationService from "../hooks/serviceHooks/usePaginationService";
import { useOrganizationStore } from "../libs/stores/useOrganizationStore";
import GenericTable, { type TableAction } from "./ui/GenericTable";
import { ArrowDownWideNarrow, Edit, Eye, Trash2 } from "lucide-react";
import { useReportStore, type Expense } from "../libs/stores/useReportStore";
import { AddExpenseModal } from "./Modals/AddExpenseModal";
import { columns } from "../config/tableConfig/expense";
import useExpenseService from "../hooks/serviceHooks/useExpenseService";
import { ViewExpenseModal } from "./Modals/ViewExpenseModal";
import { EditExpenseModal } from "./Modals/EditExpenseModal";
import ConfirmationAlert from "./Modals/ConfirmationAlert";

const Expenses = () => {
  const [selectedMonth, setSelectedMonth] = useState({
    month: currMonth,
    year: currYear,
  });
  const { residentOrganization } = useOrganizationStore();
  const {
    setCurrentPage,
    pagination,
    handlePageChange,
    handlePageSizeChange,
    currentPage,
    pageSize,
    setPagination,
  } = usePaginationService();
  const { expenses } = useReportStore();
  const { fetchExpenses, deleteExpense } = useExpenseService();

  const [loading, setLoading] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isOpenViewExpenseModal, setIsOpenViewExpenseModal] =
    useState<boolean>(false);
  const [isOpenUpdateExpenseModal, setIsOpenUpdateExpenseModal] =
    useState<boolean>(false);
  const [isOpenDeleteExpenseModal, setIsOpenDeleteExpenseModal] =
    useState<boolean>(false);


  const actions: TableAction<Expense>[] = [
    {
      icon: <Eye className="w-4 h-4" />,
      onClick: (expense: Expense) => {
        setSelectedExpense(expense);
        setIsOpenViewExpenseModal(true);
      },
      className:
        "cursor-pointer p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors",
      label: "View",
    },

    {
      icon: <Edit className="w-4 h-4" />,
      onClick: (expense: Expense) => {
        setSelectedExpense(expense);
        setIsOpenUpdateExpenseModal(true);
      },
      className:
        "cursor-pointer p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors",
      label: "Edit",
    },
    {
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (expense: Expense) => {
        setSelectedExpense(expense);
        setIsOpenDeleteExpenseModal(true);
      },
      className:
        "cursor-pointer p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors",
      label: "Edit",
    },
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await fetchExpenses({
        page: currentPage,
        pageSize,
        filters: {
          month: selectedMonth.month,
          year: selectedMonth?.year,
        },
        orgId: residentOrganization?.id as string,
      }); // Server-side pagination pattern [web:6]

      if (result) {
        setPagination(result.pagination); // Keep table pagination in sync [web:6]
      }

    } catch (error) {
      // Prefer user feedback in production; console for developer diagnostics
      console.error("Error loading data:", error); // Debug-only logging [web:11]
    } finally {
      setLoading(false);
    }
  };

  /**
   * Effect: Fetch whenever pagination or filters change.
   * Dependency array keeps data in sync with UI controls. [web:6]
   */
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, selectedMonth]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navigation fixed to admin view-context [web:11] */}
      <TopNav view="admin" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header: Organization context and purpose subtitle [web:11] */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <h1 className="text-2xl poppins-medium ">
                {residentOrganization?.name}
              </h1>
              <p className="text-gray-600 text-sm font-light">
                View and track your society maintenance details
              </p>
            </div>

            {/* Filters: Month and Year selectors; changing resets to page 1 [web:6] */}
            <div className="flex gap-4 self-center w-full sm:w-fit">
              <GenericSelect
                id="months"
                onChange={(value) => {
                  setCurrentPage(1);
                  setSelectedMonth((prev) => ({
                    ...prev,
                    month: value,
                  }));
                }}
                options={shortMonth.map((month, i) => ({
                  label: month,
                  value: (i + 1).toString().padStart(2, "0"),
                }))}
                value={selectedMonth.month}
                label="Month"
              />

              <GenericSelect
                id="years"
                onChange={(value) => {
                  setCurrentPage(1);
                  setSelectedMonth((prev) => ({
                    ...prev,
                    year: value,
                  }));
                }}
                options={Array.from(
                  { length: new Date().getFullYear() - 2000 + 1 },
                  (_, index) => {
                    const year = new Date().getFullYear() - index;
                    return { label: year, value: `${year}` };
                  }
                )}
                value={selectedMonth.year}
                label="Year"
              />
            </div>
          </div>

          <button
            onClick={() => setIsAddExpenseModalOpen(true)}
            className="w-full sm:w-fit flex items-center whitespace-nowrap justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-70"
          >
            <ArrowDownWideNarrow className="w-5 h-5" />
            Add Expense
          </button>
          <GenericTable
            title="Expenses"
            columns={columns}
            data={expenses}
            actions={actions}
            loading={loading}
            emptyMessage="No expenses this month"
            searchPlaceholder="Search resident"
            showPagination
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[5, 10, 20, 50]}
            onSearch={() => {
              /* Hook into this to wire server-side search; keep debounced input upstream [web:6] */
            }}
          />
        </div>
      </main>
      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
      />
      <ViewExpenseModal
        isOpen={isOpenViewExpenseModal}
        onClose={() => setIsOpenViewExpenseModal(false)}
        expense={selectedExpense}
      />
      <EditExpenseModal
        isOpen={isOpenUpdateExpenseModal}
        onClose={() => setIsOpenUpdateExpenseModal(false)}
        expense={selectedExpense}
      />

      <ConfirmationAlert
        isOpen={isOpenDeleteExpenseModal}
        onClose={() => setIsOpenDeleteExpenseModal(false)}
        message="Are you sure want to delete this expense?"
        onConfirm={async () => {
          await deleteExpense(selectedExpense?.id as string);
          await loadData();
          setIsOpenDeleteExpenseModal(false);
        }}
      />
    </div>
  );
};

export default Expenses;
