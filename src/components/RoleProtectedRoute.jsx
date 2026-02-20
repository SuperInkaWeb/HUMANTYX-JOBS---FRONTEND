import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleProtectedRoute({ allow = [], children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="container py-4">Cargando...</div>;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allow.length && !allow.includes(user.role)) {
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
