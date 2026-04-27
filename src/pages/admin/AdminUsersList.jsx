import { useEffect, useMemo, useState } from "react";
import ConfirmModal from "../../components/profile/ConfirmModal";
import { apiFetch } from "../../services/api";
import "./admin-users-list.css";

function formatDate(dateString) {
  if (!dateString) return "—";

  const date = new Date(dateString);

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getInitial(email) {
  return (email?.[0] || "U").toUpperCase();
}

export default function AdminUsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
  if (!successMessage) return;

  const timer = setTimeout(() => {
    setSuccessMessage("");
  }, 1000);

  return () => clearTimeout(timer);
}, [successMessage]);

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const data = await apiFetch("/admin/users?role=RRHH");

      const normalized = Array.isArray(data)
        ? data
        : Array.isArray(data?.users)
        ? data.users
        : [];

      setUsers(normalized);
    } catch (err) {
      setError(err.message || "Error listando usuarios RRHH");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  function askToggleUserStatus(user) {
    setSelectedUser(user);
    setConfirmOpen(true);
  }

  async function confirmToggleUserStatus() {
    if (!selectedUser) return;

    const nextIsActive = !selectedUser.is_active;

    try {
      setActionLoadingId(selectedUser.id);
      setError("");
      setSuccessMessage("");

      const data = await apiFetch(`/admin/users/${selectedUser.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          is_active: nextIsActive,
        }),
      });

      setUsers((prev) =>
        prev.map((item) => (item.id === selectedUser.id ? data.user : item))
      );

      setSuccessMessage(
        nextIsActive
          ? `El usuario ${selectedUser.email} fue habilitado correctamente.`
          : `El usuario ${selectedUser.email} fue deshabilitado correctamente.`
      );

      setConfirmOpen(false);
      setSelectedUser(null);
    } catch (err) {
      setError(err.message || "No se pudo actualizar el estado del usuario");
      setConfirmOpen(false);
      setSelectedUser(null);
    } finally {
      setActionLoadingId(null);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return users;

    return users.filter((user) => {
      return (
        (user.email || "").toLowerCase().includes(term) ||
        (user.role || "").toLowerCase().includes(term)
      );
    });
  }, [users, search]);

  return (
    <div className="aul-page">
      <div className="aul-header">
        <div className="aul-header__left">
          <h1>Usuarios RRHH</h1>
          <p>
            Total de cuentas RRHH registradas:{" "}
            <span>{users.length.toLocaleString("es-PE")}</span>
          </p>
        </div>
      </div>

      <div className="aul-toolbar">
        <div className="aul-search">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>

          <input
            type="text"
            placeholder="Buscar usuarios RRHH por correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="aul-toolbar__count">
          Mostrando {filteredUsers.length} de {users.length}
        </div>
      </div>

      {error && <div className="aul-alert aul-alert--error">{error}</div>}

      {successMessage && (
        <div className="aul-alert aul-alert--success">
          <i className="bi bi-check-circle-fill"></i>
          <span>{successMessage}</span>
        </div>
      )}

      <div className="aul-table-card">
        <div className="aul-table-wrap">
          <table className="aul-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Fecha de registro</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="aul-empty">
                    Cargando usuarios...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="aul-empty">
                    No hay usuarios RRHH para mostrar.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="aul-user">
                        <div className="aul-user__avatar">
                          {getInitial(user.email)}
                        </div>

                        <div className="aul-user__info">
                          <strong>{user.email || "Sin email"}</strong>
                          <span>
                            {user.is_active
                              ? "Cuenta habilitada"
                              : "Cuenta deshabilitada"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="aul-cell-muted">{user.email || "—"}</td>

                    <td className="aul-cell-muted">{user.role || "—"}</td>

                    <td>
                      <span
                        className={`aul-badge ${
                          user.is_active
                            ? "aul-badge--active"
                            : "aul-badge--inactive"
                        }`}
                      >
                        {user.is_active ? "Activo" : "Deshabilitado"}
                      </span>
                    </td>

                    <td className="aul-cell-muted">
                      {formatDate(user.created_at)}
                    </td>

                    <td>
                      <button
                        type="button"
                        className={`aul-action-btn ${
                          user.is_active
                            ? "aul-action-btn--danger"
                            : "aul-action-btn--success"
                        }`}
                        onClick={() => askToggleUserStatus(user)}
                        disabled={actionLoadingId === user.id}
                      >
                        {actionLoadingId === user.id
                          ? "Guardando..."
                          : user.is_active
                          ? "Deshabilitar"
                          : "Habilitar"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="aul-footer">
          <span>
            Mostrando {filteredUsers.length}{" "}
            {filteredUsers.length === 1 ? "resultado" : "resultados"}
          </span>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        title={
          selectedUser?.is_active
            ? "Deshabilitar usuario RRHH"
            : "Habilitar usuario RRHH"
        }
        message={
          selectedUser
            ? selectedUser.is_active
              ? `¿Estás seguro de que deseas deshabilitar al usuario ${selectedUser.email}? Mientras esté deshabilitado, no podrá iniciar sesión.`
              : `¿Estás seguro de que deseas habilitar al usuario ${selectedUser.email}? Una vez habilitado, podrá volver a iniciar sesión.`
            : ""
        }
        confirmText={selectedUser?.is_active ? "Deshabilitar" : "Habilitar"}
        cancelText="Cancelar"
        danger={!!selectedUser?.is_active}
        onConfirm={confirmToggleUserStatus}
        onCancel={() => {
          if (actionLoadingId) return;
          setConfirmOpen(false);
          setSelectedUser(null);
        }}
      />
    </div>
  );
}