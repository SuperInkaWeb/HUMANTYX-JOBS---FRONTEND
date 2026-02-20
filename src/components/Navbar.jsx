import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  // ✅ Normalizamos el rol para evitar "candidate", "CANDIDATE ", etc.
  const role = (user?.role || "").trim().toUpperCase();
  console.log("NAV user:", user);

  function handleLogout() {
    logout();
    nav("/");
  }

  return (
    <nav className="navbar navbar-expand-lg border-bottom bg-white">
      <div className="container">
        {/* Logo */}
        <Link className="navbar-brand fw-bold" to="/">
          Humantyx Jobs
        </Link>

        <div className="d-flex align-items-center gap-2">
          {/* Public */}
          <Link to="/empleos" className="btn btn-link text-decoration-none">
            Buscar empleos
          </Link>

          {/* NO logueado */}
          {!user && (
            <>
              <Link to="/login" className="btn btn-outline-dark rounded-pill px-3">
                Ingresar
              </Link>
              <Link to="/register" className="btn btn-dark rounded-pill px-3">
                Crear cuenta
              </Link>
            </>
          )}

          {/* CANDIDATE */}
          {user && role === "CANDIDATE" && (
            <>
              <Link to="/mi-perfil" className="btn btn-outline-dark rounded-pill px-3">
                Mi perfil
              </Link>

              <Link to="/mis-postulaciones" className="btn btn-outline-dark rounded-pill px-3">
                Mis postulaciones
              </Link>

              <button onClick={handleLogout} className="btn btn-dark rounded-pill px-3">
                Salir
              </button>
            </>
          )}

          {/* ADMIN / RRHH */}
          {user && (role === "ADMIN" || role === "RRHH") && (
            <>
              <Link
                to="/rrhh/vacantes"
                className="btn btn-outline-primary rounded-pill px-3"
              >
                Panel RRHH
              </Link>

              <Link to="/rrhh/candidatos" className="btn btn-outline-dark rounded-pill px-4">
                Candidatos
              </Link>


              <button onClick={handleLogout} className="btn btn-dark rounded-pill px-3">
                Salir
              </button>
            </>
          )}

          {/* ✅ Fallback (si rol raro o no llega) */}
          {user && role !== "CANDIDATE" && role !== "ADMIN" && role !== "RRHH" && (
            <>
              <span className="text-muted small">
                {user?.email || "Usuario"} ({role || "SIN ROL"})
              </span>
              <button onClick={handleLogout} className="btn btn-dark rounded-pill px-3">
                Salir
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
