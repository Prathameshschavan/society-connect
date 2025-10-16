import { useState } from "react";
import { GenericSelect } from "./ui/GenericSelect";
import { currMonth, currYear, shortMonth } from "../utility/dateTimeServices";
import TopNav from "./TopNav";
import usePaginationService from "../hooks/serviceHooks/usePaginationService";
import { useOrganizationStore } from "../libs/stores/useOrganizationStore";
import GenericTable from "./ui/GenericTable";

const Expenses = () => {
  const [selectedMonth, setSelectedMonth] = useState({
    month: currMonth,
    year: currYear,
  });
  const { residentOrganization } = useOrganizationStore();
  const { setCurrentPage, pagination, handlePageChange, handlePageSizeChange } =
    usePaginationService();

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
          <GenericTable
            title="Expenses"
            columns={[]}
            data={[]}
            actions={[]}
            loading={false}
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
    </div>
  );
};

export default Expenses;
