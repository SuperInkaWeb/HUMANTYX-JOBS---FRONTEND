import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function RoleProtectedRoute({ allow = [], children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="container py-4">Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const currentRole = String(user?.role || "")
    .trim()
    .toUpperCase();

  const allowedRoles = allow.map((role) =>
    String(role || "")
      .trim()
      .toUpperCase()
  );

  if (allowedRoles.length && !allowedRoles.includes(currentRole)) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">
          No tienes permisos para acceder a esta sección.
        </div>
      </div>
    );
  }

  return children;
}