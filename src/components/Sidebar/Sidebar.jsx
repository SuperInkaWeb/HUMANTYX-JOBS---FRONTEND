import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useRef, useState } from "react";

const menuItems = [
  { to: "/rrhh/vacantes", icon: "bi-briefcase", label: "Gestión de Vacantes", roles: ["ADMIN", "RRHH"] },
  { to: "/rrhh/candidatos", icon: "bi-people", label: "Candidatos", roles: ["ADMIN"] },
  { to: "/rrhh/invitar", icon: "bi-person-plus", label: "Invitar usuario", roles: ["ADMIN"] },
  { to: "/rrhh/invitaciones", icon: "bi-envelope-paper", label: "Invitaciones", roles: ["ADMIN"] },
  { to: "/rrhh/usuarios", icon: "bi-person-gear", label: "Usuarios RRHH", roles: ["ADMIN"] },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const accountRef = useRef(null);
  const [accountOpen, setAccountOpen] = useState(false);

  const role = (user?.role || "").toUpperCase();
  const userInitial = (user?.email?.[0] || "U").toUpperCase();
  const visibleItems = menuItems.filter((item) => item.roles.includes(role));

  function isActive(path) {
    return location.pathname.startsWith(path);
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <aside className={`hx-sidebar-v2 ${collapsed ? "is-collapsed" : ""}`}>
      <div>
        <div className="hx-sidebar-v2__top">
          <button
            type="button"
            className="hx-sidebar-v2__brand-button"
            onClick={collapsed ? onToggle : undefined}
            title={collapsed ? "Expandir menú" : "Humantyx Jobs"}
            aria-label={collapsed ? "Expandir menú" : "Humantyx Jobs"}
          >
            {collapsed ? (
              <div className="hx-sidebar-v2__brand-mini">HX</div>
            ) : (
              <img src="/logo-oficial.png" alt="Humantyx Jobs" />
            )}
          </button>

          {!collapsed && (
            <button
              type="button"
              className="hx-sidebar-v2__toggle"
              onClick={onToggle}
              title="Contraer menú"
              aria-label="Contraer menú"
            >
              <i className="bi bi-layout-sidebar"></i>
            </button>
          )}
        </div>

        <nav className="hx-sidebar-v2__menu">
          {visibleItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={`hx-sidebar-v2__item ${isActive(item.to) ? "active" : ""}`}
            >
              <i className={`bi ${item.icon}`}></i>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </div>

      <div className="hx-sidebar-v2__footer" ref={accountRef}>
        <button
          type="button"
          className="hx-sidebar-v2__account"
          onClick={() => setAccountOpen((value) => !value)}
          title={collapsed ? user?.email || "Usuario" : undefined}
        >
          <div className="hx-sidebar-v2__avatar">{userInitial}</div>

          {!collapsed && (
            <>
              <div className="hx-sidebar-v2__account-text">
                <strong>{user?.email || "Usuario"}</strong>
                <span>{role}</span>
              </div>
              <i className="bi bi-chevron-down"></i>
            </>
          )}
        </button>

        {accountOpen && !collapsed && (
          <div className="hx-sidebar-v2__account-menu">
            <Link to="/empleos" onClick={() => setAccountOpen(false)}>
              <i className="bi bi-briefcase"></i>
              Portal de empleos
            </Link>

            <button type="button" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i>
              Salir
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}