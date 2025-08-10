import {
  Building2,
  Plus,
  Search,
  Filter,
  Edit,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  Home,
} from "lucide-react";
import useCommonService from "../hooks/serviceHooks/useCommonService";
import TopNav from "./TopNav";

const SuperAdminDashboard = () => {
  const { getStatusColor, getStatusIcon } = useCommonService();

  // Sample societies data
  const societiesData = [
    {
      id: 1,
      name: "Sunrise Apartments",
      type: "Residential",
      city: "Mumbai",
      totalUnits: 120,
      status: "active",
      onboardedDate: "2024-01-15",
      admin: "Rajesh Kumar",
      adminContact: "+91 98765 43210",
    },
    {
      id: 2,
      name: "Green Valley Society",
      type: "Residential",
      city: "Pune",
      totalUnits: 85,
      status: "active",
      onboardedDate: "2024-02-20",
      admin: "Priya Sharma",
      adminContact: "+91 87654 32109",
    },
    {
      id: 3,
      name: "Metro Heights",
      type: "Commercial",
      city: "Delhi",
      totalUnits: 50,
      status: "pending",
      onboardedDate: "2024-03-10",
      admin: "Amit Patel",
      adminContact: "+91 76543 21098",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav view="owner" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Super Admin Dashboard
                </h1>
                <p className="text-gray-600">
                  Manage all societies and onboard new ones
                </p>
              </div>
              <button
                onClick={() => {}}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Onboard New Society
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">
                    Total Societies
                  </p>
                  <p className="text-3xl font-bold">147</p>
                </div>
                <Building2 className="w-8 h-8 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">
                    Active Societies
                  </p>
                  <p className="text-3xl font-bold">128</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">
                    Pending Approval
                  </p>
                  <p className="text-3xl font-bold">12</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">
                    Total Units
                  </p>
                  <p className="text-3xl font-bold">12,456</p>
                </div>
                <Home className="w-8 h-8 text-purple-200" />
              </div>
            </div>
          </div>

          {/* Societies Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  All Societies
                </h2>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search societies..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Filter className="w-4 h-4" />
                    Filter
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      Society Name
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      Type
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      Location
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      Units
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      Admin
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {societiesData.map((society) => (
                    <tr key={society.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-gray-900">
                            {society.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: SOC{society.id.toString().padStart(3, "0")}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-700">
                        {society.type}
                      </td>
                      <td className="py-4 px-6 text-gray-700">
                        {society.city}
                      </td>
                      <td className="py-4 px-6 text-gray-900 font-medium">
                        {society.totalUnits}
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="text-gray-900 font-medium">
                            {society.admin}
                          </div>
                          <div className="text-sm text-gray-500">
                            {society.adminContact}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            society.status
                          )}`}
                        >
                          {getStatusIcon(society.status)}
                          {society.status.charAt(0).toUpperCase() +
                            society.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
