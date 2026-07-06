import { Link, useNavigate } from "react-router-dom";
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

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const role = (user?.role || "").trim().toUpperCase();
  const isAdmin = role === "ADMIN";
  const isRRHH = role === "RRHH";
  const isCandidate = role === "CANDIDATE";

  const profileIncomplete = isCandidate && user?.profile_complete === false;

  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");

  const menuRef = useRef(null);
  const notificationsRef = useRef(null);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    setNotificationsOpen(false);
    nav("/");
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
    setMenuOpen(false);

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
        nav(notification.link);
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
    if (!user) return;

    function handleVisibilityChange() {
      if (document.visibilityState !== "visible") return;

      loadUnreadCount();

      if (notificationsOpen) {
        loadNotifications({ silent: true });
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user, notificationsOpen, loadUnreadCount, loadNotifications]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }

      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(e.target)
      ) {
        setNotificationsOpen(false);
      }
    }

    function handleEscape(e) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setNotificationsOpen(false);
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
              src="/logo-oficial.png"
              alt="Humantyx Jobs"
              style={{ height: 120, width: "auto" }}
            />
          </Link>

          <div className="hx-navbar__links"></div>

          <div className="hx-navbar__actions">
            {!user && (
              <div className="hx-navbar__guest-links">
                <Link
                  to="/login"
                  className="hx-navbar__guest-link hx-navbar__guest-link--primary"
                >
                  Ingresar
                </Link>

                <span className="hx-navbar__guest-divider"></span>

                <Link to="/register" className="hx-navbar__guest-link">
                  Crear cuenta
                </Link>
              </div>
            )}

            {user && (
              <>
                <Link
                  to="/empleos"
                  className="hx-navbar__icon-link"
                  aria-label="Ir a empleos"
                  title="Ir a empleos"
                >
                  <i className="bi bi-briefcase-fill"></i>
                </Link>

                <div className="hx-notifications" ref={notificationsRef}>
                  <button
                    type="button"
                    className="hx-notifications__trigger"
                    onClick={handleOpenNotifications}
                    aria-label="Abrir notificaciones"
                  >
                    <i className="bi bi-bell-fill"></i>
                    {unreadCount > 0 && (
                      <span className="hx-notifications__badge">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {notificationsOpen && (
                    <div className="hx-notifications__dropdown">
                      <div className="hx-notifications__header">
                        <div>
                          <strong>Notificaciones</strong>
                          <p>{unreadCount} sin leer</p>
                        </div>

                        {notifications.length > 0 && unreadCount > 0 && (
                          <button
                            type="button"
                            className="hx-notifications__mark-all"
                            onClick={handleMarkAllAsRead}
                          >
                            Marcar todas
                          </button>
                        )}
                      </div>

                      <div className="hx-notifications__body">
                        {loadingNotifications ? (
                          <div className="hx-notifications__state">
                            Cargando notificaciones...
                          </div>
                        ) : notificationsError ? (
                          <div className="hx-notifications__state is-error">
                            {notificationsError}
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="hx-notifications__state">
                            No tienes notificaciones.
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <button
                              key={notification.id}
                              type="button"
                              className={`hx-notifications__item ${
                                notification.is_read ? "is-read" : "is-unread"
                              }`}
                              onClick={() => handleNotificationClick(notification)}
                            >
                              <div className="hx-notifications__item-top">
                                <strong>{notification.title}</strong>
                                {!notification.is_read && (
                                  <span className="hx-notifications__dot"></span>
                                )}
                              </div>

                              <p className="hx-notifications__message">
                                {notification.message}
                              </p>

                              <span className="hx-notifications__date">
                                {formatNotificationDate(notification.created_at)}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="hx-user-menu" ref={menuRef}>
                  <button
                    type="button"
                    className="hx-user-menu__trigger"
                    onClick={() => {
                      setMenuOpen((v) => !v);
                      setNotificationsOpen(false);
                    }}
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
                        {(isCandidate || isRRHH || isAdmin) && (
                          <Link
                            to="/mi-perfil"
                            className="hx-user-menu__item"
                            onClick={() => setMenuOpen(false)}
                          >
                            <i className="bi bi-person-circle"></i>
                            <span>Mi perfil</span>
                          </Link>
                        )}

                        {isCandidate && (
                          <>
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
                            <Link
                              to="/rrhh/dashboard"
                              className="hx-user-menu__item"
                              onClick={() => setMenuOpen(false)}
                            >
                              <i className="bi bi-speedometer2"></i>
                              <span>Panel de control</span>
                            </Link>
                          )}

                        <Link
                          to="/cambiar-password"
                          className="hx-user-menu__item"
                          onClick={() => setMenuOpen(false)}
                        >
                          <i className="bi bi-key-fill"></i>
                          <span>Gestionar contraseña</span>
                        </Link>

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
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}