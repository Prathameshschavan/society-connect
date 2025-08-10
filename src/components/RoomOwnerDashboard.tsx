import { AlertCircle } from "lucide-react";
import React, { useState } from "react";
import useCommonService from "../hooks/serviceHooks/useCommonService";
import PaymentModal from "./Modals/PaymentModal";
import TopNav from "./TopNav";

const RoomOwnerDashboard = () => {
  const { getStatusIcon, getStatusColor } = useCommonService();

  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const paymentHistory = [
    {
      month: "July 2025",
      amountDue: 5000,
      penalty: 0,
      totalPaid: 5000,
      status: "paid",
      datePaid: "2025-07-03",
    },
    {
      month: "June 2025",
      amountDue: 5000,
      penalty: 0,
      totalPaid: 5000,
      status: "paid",
      datePaid: "2025-06-02",
    },
    {
      month: "May 2025",
      amountDue: 5000,
      penalty: 250,
      totalPaid: 5250,
      status: "paid",
      datePaid: "2025-05-15",
    },
    {
      month: "April 2025",
      amountDue: 5000,
      penalty: 0,
      totalPaid: 5000,
      status: "paid",
      datePaid: "2025-04-01",
    },
    {
      month: "August 2025",
      amountDue: 5000,
      penalty: 500,
      totalPaid: 0,
      status: "overdue",
      datePaid: "-",
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
                <p className="text-gray-600 mt-1">Amit Patel • Room A-103</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Current Month</p>
                <p className="text-lg font-semibold text-gray-900">
                  August 2025
                </p>
              </div>
            </div>
          </div>

          {/* Current Pending Amount */}
          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-6">
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
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Payment History
              </h2>
              <p className="text-gray-600 mt-1">
                Track your maintenance payment records
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      Month/Year
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      Amount Due
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      Penalty
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      Total Paid
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      Date Paid
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paymentHistory.map((payment, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-4 px-6 font-medium text-gray-900">
                        {payment.month}
                      </td>
                      <td className="py-4 px-6 text-gray-700">
                        ₹{payment.amountDue.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-gray-700">
                        {payment.penalty > 0 ? `₹${payment.penalty}` : "-"}
                      </td>
                      <td className="py-4 px-6 text-gray-900 font-medium">
                        {payment.totalPaid > 0
                          ? `₹${payment.totalPaid.toLocaleString()}`
                          : "-"}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            payment.status
                          )}`}
                        >
                          {getStatusIcon(payment.status)}
                          {payment.status.charAt(0).toUpperCase() +
                            payment.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {payment.datePaid}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {showPaymentModal && <PaymentModal setOpen={setShowPaymentModal} />}
        </div>
      </main>
    </div>
  );
};

export default RoomOwnerDashboard;
