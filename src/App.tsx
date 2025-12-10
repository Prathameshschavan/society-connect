import { Route, Routes } from "react-router-dom";
import "./App.css";

import RoomOwnerDashboard from "./components/RoomOwnerDashboard";

import ProtectedRoute from "./components/ProtectedRoute";

import MonthlyReportDetails from "./views/MonthlyReportDetails.tsx";
import SignIn from "./views/SignIn.tsx";
import SocietyConfigurationPage from "./views/ConfigureSettings.tsx";
import ChangePassword from "./views/ChangePassword.tsx";
import SignUp from "./views/SignUp.tsx";
import UnauthorizedPage from "./views/Unauthorized.tsx";
import Units from "./views/Units.tsx";
import Residents from "./views/Residents.tsx";
import Maintenance from "./views/Maintenance.tsx";
import Income from "./views/Income.tsx";
import Expenses from "./views/Expenses.tsx";
import SuperAdminDashboard from "./views/SuperAdminDashboard.tsx";
import Dashboard from "./views/Dashboard.tsx";

function App() {
  return (
    <Routes>
      <Route
        path="/maintenance"
        element={
          <ProtectedRoute allowedRoles={["admin", "committee_member"]}>
            <Maintenance />
          </ProtectedRoute>
        }
      ></Route>
      <Route
        path="/monthly-report"
        element={
          <ProtectedRoute allowedRoles={["admin", "committee_member"]}>
            <MonthlyReportDetails />
          </ProtectedRoute>
        }
      ></Route>
      <Route
        path="/expenses"
        element={
          <ProtectedRoute allowedRoles={["admin", "committee_member"]}>
            <Expenses />
          </ProtectedRoute>
        }
      ></Route>
      <Route
        path="/income"
        element={
          <ProtectedRoute allowedRoles={["admin", "committee_member"]}>
            <Income />
          </ProtectedRoute>
        }
      ></Route>
      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={["admin", "committee_member"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      ></Route>
      <Route
        path="/report"
        element={
          <ProtectedRoute allowedRoles={["admin", "committee_member"]}>
            <MonthlyReportDetails />
          </ProtectedRoute>
        }
      ></Route>
      <Route
        path="/units"
        element={
          <ProtectedRoute allowedRoles={["admin", "committee_member"]}>
            <Units />
          </ProtectedRoute>
        }
      ></Route>
      <Route
        path="/residents"
        element={
          <ProtectedRoute allowedRoles={["admin", "committee_member"]}>
            <Residents />
          </ProtectedRoute>
        }
      ></Route>
      <Route
        path="/owner"
        element={
          <ProtectedRoute allowedRoles={["resident", "tenant"]}>
            <RoomOwnerDashboard />
          </ProtectedRoute>
        }
      ></Route>

      <Route
        path="/super-admin"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      ></Route>
      <Route
        path="/sign-in"
        element={
          <ProtectedRoute requireAuth={false} redirectIfAuthenticated={true}>
            <SignIn />
          </ProtectedRoute>
        }
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute requireAuth={false} redirectIfAuthenticated={true}>
            <SignIn />
          </ProtectedRoute>
        }
      />
      <Route path="/sign-up" element={<SignUp />}></Route>
      <Route path="/unauthorized" element={<UnauthorizedPage />}></Route>
      <Route path="/change-password" element={<ChangePassword />}></Route>
      <Route
        path="/configure-settings/:orgId"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <SocietyConfigurationPage />
          </ProtectedRoute>
        }
      ></Route>
    </Routes>
  );
}

export default App;
