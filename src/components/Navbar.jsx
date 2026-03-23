import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef, useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const role = (user?.role || "").trim().toUpperCase();
  const isAdmin = role === "ADMIN";
  const isRRHH = role === "RRHH";
  const isCandidate = role === "CANDIDATE";

  const profileIncomplete =
    isCandidate && user?.profile_complete === false;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    nav("/");
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }

    function handleEscape(e) {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <nav className="hx-navbar border-bottom">
      <div className="container">
        <div className="hx-navbar__inner">
          <Link className="navbar-brand" to="/">
            <img
              src="/logo-humantyx-jobs.png"
              alt="Humantyx Jobs"
              style={{ height: 38, width: "auto" }}
            />
          </Link>

          <div className="hx-navbar__links"></div>

          <div className="hx-navbar__actions">
            {!user && (
              <div className="hx-navbar__guest-links">
                  <Link to="/login" className="hx-navbar__guest-link hx-navbar__guest-link--primary">
                    Ingresar
                  </Link>

                  <span className="hx-navbar__guest-divider"></span>

                  <Link to="/register" className="hx-navbar__guest-link">
                    Crear cuenta
                  </Link>
              </div>
            )}

            {user && (
              <div className="hx-user-menu" ref={menuRef}>
                <button
                  type="button"
                  className="hx-user-menu__trigger"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-label="Abrir menú de usuario"
                >
                  <i className="bi bi-person-fill"></i>
                </button>

                {menuOpen && (
                  <div className="hx-user-menu__dropdown">
                    <div className="hx-user-menu__header">
                      <strong>{user?.email || "Usuario"}</strong>
                    </div>

                    <div className="hx-user-menu__list">
                      {isCandidate && (
                        <>
                          <Link
                            to="/mi-perfil"
                            className="hx-user-menu__item"
                            onClick={() => setMenuOpen(false)}
                          >
                            <i className="bi bi-person-circle"></i>
                            <span>Mi perfil</span>
                          </Link>

                          {profileIncomplete ? (
                            <button
                              type="button"
                              className="hx-user-menu__item is-disabled"
                              disabled
                              title="Completa tu perfil para acceder a tus postulaciones"
                            >
                              <i className="bi bi-briefcase"></i>
                              <span>Mis postulaciones</span>
                            </button>
                          ) : (
                            <Link
                              to="/mis-postulaciones"
                              className="hx-user-menu__item"
                              onClick={() => setMenuOpen(false)}
                            >
                              <i className="bi bi-briefcase-fill"></i>
                              <span>Mis postulaciones</span>
                            </Link>
                          )}
                        </>
                      )}

                      {(isRRHH || isAdmin) && (
                        <>
                          <Link
                            to="/rrhh/vacantes"
                            className="hx-user-menu__item"
                            onClick={() => setMenuOpen(false)}
                          >
                            <i className="bi bi-speedometer2"></i>
                            <span>Panel de control</span>
                          </Link>

                          
                        </>
                      )}

                      {!isCandidate && !isRRHH && !isAdmin && (
                        <Link
                          to="/"
                          className="hx-user-menu__item"
                          onClick={() => setMenuOpen(false)}
                        >
                          <i className="bi bi-house-door"></i>
                          <span>Inicio</span>
                        </Link>
                      )}
                    </div>

                    <div className="hx-user-menu__footer">
                      <button
                        type="button"
                        className="hx-user-menu__logout"
                        onClick={handleLogout}
                      >
                        Salir
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}