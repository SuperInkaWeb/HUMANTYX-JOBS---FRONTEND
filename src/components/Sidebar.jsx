import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useRef, useState } from "react";

export default function Sidebar({ collapsed, onToggle }) {
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
    <aside className={`hx-sidebar ${collapsed ? "hx-sidebar--collapsed" : ""}`}>
      <div>
        <div className="hx-sidebar__logo-block">
          <div className="hx-sidebar__top">
            <div className="hx-sidebar__brand">
                {!collapsed ? (
                  <img
                    src="/logo-oficial.png"
                    alt="Humantyx Jobs"
                    className="hx-sidebar__brand-logo"
                  />
                ) : (
                  <div className="hx-sidebar__brand-mini">HX</div>
                )}
              </div>

            <button
              type="button"
              className="hx-sidebar__collapse-btn"
              onClick={onToggle}
              title={collapsed ? "Expandir menú" : "Contraer menú"}
              aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
            >
              <i className={`bi ${collapsed ? "bi-layout-sidebar" : "bi-layout-sidebar-inset"}`}></i>
            </button>
          </div>

          {!collapsed && (
            <div className="hx-sidebar__section-title">
              PANEL
            </div>
          )}

          <div className="hx-sidebar__divider"></div>
        </div>

        <nav className="hx-sidebar__menu">
          <Link
            to="/rrhh/vacantes"
            className={`hx-sidebar__item ${isActive("/rrhh/vacantes") ? "active" : ""}`}
            title="Gestión de Vacantes"
          >
            <i className="bi bi-briefcase"></i>
            {!collapsed && <span>Gestión de Vacantes</span>}
          </Link>

          {isAdmin && (
            <Link
              to="/rrhh/candidatos"
              className={`hx-sidebar__item ${isActive("/rrhh/candidatos") ? "active" : ""}`}
              title="Candidatos"
            >
              <i className="bi bi-people"></i>
              {!collapsed && <span>Candidatos</span>}
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/rrhh/invitar"
              className={`hx-sidebar__item ${isActive("/rrhh/invitar") ? "active" : ""}`}
              title="Invitar usuario"
            >
              <i className="bi bi-person-plus"></i>
              {!collapsed && <span>Invitar usuario</span>}
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/rrhh/invitaciones"
              className={`hx-sidebar__item ${isActive("/rrhh/invitaciones") ? "active" : ""}`}
              title="Invitaciones"
            >
              <i className="bi bi-envelope-paper"></i>
              {!collapsed && <span>Invitaciones</span>}
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/rrhh/usuarios"
              className={`hx-sidebar__item ${isActive("/rrhh/usuarios") ? "active" : ""}`}
              title="Usuarios RRHH"
            >
              <i className="bi bi-person-gear"></i>
              {!collapsed && <span>Usuarios RRHH</span>}
            </Link>
          )}
        </nav>
      </div>

      <div className="hx-sidebar__bottom" ref={accountRef}>
        <button
          type="button"
          className="hx-sidebar__account"
          onClick={() => setAccountOpen((v) => !v)}
          title={user?.email || "Usuario"}
        >
          <div className="hx-sidebar__avatar">{userInitial}</div>

          {!collapsed && (
            <div className="hx-sidebar__account-text">
              <strong>{user?.email || "Usuario"}</strong>
            </div>
          )}

          {!collapsed && (
            <i className={`bi ${accountOpen ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
          )}
        </button>

        {accountOpen && !collapsed && (
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