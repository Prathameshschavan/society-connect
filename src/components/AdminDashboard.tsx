import {
  AlertCircle,
  CheckCircle,
  CreditCard,
  Plus,
  Settings,
} from "lucide-react";
import TopNav from "./TopNav";
import OnboardResidentModal from "./Modals/OnboardResidentModal";
import { useEffect, useState } from "react";
import useAdminService from "../hooks/serviceHooks/useAdminService";
import { useProfileStore } from "../libs/stores/useProfileStore";

const AdminDashboard = () => {
  const { fetchResidents } = useAdminService();
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const { residents } = useProfileStore();
  const adminData = {
    totalDue: 275000,
    totalPaid: 180000,
    pendingPayments: 18,
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav view="admin" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Manage your society maintenance payments
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">
                    Pending Payments
                  </p>
                  <p className="text-3xl font-bold">
                    {adminData.pendingPayments}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-200" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setIsOnboardModalOpen(true)}
              className="cursor-pointer flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Room Owner
            </button>
            <button className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              <Settings className="w-5 h-5" />
              Configure Settings
            </button>
          </div>

          {/* Rooms Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Room Status
                </h2>
                {/* <div className="flex gap-3">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search rooms..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Filter className="w-4 h-4" />
                    Filter
                  </button>
                </div> */}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      Room
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      Owner Name
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      Amount
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      Due Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {residents.map((room) => (
                    <tr key={room.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6 font-medium text-gray-900">
                        {room.unit_number}
                      </td>
                      <td className="py-4 px-6 text-gray-700">
                        {room.full_name}
                      </td>
                      <td className="py-4 px-6 text-gray-900 font-medium">
                        ₹{room.role.toLocaleString()}
                      </td>
                      {/* <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            room.status
                          )}`}
                        >
                          {getStatusIcon(room.status)}
                          {room.status.charAt(0).toUpperCase() +
                            room.status.slice(1)}
                        </span>
                      </td> */}
                      {/* <td className="py-4 px-6 text-gray-600">
                        {new Date(room.).toLocaleDateString("en-IN")}
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      <OnboardResidentModal
        isOpen={isOnboardModalOpen}
        onClose={() => setIsOnboardModalOpen(false)}
      />
    </div>
  );
};

export default AdminDashboard;
