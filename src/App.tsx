import { Route, Routes } from "react-router-dom";
import "./App.css";

import AdminDashboard from "./components/AdminDashboard";
import RoomOwnerDashboard from "./components/RoomOwnerDashboard";
import SuperAdminDashboard from "./components/SuperAdminDashboard";
import SignIn from "./Views/SignIn";
import ProtectedRoute from "./components/ProtectedRoute";
import SignUp from "./Views/SignUp";
import UnauthorizedPage from "./Views/Unauthorized";

function App() {
  return (
    <Routes>
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      ></Route>
      <Route
        path="/owner"
        element={
          <ProtectedRoute allowedRoles={["resident", "admin"]}>
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

      <Route path="/*" element={<SignIn />}></Route>
      <Route path="/sign-in" element={<SignIn />}></Route>
      <Route path="/sign-up" element={<SignUp />}></Route>
      <Route path="/unauthorized" element={<UnauthorizedPage />}></Route>
    </Routes>
  );
}

export default App;
