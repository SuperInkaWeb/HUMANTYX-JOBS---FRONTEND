import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useRef, useState } from "react";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const nav = useNavigate();

  const role = (user?.role || "").toUpperCase();
  const isAdmin = role === "ADMIN";

  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  function isActive(path) {
    return location.pathname.startsWith(path);
  }

  function handleLogout() {
    logout();
    nav("/");
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    }

    function handleEscape(e) {
      if (e.key === "Escape") {
        setAccountOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const userInitial = (user?.email?.[0] || "U").toUpperCase();

  return (
    <aside className="hx-sidebar">
      <div>
        <div className="hx-sidebar__logo-block">
        <div className="hx-sidebar__logo">
        <img src="/logo-oficial.png" alt="Humantyx Jobs"  style={{ height: 100, width: "auto" }}/>
        </div>

        <div className="hx-sidebar__section-title">
         PANEL
        </div>

        <div className="hx-sidebar__divider"></div>
    </div>

 
        <nav className="hx-sidebar__menu">
          <Link
            to="/rrhh/vacantes"
            className={`hx-sidebar__item ${isActive("/rrhh/vacantes") ? "active" : ""}`}
          >
            <i className="bi bi-briefcase"></i>
            <span>Gestión de Vacantes</span>
          </Link>

          {isAdmin && (
            <Link
              to="/rrhh/candidatos"
              className={`hx-sidebar__item ${isActive("/rrhh/candidatos") ? "active" : ""}`}
            >
              <i className="bi bi-people"></i>
              <span>Candidatos</span>
            </Link>
          )}

          

          {isAdmin && (
            <Link
              to="/rrhh/invitar"
              className={`hx-sidebar__item ${isActive("/rrhh/invitar") ? "active" : ""}`}
            >
              <i className="bi bi-person-plus"></i>
              <span>Invitar usuario</span>
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/rrhh/invitaciones"
              className={`hx-sidebar__item ${isActive("/rrhh/invitaciones") ? "active" : ""}`}
            >
              <i className="bi bi-envelope-paper"></i>
              <span>Invitaciones</span>
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/rrhh/usuarios"
              className={`hx-sidebar__item ${isActive("/rrhh/usuarios") ? "active" : ""}`}
            >
              <i className="bi bi-person-gear"></i>
              <span>Usuarios RRHH</span>
            </Link>
          )}
        </nav>
      </div>

      <div className="hx-sidebar__bottom" ref={accountRef}>
        <button
          type="button"
          className="hx-sidebar__account"
          onClick={() => setAccountOpen((v) => !v)}
        >
          <div className="hx-sidebar__avatar">{userInitial}</div>

          <div className="hx-sidebar__account-text">
            <strong>{user?.email || "Usuario"}</strong>
           
          </div>

          <i className={`bi ${accountOpen ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
        </button>

        {accountOpen && (
          <div className="hx-sidebar__account-menu">
            <Link
              to="/empleos"
              className="hx-sidebar__account-item"
              onClick={() => setAccountOpen(false)}
            >
              <i className="bi bi-briefcase"></i>
              <span>Portal de empleos</span>
            </Link>

            <button
              type="button"
              className="hx-sidebar__account-item"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right"></i>
              <span>Salir</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}