import { useState } from "react";
import TopNav from "./TopNav";
import AdminDashboard from "./AdminDashboard";
import SuperAdminDashboard from "./SuperAdminDashboard";
import RoomOwnerDashboard from "./RoomOwnerDashboard";

const SocietyMaintenanceTracker = () => {
  const [currentView] = useState("owner");

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav view="admin" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === "admin" ? (
          <AdminDashboard />
        ) : currentView === "owner" ? (
          <RoomOwnerDashboard />
        ) : (
          <SuperAdminDashboard />
        )}
      </main>
    </div>
  );
};

export default SocietyMaintenanceTracker;
