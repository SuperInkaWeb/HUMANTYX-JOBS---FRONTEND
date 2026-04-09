import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ALLOWED_WHEN_INCOMPLETE = ["/completar-perfil"];

export default function RequireCompleteProfile({ children }) {
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (loading) return <div className="container py-5">Cargando...</div>;

  if (!user) return children;

  const role = (user?.role || "").trim().toUpperCase();
  const isCandidate = role === "CANDIDATE";
  const incomplete = isCandidate && user?.profile_complete === false;

  if (!incomplete) return children;

  const path = loc.pathname;

  if (!ALLOWED_WHEN_INCOMPLETE.includes(path)) {
    return <Navigate to="/completar-perfil" replace state={{ from: loc }} />;
  }

  return children;
}