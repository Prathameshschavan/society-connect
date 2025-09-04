/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ---- Types ----
export interface TableColumn<T> {
  key: keyof T | string;
  header: string | ReactNode;
  render?: (item: T) => React.ReactNode;
  className?: string;
  mobileLabel?: string; // optional override for card labels
}

export interface TableAction<T> {
  icon: React.ReactNode;
  onClick: (item: T) => void;
  className?: string;
  label?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface GenericTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  loading?: boolean;
  title?: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  showSearch?: boolean;
  showFilter?: boolean;
  onFilter?: () => void;
  emptyMessage?: string;

  // Pagination
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  showPagination?: boolean;

  // Responsive behavior
  stickyHeader?: boolean; // keeps header visible while vertical scrolling in the container
  // Below this breakpoint, show mobile cards; at/above, show desktop table
  mobileCardBreakpoint?: "sm" | "md" | "lg" | "xl" | "2xl";
  // Which columns to show per viewport
  desktopVisibleKeys?: Array<TableColumn<T>["key"]>;
  mobileVisibleKeys?: Array<TableColumn<T>["key"]>;
}

// ---- Utilities ----
// Minimal media query hook
function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState<boolean>(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    if (mql.addEventListener) mql.addEventListener("change", onChange);
    else mql.addListener(onChange);
    setMatches(mql.matches);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", onChange);
      else mql.removeListener(onChange);
    };
  }, [query]);
  return matches;
}

// ---- Skeleton ----
const TableSkeleton: React.FC<{ columns: number; rows?: number }> = ({
  columns,
  rows = 5,
}) => (
  <tbody>
    {[...Array(rows)].map((_, rowIndex) => (
      <tr key={rowIndex} className="hover:bg-gray-50">
        {[...Array(columns)].map((_, colIndex) => (
          <td key={colIndex} className="py-4 px-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              {colIndex === 0 && (
                <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
              )}
            </div>
          </td>
        ))}
      </tr>
    ))}
  </tbody>
);

// ---- Pagination ----
const TablePagination: React.FC<{
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
}> = ({
  pagination,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
}) => {
  const {
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    hasNextPage,
    hasPrevPage,
  } = pagination;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      for (let i = 1; i <= 5; i++) pages.push(i);
    } else if (currentPage >= totalPages - 2) {
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700">
          Showing {(currentPage - 1) * pageSize + 1} to{" "}
          {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Show:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="flex items-center gap-1">
          {currentPage > 3 && totalPages > 5 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-100"
              >
                1
              </button>
              {currentPage > 4 && (
                <span className="px-2 text-gray-500">...</span>
              )}
            </>
          )}

          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1.5 text-sm border rounded ${
                page === currentPage
                  ? "bg-blue-500 text-white border-blue-500"
                  : "border-gray-300 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          ))}

          {currentPage < totalPages - 2 && totalPages > 5 && (
            <>
              {currentPage < totalPages - 3 && (
                <span className="px-2 text-gray-500">...</span>
              )}
              <button
                onClick={() => onPageChange(totalPages)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-100"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ---- Main table ----
function GenericTable<T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  loading = false,
  title,
  searchPlaceholder = "Search...",
  onSearch,
  showSearch = false,
  showFilter = false,
  onFilter,
  emptyMessage = "No data available",
  pagination,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions,
  showPagination = true,

  stickyHeader = false,
  mobileCardBreakpoint = "sm", // below this => cards; at/above => table
  desktopVisibleKeys,
  mobileVisibleKeys,
}: GenericTableProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  const renderCellValue = (item: T, column: TableColumn<T>) => {
    if (column.render) return column.render(item);
    const value = item[column.key as keyof T];
    return value?.toString() || "";
  };

  // Map Tailwind min-width breakpoints to px for media query
  const breakpointMin = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1536,
  } as const;
  const desktopQuery = `(min-width: ${breakpointMin[mobileCardBreakpoint]}px)`;
  const isDesktop = useMediaQuery(desktopQuery);

  // Determine visible columns per viewport
  const visibleKeys = React.useMemo(() => {
    if (isDesktop) return desktopVisibleKeys ?? columns.map((c) => c.key);
    return mobileVisibleKeys ?? columns.map((c) => c.key);
  }, [isDesktop, desktopVisibleKeys, mobileVisibleKeys, columns]);

  const viewColumns = React.useMemo(
    () => columns.filter((col) => visibleKeys.includes(col.key)),
    [columns, visibleKeys]
  );

  // Actions are rendered independently of visibleKeys so they never disappear
  const totalColumns = viewColumns.length + (actions.length > 0 ? 1 : 0);

  const theadClass =
    "bg-gray-50 " + (stickyHeader ? "sticky top-0 z-10 shadow-sm" : "");

  // Strict layout visibility:
  // - Desktop table only at/above 'sm' (or chosen breakpoint)
  // - Mobile cards only below the same breakpoint
  const tableWrapperVisibility = `hidden sm:block`;
  const cardsWrapperVisibility = `sm:hidden`;

  console.log(actions);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {(title || showSearch || showFilter) && (
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {title && (
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                {title}
              </h2>
            )}
            {(showSearch || showFilter) && (
              <div className="flex w-full sm:w-auto gap-3">
                {showSearch && (
                  <div className="relative flex-1 sm:flex-none">
                    <input
                      type="text"
                      placeholder={searchPlaceholder}
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="w-full sm:w-64 pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
                {showFilter && (
                  <button
                    onClick={onFilter}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Filter
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Desktop table only */}
      <div className={tableWrapperVisibility}>
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-max">
            <thead className={theadClass}>
              <tr>
                {viewColumns.map((column, index) => (
                  <th
                    key={index}
                    className={`text-left py-3 sm:py-4 px-4 sm:px-6 font-medium text-gray-900 ${
                      column.className || ""
                    }`}
                  >
                    {column.header}
                  </th>
                ))}
                {actions.length > 0 && (
                  <th
                    className="text-left py-3 sm:py-4 px-4 sm:px-6 font-medium text-gray-900
                               sticky right-0 z-20 bg-gray-50 shadow-[inset_1px_0_0_0_rgba(0,0,0,0.06)]"
                  >
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            {loading ? (
              <TableSkeleton columns={totalColumns} />
            ) : data.length === 0 ? (
              <tbody>
                <tr>
                  <td
                    colSpan={totalColumns}
                    className="py-12 px-6 text-center text-gray-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody className="divide-y divide-gray-200">
                {data.map((item, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    {viewColumns.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className={`py-3 sm:py-4 px-4 sm:px-6 ${
                          column.className || ""
                        } max-w-xs sm:max-w-none truncate`}
                        title={
                          typeof item[column.key as keyof T] === "string"
                            ? (item[column.key as keyof T] as unknown as string)
                            : undefined
                        }
                      >
                        {renderCellValue(item, column)}
                      </td>
                    ))}
                    {actions.length > 0 && (
                      <td
                        className="py-3 sm:py-4 px-4 sm:px-6
                                   sticky right-0 z-10 bg-white shadow-[inset_1px_0_0_0_rgba(0,0,0,0.06)]"
                      >
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          {actions.map((action, actionIndex) => {
                            if (
                              (item as any)?.role === "admin" &&
                              action?.label === "Delete"
                            ) {
                              return <></>;
                            }
                            return (
                              <button
                                key={actionIndex}
                                onClick={() => action.onClick(item)}
                                className={
                                  action.className ||
                                  "p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                }
                                title={action.label}
                              >
                                {action.icon}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>

      {/* Mobile cards only */}
      <div className={`px-4 ${cardsWrapperVisibility}`}>
        {loading ? (
          <div className="py-6 text-gray-500">Loading...</div>
        ) : data.length === 0 ? (
          <div className="py-8 text-center text-gray-500">{emptyMessage}</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {data.map((item, idx) => (
              <li key={idx} className="py-4">
                <div className="rounded-lg border border-gray-200 p-4 bg-white">
                  <dl className="grid grid-cols-1 gap-y-2">
                    {viewColumns.map((column, cidx) => (
                      <div
                        key={cidx}
                        className="flex items-start justify-between gap-4"
                      >
                        <dt className="text-xs font-medium text-gray-500">
                          {column.mobileLabel ?? column.header}
                        </dt>
                        <dd
                          className={`text-sm text-gray-900 text-right ${
                            column.className || ""
                          }`}
                        >
                          {renderCellValue(item, column)}
                        </dd>
                      </div>
                    ))}
                    {actions.length > 0 && (
                      <div className="mt-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {actions.map((action, actionIndex) => {
                            if (
                              (item as any)?.role === "admin" &&
                              action?.label === "Delete"
                            ) {
                              return <></>;
                            }
                            return (
                              <button
                                key={actionIndex}
                                onClick={() => action.onClick(item)}
                                className={
                                  action.className ||
                                  "px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                                }
                                title={action.label}
                              >
                                {action.icon}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </dl>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showPagination && pagination && onPageChange && !loading && (
        <TablePagination
          pagination={pagination}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          pageSizeOptions={pageSizeOptions}
        />
      )}
    </div>
  );
}

export default GenericTable;
