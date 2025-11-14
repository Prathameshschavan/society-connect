// components/ProtectedRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useProfileStore } from "../libs/stores/useProfileStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<
    "super_admin" | "admin" | "resident" | "tenant" | "committee_member"
  >;
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
  const { profile } = useProfileStore();

  // Check if user must change password first
  if (
    profile &&
    profile?.must_change_password &&
    location.pathname !== "/change-password"
  ) {
    return <Navigate to="/change-password" replace />;
  }

  // Redirect authenticated users away from auth pages
  if (redirectIfAuthenticated && profile && !profile?.must_change_password) {
    // Redirect based on user role
    if (profile?.role === "super_admin") {
      return <Navigate to="/super-admin" replace />;
    } else if (
      profile?.role === "admin" ||
      profile?.role === "committee_member"
    ) {
      return <Navigate to="/admin" replace />;
    } else if (profile?.role === "resident" || profile?.role === "tenant") {
      return <Navigate to="/owner" replace />;
    }
    return <Navigate to={redirectTo} replace />;
  }

  // Redirect to login if authentication required but user not logged in
  if (requireAuth && !profile) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (
    allowedRoles.length > 0 &&
    (!profile || !allowedRoles.includes(profile.role))
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
