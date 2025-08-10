// components/ProtectedRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../libs/contexts/useAuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<"super_admin" | "admin" | "resident">;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  requireAuth = true,
}) => {
  const { user, profile } = useAuthContext();


  const location = useLocation();

  // Redirect to login if authentication required but user not logged in
  // if (requireAuth && !user) {
  //   return <Navigate to="/login" state={{ from: location }} replace />;
  // }

  // // Check if user has required role
  // if (
  //   allowedRoles.length > 0 &&
  //   (!profile || !allowedRoles.includes(profile.role))
  // ) {
  //   return <Navigate to="/unauthorized" replace />;
  // }

  // // Check if user must change password
  // if (
  //   profile?.must_change_password &&
  //   location.pathname !== "/change-password"
  // ) {
  //   return <Navigate to="/change-password" replace />;
  // }

  return <>{children}</>;
};

export default ProtectedRoute;
