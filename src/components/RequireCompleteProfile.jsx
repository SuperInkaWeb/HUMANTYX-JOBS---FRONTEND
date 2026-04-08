import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// SOLO se permite esta ruta cuando el perfil está incompleto:
const ALLOWED_WHEN_INCOMPLETE = ["/mi-perfil"];

export default function RequireCompleteProfile({ children }) {
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (loading) return <div className="container py-5">Cargando...</div>;

  // Si no hay usuario, no bloqueamos aquí.
  // Esto lo maneja ProtectedRoute en las rutas privadas.
  if (!user) return children;

  const role = (user?.role || "").trim().toUpperCase();
  const isCandidate = role === "CANDIDATE";
  const incomplete = isCandidate && user?.profile_complete === false;

  if (!incomplete) return children;

  // Si está incompleto, SOLO permite /mi-perfil
  const path = loc.pathname;

  if (!ALLOWED_WHEN_INCOMPLETE.includes(path)) {
    return <Navigate to="/mi-perfil" replace state={{ from: loc }} />;
  }

  return children;
}