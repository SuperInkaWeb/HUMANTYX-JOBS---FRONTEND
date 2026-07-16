import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getMyNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/api";

const NOTIFICATIONS_COUNT_POLL_MS = 15000;
const NOTIFICATIONS_LIST_POLL_MS = 10000;

const pageMap = {
  "/rrhh/dashboard": {
    title: "Dashboard",
    description: "Gestiona la operación de Humantyx Jobs.",
  },
  "/rrhh/vacantes": {
    title: "Gestión de Vacantes",
    description: "Administra vacantes, estados y postulaciones.",
  },
  "/rrhh/candidatos": {
    title: "Candidatos",
    description: "Consulta y gestiona perfiles de candidatos.",
  },
  "/rrhh/invitar": {
    title: "Invitar usuario",
    description: "Envía invitaciones a nuevos usuarios RRHH.",
  },
  "/rrhh/invitaciones": {
    title: "Invitaciones",
    description: "Revisa invitaciones enviadas y su estado.",
  },
  "/rrhh/usuarios": {
    title: "Usuarios RRHH",
    description: "Administra usuarios internos y permisos.",
  },
};

const PANEL_NAMES = {
  ADMIN: "Panel Admin",
  RRHH: "Panel RRHH",
  SUPER_ADMIN: "Panel Plataforma",
};

function formatNotificationDate(value) {
  if (!value) return "";

  try {
    return new Date(value).toLocaleString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function AdminHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [search, setSearch] = useState("");

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");

  const notificationsRef = useRef(null);
  const profileRef = useRef(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const panelName = PANEL_NAMES[user?.role] || "Panel";

  const currentPage =
    pageMap[location.pathname] ||
    Object.entries(pageMap).find(([path]) =>
      location.pathname.startsWith(path)
    )?.[1] || {
      title: "Dashboard",
      description: "Gestiona la operación de Humantyx Jobs.",
    };

  const current = {
    section: panelName,
    ...currentPage,
  };

  const userInitial = (user?.email?.[0] || "U").toUpperCase();

  function handleSearchSubmit(e) {
    e.preventDefault();

    const term = search.trim();
    if (!term) return;

    navigate(`/rrhh/vacantes?search=${encodeURIComponent(term)}`);
  }

  const loadUnreadCount = useCallback(async () => {
    if (!user) return;
    if (document.visibilityState !== "visible") return;

    try {
      const unreadData = await getUnreadNotificationsCount();
      setUnreadCount(unreadData?.unread_count || 0);
    } catch {
      // silencioso
    }
  }, [user]);

  const loadNotifications = useCallback(
    async ({ silent = false } = {}) => {
      if (!user) return;
      if (document.visibilityState !== "visible") return;

      try {
        if (!silent) {
          setLoadingNotifications(true);
          setNotificationsError("");
        }

        const [listData, unreadData] = await Promise.all([
          getMyNotifications(),
          getUnreadNotificationsCount(),
        ]);

        setNotifications(listData?.notifications || []);
        setUnreadCount(unreadData?.unread_count || 0);
      } catch (e) {
        if (!silent) {
          setNotificationsError(
            e.message || "No se pudieron cargar las notificaciones."
          );
        }
      } finally {
        if (!silent) {
          setLoadingNotifications(false);
        }
      }
    },
    [user]
  );

  async function handleOpenNotifications() {
    const next = !notificationsOpen;
    setNotificationsOpen(next);

    if (next) {
      await loadNotifications();
    }
  }

  async function handleNotificationClick(notification) {
    try {
      if (!notification?.is_read) {
        await markNotificationAsRead(notification.id);

        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id
              ? {
                  ...item,
                  is_read: true,
                  read_at: item.read_at || new Date().toISOString(),
                }
              : item
          )
        );

        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      setNotificationsOpen(false);

      if (notification?.link) {
        navigate(notification.link);
      }
    } catch (e) {
      setNotificationsError(
        e.message || "No se pudo actualizar la notificación."
      );
    }
  }

  async function handleMarkAllAsRead() {
    try {
      await markAllNotificationsAsRead();

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          is_read: true,
          read_at: item.read_at || new Date().toISOString(),
        }))
      );

      setUnreadCount(0);
    } catch (e) {
      setNotificationsError(
        e.message || "No se pudieron marcar todas como leídas."
      );
    }
  }

  useEffect(() => {
    if (!user) return;

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, NOTIFICATIONS_COUNT_POLL_MS);

    return () => clearInterval(interval);
  }, [user, loadUnreadCount]);

  useEffect(() => {
    if (!user) return;
    if (!notificationsOpen) return;

    const interval = setInterval(() => {
      loadNotifications({ silent: true });
    }, NOTIFICATIONS_LIST_POLL_MS);

    return () => clearInterval(interval);
  }, [user, notificationsOpen, loadNotifications]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(e.target)
      ) {
        setNotificationsOpen(false);
      }

      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }

    function handleEscape(e) {
      if (e.key === "Escape") {
        setNotificationsOpen(false);
        setProfileOpen(false);
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
    <header className="hx-admin-header">
      <div className="hx-admin-header__left">
        <div className="hx-admin-header__breadcrumb">
          <Link to="/rrhh/dashboard">{current.section}</Link>
          <i className="bi bi-chevron-right"></i>
          <strong>{current.title}</strong>
        </div>

        <div className="hx-admin-header__title-row">
          <div>
            <h1>{current.title}</h1>
            <p>{current.description}</p>
          </div>
        </div>
      </div>

      <div className="hx-admin-header__right">
        <form className="hx-admin-header__search" onSubmit={handleSearchSubmit}>
          <i className="bi bi-search"></i>

          <input
            type="text"
            placeholder="Buscar vacantes, candidatos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className="hx-admin-notifications" ref={notificationsRef}>
          <button
            type="button"
            className="hx-admin-header__icon-btn"
            title="Notificaciones"
            onClick={handleOpenNotifications}
          >
            <i className="bi bi-bell"></i>

            {unreadCount > 0 && (
              <span className="hx-admin-notifications__badge">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="hx-admin-notifications__dropdown">
              <div className="hx-admin-notifications__header">
                <div>
                  <strong>Notificaciones</strong>
                  <p>{unreadCount} sin leer</p>
                </div>

                {notifications.length > 0 && unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    className="hx-admin-notifications__mark-all"
                  >
                    Marcar todas
                  </button>
                )}
              </div>

              <div className="hx-admin-notifications__body">
                {loadingNotifications ? (
                  <div className="hx-admin-notifications__state">
                    Cargando notificaciones...
                  </div>
                ) : notificationsError ? (
                  <div className="hx-admin-notifications__state is-error">
                    {notificationsError}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="hx-admin-notifications__state">
                    No tienes notificaciones.
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      className={`hx-admin-notifications__item ${
                        notification.is_read ? "is-read" : "is-unread"
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="hx-admin-notifications__item-top">
                        <strong>{notification.title}</strong>

                        {!notification.is_read && (
                          <span className="hx-admin-notifications__dot"></span>
                        )}
                      </div>

                      <p>{notification.message}</p>

                      <span>
                        {formatNotificationDate(notification.created_at)}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          className="hx-admin-header__icon-btn"
          title="Configuración"
        >
          <i className="bi bi-gear"></i>
        </button>

        <div className="hx-admin-profile" ref={profileRef}>
          <button
            type="button"
            className="hx-admin-header__avatar"
            title={user?.email || "Usuario"}
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
          >
            {userInitial}
          </button>

          {profileOpen && (
            <div className="hx-admin-profile__dropdown">
              <div className="hx-admin-profile__header">
                <strong>{user?.email}</strong>
                <small>{user?.role}</small>
              </div>

              <Link
                to="/mi-perfil"
                className="hx-admin-profile__item"
                onClick={() => setProfileOpen(false)}
              >
                <i className="bi bi-person-circle"></i>
                Mi perfil
              </Link>

              <Link
                to="/rrhh/dashboard"
                className="hx-admin-profile__item"
                onClick={() => setProfileOpen(false)}
              >
                <i className="bi bi-speedometer2"></i>
                Dashboard
              </Link>

              <Link
                to="/rrhh/vacantes"
                className="hx-admin-profile__item"
                onClick={() => setProfileOpen(false)}
              >
                <i className="bi bi-briefcase"></i>
                Vacantes
              </Link>

              <Link
                to="/cambiar-password"
                className="hx-admin-profile__item"
                onClick={() => setProfileOpen(false)}
              >
                <i className="bi bi-key-fill"></i>
                Cambiar contraseña
              </Link>

              <button
                className="hx-admin-profile__logout"
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/");
                }}
              >
                <i className="bi bi-box-arrow-right"></i>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}