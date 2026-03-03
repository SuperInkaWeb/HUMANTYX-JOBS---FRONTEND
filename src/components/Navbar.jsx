import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const role = (user?.role || "").trim().toUpperCase();

  function handleLogout() {
    logout();
    nav("/");
  }

  const isAdmin = role === "ADMIN";
  const isRRHH = role === "RRHH";
  const isCandidate = role === "CANDIDATE";

  const profileIncomplete =
    isCandidate && user?.profile_complete === false;

  return (
    <nav className="navbar navbar-expand-lg border-bottom bg-white">
      <div className="container">
        {/* Logo */}
        <Link className="navbar-brand fw-bold" to="/">
          Humantyx Jobs
        </Link>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* Público */}
          <Link to="/empleos" className="btn btn-link text-decoration-none">
            Buscar empleos
          </Link>

          {/* NO logueado */}
          {!user && (
            <>
              <Link
                to="/login"
                className="btn btn-outline-dark rounded-pill px-3"
              >
                Ingresar
              </Link>
              <Link
                to="/register"
                className="btn btn-dark rounded-pill px-3"
              >
                Crear cuenta
              </Link>
            </>
          )}

          {/* CANDIDATE */}
          {user && isCandidate && (
            <>
              <Link
                to="/mi-perfil"
                className="btn btn-outline-dark rounded-pill px-3"
              >
                Mi perfil
              </Link>

              {/* Deshabilitado si perfil incompleto */}
              {profileIncomplete ? (
                <button
                  className="btn btn-outline-secondary rounded-pill px-3"
                  disabled
                  title="Completa tu perfil para acceder a tus postulaciones"
                  style={{ cursor: "not-allowed" }}
                >
                  Mis postulaciones
                </button>
              ) : (
                <Link
                  to="/mis-postulaciones"
                  className="btn btn-outline-dark rounded-pill px-3"
                >
                  Mis postulaciones
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="btn btn-dark rounded-pill px-3"
              >
                Salir
              </button>
            </>
          )}

          {/* RRHH */}
          {user && isRRHH && (
            <>
              <Link
                to="/rrhh/vacantes"
                className="btn btn-outline-primary rounded-pill px-3"
              >
                Panel RRHH
              </Link>

              <Link
                to="/rrhh/candidatos"
                className="btn btn-outline-dark rounded-pill px-3"
              >
                Candidatos
              </Link>

              <button
                onClick={handleLogout}
                className="btn btn-dark rounded-pill px-3"
              >
                Salir
              </button>
            </>
          )}

          {/* ADMIN */}
          {user && isAdmin && (
            <>
              <Link
                to="/rrhh/vacantes"
                className="btn btn-outline-primary rounded-pill px-3"
              >
                Panel RRHH
              </Link>

              <Link
                to="/rrhh/candidatos"
                className="btn btn-outline-dark rounded-pill px-3"
              >
                Candidatos
              </Link>

              <Link
                to="/rrhh/invitar"
                className="btn btn-outline-success rounded-pill px-3"
              >
                Invitar usuario
              </Link>

              <button
                onClick={handleLogout}
                className="btn btn-dark rounded-pill px-3"
              >
                Salir
              </button>
            </>
          )}

          {/* Fallback */}
          {user && !isCandidate && !isRRHH && !isAdmin && (
            <>
              <span className="text-muted small">
                {user?.email || "Usuario"} ({role || "SIN ROL"})
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-dark rounded-pill px-3"
              >
                Salir
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}