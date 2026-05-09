import { Navigate, useLocation } from "react-router-dom";

import LoadingState from "./LoadingState";
import { useAuth } from "../context/AuthContext";

function AdminRoute({ children }) {
  const { admin, isAdminBootstrapping } = useAuth();
  const location = useLocation();

  if (isAdminBootstrapping) {
    return (
      <LoadingState
        title="Loading admin session"
        description="Restoring secure admin access and operational modules."
        compact
      />
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default AdminRoute;
