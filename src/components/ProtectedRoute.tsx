// components/ProtectedRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useProfileStore } from "../libs/stores/useProfileStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<"super_admin" | "admin" | "resident" | "tenant">;
  requireAuth?: boolean;
  redirectIfAuthenticated?: boolean; // New prop
  redirectTo?: string; // Where to redirect authenticated users
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  requireAuth = true,
  redirectIfAuthenticated = false,
  redirectTo = "/",
}) => {
  const location = useLocation();
  const { user, profile } = useProfileStore();

  // Redirect authenticated users away from auth pages
  if (redirectIfAuthenticated && user) {
    // Redirect based on user role
    if (profile?.role === "super_admin") {
      return <Navigate to="/super-admin" replace />;
    } else if (profile?.role === "admin") {
      return <Navigate to="/admin" replace />;
    } else if (profile?.role === "resident" || profile?.role === "tenant") {
      return <Navigate to="/owner" replace />;
    }
    console.log("none of the above", profile);
    return <Navigate to={redirectTo} replace />;
  }

  // Redirect to login if authentication required but user not logged in
  if (requireAuth && !user) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (
    allowedRoles.length > 0 &&
    (!profile || !allowedRoles.includes(profile.role))
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check if user must change password
  if (
    profile?.must_change_password &&
    location.pathname !== "/change-password"
  ) {
    return <Navigate to="/change-password" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
