/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Calendar,
    TrendingUp,
    TrendingDown,
    IndianRupeeIcon,
    FileText,
    Receipt,
    Eye,
    Edit,
    Trash2,
} from "lucide-react";

import TopNav from "../components/TopNav";
import GenericTable, { type TableAction } from "../components/ui/GenericTable";
import ViewIncomeModal from "../components/Modals/ViewIncomeModal";
import { UpdateIncomeModal } from "../components/Modals/UpdateIncomeModal";
import { ViewExpenseModal } from "../components/Modals/ViewExpenseModal";
import { EditExpenseModal } from "../components/Modals/EditExpenseModal";
import ConfirmationAlert from "../components/Modals/ConfirmationAlert";

import useIncomeService, { type IncomeRow } from "../hooks/serviceHooks/useIncomeService";
import useExpenseService from "../hooks/serviceHooks/useExpenseService";

import { useOrganizationStore } from "../libs/stores/useOrganizationStore";
import { useProfileStore } from "../libs/stores/useProfileStore";
import { longMonth } from "../utility/dateTimeServices";
import type { Expense } from "../libs/stores/useReportStore";
import toast from "react-hot-toast";


const MonthlyReportDetails = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const month = searchParams.get("month") || "";
    const year = searchParams.get("year") || "";

    const [loading, setLoading] = useState(false);
    const [incomeData, setIncomeData] = useState<IncomeRow[]>([]);
    const [expenseData, setExpenseData] = useState<Expense[]>([]);
    const [selectedIncome, setSelectedIncome] = useState<IncomeRow | null>(null);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

    // Modal states for Income
    const [isOpenViewIncomeModal, setIsOpenViewIncomeModal] = useState(false);
    const [isOpenUpdateIncomeModal, setIsOpenUpdateIncomeModal] = useState(false);
    const [isOpenDeleteIncomeModal, setIsOpenDeleteIncomeModal] = useState(false);

    // Modal states for Expense
    const [isOpenViewExpenseModal, setIsOpenViewExpenseModal] = useState(false);
    const [isOpenUpdateExpenseModal, setIsOpenUpdateExpenseModal] = useState(false);
    const [isOpenDeleteExpenseModal, setIsOpenDeleteExpenseModal] = useState(false);

    const { residentOrganization } = useOrganizationStore();
    const { profile } = useProfileStore();
    const { fetchIncomes, deleteIncome } = useIncomeService();
    const { fetchExpenses, deleteExpense } = useExpenseService();

    // Calculate totals
    const totalIncome = incomeData.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalExpenses = expenseData.reduce((sum, item) => sum + Number(item.amount), 0);
    const difference = totalIncome - totalExpenses;

    // Get month name
    const monthIndex = parseInt(month) - 1;
    const monthName = monthIndex >= 0 && monthIndex < 12 ? longMonth[monthIndex] : "Unknown";

    // Load data
    const loadData = async () => {
        if (!month || !year) return;

        setLoading(true);
        try {
            const [incomeResult, expenseResult] = await Promise.all([
                fetchIncomes({
                    page: 1,
                    pageSize: 1000,
                    searchQuery: "",
                    sortBy: "date",
                    sortOrder: "desc",
                    filters: {
                        month: month,
                        year: year,
                    },
                    orgId: residentOrganization?.id as string,
                }),
                fetchExpenses({
                    page: 1,
                    pageSize: 1000,
                    searchQuery: "",
                    sortBy: "date",
                    sortOrder: "desc",
                    filters: {
                        month: month,
                        year: year,
                    },
                    orgId: residentOrganization?.id as string,
                }),
            ]);

            if (incomeResult) {
                setIncomeData(incomeResult.data || []);
            }

            if (expenseResult) {
                setExpenseData(expenseResult.data || []);
            }
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [month, year]);

    // Handle delete income
    const handleDeleteIncome = async () => {
        if (!selectedIncome) return;

        try {
            await deleteIncome(selectedIncome.id);

            toast.success("Income deleted successfully");
            setIsOpenDeleteIncomeModal(false);
            setSelectedIncome(null);
            await loadData();

        } catch (error) {
            console.error("Error deleting income:", error);
            toast.error("Failed to delete income");
        }
    };

    // Handle delete expense
    const handleDeleteExpense = async () => {
        if (!selectedExpense) return;

        try {
            await deleteExpense(selectedExpense.id);

            toast.success("Expense deleted successfully");
            setIsOpenDeleteExpenseModal(false);
            setSelectedExpense(null);
            await loadData();

        } catch (error) {
            console.error("Error deleting expense:", error);
            toast.error("Failed to delete expense");
        }
    };

    // Income table actions with role-based access
    const incomeActions: TableAction<IncomeRow>[] = [
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
        ...(profile?.role === "admin"
            ? [
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
                    label: "Delete",
                },
            ]
            : []),
    ];

    // Expense table actions with role-based access
    const expenseActions: TableAction<Expense>[] = [
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
        ...(profile?.role === "admin"
            ? [
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
                    label: "Delete",
                },
            ]
            : []),
    ];

    // Income table columns
    const incomeColumns = [
        {
            key: "date",
            header: "Date",
            render: (row: IncomeRow) => (
                <div>
                    <p className="font-medium text-gray-900">
                        {new Date(row.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                        })}
                    </p>
                </div>
            ),
        },
        {
            key: "description",
            header: "Description",
            render: (row: IncomeRow) => (
                <div>
                    <p className="text-gray-900">{row.name}</p>
                    {row.description && (
                        <p className="text-xs text-gray-500">Source: {row.description}</p>
                    )}
                </div>
            ),
        },
        {
            key: "amount",
            header: "Amount",
            render: (row: IncomeRow) => (
                <div>
                    <p className="font-semibold text-green-600">
                        ₹{Number(row.amount).toLocaleString("en-IN")}
                    </p>
                </div>
            ),
        },
    ];

    // Expense table columns
    const expenseColumns = [
        {
            key: "date",
            header: "Date",
            render: (row: Expense) => (
                <div>
                    <p className="font-medium text-gray-900">
                        {new Date(row.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                        })}
                    </p>
                </div>
            ),
        },
        {
            key: "description",
            header: "Description",
            render: (row: Expense) => {
                console.log(row)
                return (

                    <div>
                        <p className="text-gray-900">{row.name}</p>
                        {row.receiver_name && (
                            <p className="text-xs text-gray-500">Paid to: {row.receiver_name}</p>
                        )}

                    </div>
                )
            },
        },
        {
            key: "amount",
            header: "Amount",
            render: (row: Expense) => (
                <div>
                    <p className="font-semibold text-red-600">
                        ₹{Number(row.amount).toLocaleString("en-IN")}
                    </p>
                </div>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <TopNav view="admin" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-6">
                    {/* Header with Back Button */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/reports")}
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back to Reports
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                            <h1 className="text-2xl poppins-medium flex items-center gap-2">
                                <Calendar className="w-7 h-7 text-blue-600" />
                                {monthName} {year} - Detailed Report
                            </h1>
                            <p className="text-gray-600 text-sm font-light">
                                Complete breakdown of income and expenses for {residentOrganization?.name}
                            </p>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-600 text-sm font-medium">
                                        Total Income
                                    </p>
                                    <p className="text-2xl font-bold text-green-800">
                                        ₹{totalIncome.toLocaleString("en-IN")}
                                    </p>
                                    <p className="text-xs text-green-600 mt-1">
                                        {incomeData.length} transaction{incomeData.length !== 1 ? "s" : ""}
                                    </p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-green-600" />
                            </div>
                        </div>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-red-600 text-sm font-medium">
                                        Total Expenses
                                    </p>
                                    <p className="text-2xl font-bold text-red-800">
                                        ₹{totalExpenses.toLocaleString("en-IN")}
                                    </p>
                                    <p className="text-xs text-red-600 mt-1">
                                        {expenseData.length} transaction{expenseData.length !== 1 ? "s" : ""}
                                    </p>
                                </div>
                                <TrendingDown className="w-8 h-8 text-red-600" />
                            </div>
                        </div>

                        <div
                            className={`${difference >= 0
                                ? "bg-blue-50 border-blue-200"
                                : "bg-orange-50 border-orange-200"
                                } border rounded-lg p-6`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p
                                        className={`${difference >= 0 ? "text-blue-600" : "text-orange-600"
                                            } text-sm font-medium`}
                                    >
                                        Net {difference >= 0 ? "Surplus" : "Deficit"}
                                    </p>
                                    <p
                                        className={`text-2xl font-bold ${difference >= 0 ? "text-blue-800" : "text-orange-800"
                                            }`}
                                    >
                                        {difference >= 0 ? "+" : "-"}₹
                                        {Math.abs(difference).toLocaleString("en-IN")}
                                    </p>
                                    <p
                                        className={`text-xs mt-1 ${difference >= 0 ? "text-blue-600" : "text-orange-600"
                                            }`}
                                    >
                                        {difference >= 0 ? "Positive balance" : "Negative balance"}
                                    </p>
                                </div>
                                <IndianRupeeIcon
                                    className={`w-8 h-8 ${difference >= 0 ? "text-blue-600" : "text-orange-600"
                                        }`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Income Section */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Receipt className="w-5 h-5 text-green-600" />
                            <h2 className="text-xl font-semibold text-gray-900">
                                Income Details
                            </h2>
                        </div>
                        <GenericTable
                            title=""
                            columns={incomeColumns as any}
                            data={incomeData as any}
                            actions={incomeActions}
                            loading={loading}
                            emptyMessage="No income records found for this month"
                            searchPlaceholder=""
                            showPagination={false}
                            onSearch={() => { }}
                        />
                    </div>

                    {/* Expense Section */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="w-5 h-5 text-red-600" />
                            <h2 className="text-xl font-semibold text-gray-900">
                                Expense Details
                            </h2>
                        </div>
                        <GenericTable
                            title=""
                            columns={expenseColumns as any}
                            data={expenseData as any}
                            actions={expenseActions}
                            loading={loading}
                            emptyMessage="No expense records found for this month"
                            searchPlaceholder=""
                            showPagination={false}
                            onSearch={() => { }}
                        />
                    </div>

                    {/* Summary Footer */}
                    <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <p className="text-sm text-gray-600">Period</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {monthName} {year}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Income</p>
                                <p className="text-lg font-bold text-green-600">
                                    ₹{totalIncome.toLocaleString("en-IN")}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Expenses</p>
                                <p className="text-lg font-bold text-red-600">
                                    ₹{totalExpenses.toLocaleString("en-IN")}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">
                                    Net {difference >= 0 ? "Surplus" : "Deficit"}
                                </p>
                                <p
                                    className={`text-lg font-bold ${difference >= 0 ? "text-blue-600" : "text-orange-600"
                                        }`}
                                >
                                    {difference >= 0 ? "+" : ""}₹
                                    {Math.abs(difference).toLocaleString("en-IN")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Income Modals */}
            {selectedIncome && (
                <>
                    <ViewIncomeModal
                        isOpen={isOpenViewIncomeModal}
                        onClose={() => {
                            setIsOpenViewIncomeModal(false);
                            setSelectedIncome(null);
                        }}
                        income={selectedIncome}
                    />

                    <UpdateIncomeModal
                        isOpen={isOpenUpdateIncomeModal}
                        onClose={() => {
                            setIsOpenUpdateIncomeModal(false);
                            setSelectedIncome(null);
                        }}
                        income={selectedIncome}
                    />

                    <ConfirmationAlert
                        isOpen={isOpenDeleteIncomeModal}
                        onClose={() => {
                            setIsOpenDeleteIncomeModal(false);
                            setSelectedIncome(null);
                        }}
                        onConfirm={handleDeleteIncome}
                        title="Delete Income"
                        message={`Are you sure you want to delete this income record of ₹${Number(
                            selectedIncome.amount
                        ).toLocaleString("en-IN")}? This action cannot be undone.`}
                        confirmText="Delete"
                        cancelText="Cancel"
                    />
                </>
            )}

            {/* Expense Modals */}
            {selectedExpense && (
                <>
                    <ViewExpenseModal
                        isOpen={isOpenViewExpenseModal}
                        onClose={() => {
                            setIsOpenViewExpenseModal(false);
                            setSelectedExpense(null);
                        }}
                        expense={selectedExpense}
                    />

                    <EditExpenseModal
                        isOpen={isOpenUpdateExpenseModal}
                        onClose={() => {
                            setIsOpenUpdateExpenseModal(false);
                            setSelectedExpense(null);
                        }}
                        expense={selectedExpense}

                    />

                    <ConfirmationAlert
                        isOpen={isOpenDeleteExpenseModal}
                        onClose={() => {
                            setIsOpenDeleteExpenseModal(false);
                            setSelectedExpense(null);
                        }}
                        onConfirm={handleDeleteExpense}
                        title="Delete Expense"
                        message={`Are you sure you want to delete this expense record of ₹${Number(
                            selectedExpense.amount
                        ).toLocaleString("en-IN")}? This action cannot be undone.`}
                        confirmText="Delete"
                        cancelText="Cancel"
                    />
                </>
            )}
        </div>
    );
};

export default MonthlyReportDetails;
