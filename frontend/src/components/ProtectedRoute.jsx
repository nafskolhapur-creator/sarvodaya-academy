import { Navigate, useLocation } from "react-router-dom";

import LoadingState from "./LoadingState";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { user, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return (
      <LoadingState
        title="Loading your session"
        description="Verifying student access and restoring your dashboard."
        compact
      />
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default ProtectedRoute;
