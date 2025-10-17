import { useEffect, useState } from "react";
import { GenericSelect } from "./ui/GenericSelect";
import { currMonth, currYear, shortMonth } from "../utility/dateTimeServices";
import TopNav from "./TopNav";
import usePaginationService from "../hooks/serviceHooks/usePaginationService";
import { useOrganizationStore } from "../libs/stores/useOrganizationStore";
import GenericTable, { type TableAction } from "./ui/GenericTable";
import { BadgeIndianRupee, Edit, Eye, Trash2 } from "lucide-react";
import { AddIncomeModal } from "./Modals/AddIncomeModal";
import useIncomeService, {
  type IncomeRow,
} from "../hooks/serviceHooks/useIncomeService";
import { useReportStore } from "../libs/stores/useReportStore";
import { columns } from "../config/tableConfig/income";
import ViewIncomeModal from "./Modals/ViewIncomeModal";
import { UpdateIncomeModal } from "./Modals/UpdateIncomeModal";
import ConfirmationAlert from "./Modals/ConfirmationAlert";

const Income = () => {
  const [selectedMonth, setSelectedMonth] = useState({
    month: currMonth,
    year: currYear,
  });
  const { residentOrganization } = useOrganizationStore();
  const { incomes } = useReportStore();
  const {
    setCurrentPage,
    handlePageChange,
    handlePageSizeChange,
    pagination,
    currentPage,
    pageSize,
    setPagination,
  } = usePaginationService();
  const [isAddIncomeModalOpen, setIsAddIncomeModalOpen] = useState(false);
  const { fetchIncomes, deleteIncome } = useIncomeService();
  const [loading, setLoading] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<IncomeRow | null>(null);
  const [isOpenViewIncomeModal, setIsOpenViewIncomeModal] =
    useState<boolean>(false);
  const [isOpenUpdateIncomeModal, setIsOpenUpdateIncomeModal] =
    useState<boolean>(false);
  const [isOpenDeleteIncomeModal, setIsOpenDeleteIncomeModal] =
    useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await fetchIncomes({
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

      console.log(result);
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

  const actions: TableAction<IncomeRow>[] = [
    {
      icon: <Eye className="w-4 h-4" />,
      onClick: (income: IncomeRow) => {
        setSelectedIncome(income);
        setIsOpenViewIncomeModal(true);
      },
      className:
        "cursor-pointer p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors",
      label: "View",
    },

    {
      icon: <Edit className="w-4 h-4" />,
      onClick: (income: IncomeRow) => {
        setSelectedIncome(income);
        setIsOpenUpdateIncomeModal(true);
      },
      className:
        "cursor-pointer p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors",
      label: "Edit",
    },
    {
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (income: IncomeRow) => {
        setSelectedIncome(income);
        setIsOpenDeleteIncomeModal(true);
      },
      className:
        "cursor-pointer p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors",
      label: "Edit",
    },
  ];

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
            onClick={() => setIsAddIncomeModalOpen(true)}
            className="w-full sm:w-fit flex items-center whitespace-nowrap justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-70"
          >
            <BadgeIndianRupee className="w-5 h-5" />
            Add Income
          </button>
          <GenericTable
            title="Income"
            columns={columns}
            data={incomes}
            actions={actions}
            loading={loading}
            emptyMessage="No income this month"
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
      <AddIncomeModal
        isOpen={isAddIncomeModalOpen}
        onClose={() => setIsAddIncomeModalOpen(false)}
      />
      <ViewIncomeModal
        income={selectedIncome as IncomeRow}
        isOpen={isOpenViewIncomeModal}
        onClose={() => setIsOpenViewIncomeModal(false)}
      />
      <UpdateIncomeModal
        income={selectedIncome as IncomeRow}
        isOpen={isOpenUpdateIncomeModal}
        onClose={() => setIsOpenUpdateIncomeModal(false)}
      />
      <ConfirmationAlert
        isOpen={isOpenDeleteIncomeModal}
        onClose={() => setIsOpenDeleteIncomeModal(false)}
        message="Are you sure want to delete this income?"
        onConfirm={async () => {
          await deleteIncome(selectedIncome?.id as string);
          await loadData();
          setIsOpenDeleteIncomeModal(false);
        }}
      />
    </div>
  );
};

export default Income;
