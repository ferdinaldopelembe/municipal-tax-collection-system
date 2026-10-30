import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../context/useAuth";

export function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-text-muted">
        A carregar…
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/pagamentos" replace />;
  }
  return <Outlet />;
}