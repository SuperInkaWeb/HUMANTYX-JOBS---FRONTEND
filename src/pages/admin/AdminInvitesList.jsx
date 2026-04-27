import { useEffect, useMemo, useState } from "react";
import ConfirmModal from "../../components/profile/ConfirmModal";
import { apiFetch } from "../../services/api";
import "./admin-invites-list.css";

const ITEMS_PER_PAGE = 10;

function formatDate(dateString) {
  if (!dateString) return "—";

  const date = new Date(dateString);

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTime(dateString) {
  if (!dateString) return "—";

  const date = new Date(dateString);

  return new Intl.DateTimeFormat("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function getInitial(email) {
  return (email?.[0] || "I").toUpperCase();
}

function getInviteStatusMeta(status) {
  switch (status) {
    case "USED":
      return {
        label: "Usada",
        className: "ail-badge--used",
      };
    case "EXPIRED":
      return {
        label: "Expirada",
        className: "ail-badge--expired",
      };
    case "CANCELLED":
      return {
        label: "Cancelada",
        className: "ail-badge--cancelled",
      };
    default:
      return {
        label: "Pendiente",
        className: "ail-badge--pending",
      };
  }
}

function getInviteDescription(status) {
  switch (status) {
    case "USED":
      return "Invitación ya utilizada";
    case "EXPIRED":
      return "Invitación vencida";
    case "CANCELLED":
      return "Invitación cancelada";
    default:
      return "Invitación pendiente de uso";
  }
}

export default function AdminInvitesList() {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState(null);
  const [actionType, setActionType] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  async function loadInvites() {
    try {
      setLoading(true);
      setError("");

      const data = await apiFetch("/admin/users/user-invites");

      const normalized = Array.isArray(data)
        ? data
        : Array.isArray(data?.invites)
        ? data.invites
        : [];

      setInvites(normalized);
    } catch (err) {
      setError(err.message || "Error listando invitaciones");
      setInvites([]);
    } finally {
      setLoading(false);
    }
  }

  function openActionModal(invite, type) {
    setSelectedInvite(invite);
    setActionType(type);
    setConfirmOpen(true);
  }

  function askCancelInvite(invite) {
    openActionModal(invite, "cancel");
  }

  function askResendInvite(invite) {
    openActionModal(invite, "resend");
  }

  async function confirmInviteAction() {
    if (!selectedInvite || !actionType) return;

    try {
      setActionLoadingId(selectedInvite.id);
      setError("");
      setSuccessMessage("");

      if (actionType === "cancel") {
        await apiFetch(`/admin/users/user-invites/${selectedInvite.id}/cancel`, {
          method: "PATCH",
        });

        setSuccessMessage(
          `La invitación para ${selectedInvite.email} fue cancelada correctamente.`
        );
      }

      if (actionType === "resend") {
        await apiFetch(`/admin/users/user-invites/${selectedInvite.id}/resend`, {
          method: "POST",
        });

        setSuccessMessage(
          `La invitación para ${selectedInvite.email} fue reenviada correctamente.`
        );
      }

      setConfirmOpen(false);
      setSelectedInvite(null);
      setActionType("");

      await loadInvites();
    } catch (err) {
      setError(err.message || "No se pudo completar la acción sobre la invitación");
      setConfirmOpen(false);
      setSelectedInvite(null);
      setActionType("");
    } finally {
      setActionLoadingId(null);
    }
  }

  useEffect(() => {
    loadInvites();
  }, []);

  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
  if (!error) return;

  const timer = setTimeout(() => {
    setError("");
  }, 2000);

  return () => clearTimeout(timer);
}, [error]);

  const filteredInvites = useMemo(() => {
    const term = search.trim().toLowerCase();

    let list = invites;

    if (term) {
      list = list.filter((invite) => {
        return (
          (invite.email || "").toLowerCase().includes(term) ||
          (invite.role || "").toLowerCase().includes(term) ||
          (invite.status || "").toLowerCase().includes(term) ||
          (invite.invited_by_email || "").toLowerCase().includes(term)
        );
      });
    }

    if (statusFilter) {
      list = list.filter((invite) => invite.status === statusFilter);
    }

    return list;
  }, [invites, search, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredInvites.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedInvites = filteredInvites.slice(startIndex, endIndex);

  const confirmTitle =
    actionType === "cancel" ? "Cancelar invitación" : "Reenviar invitación";

  const confirmMessage = selectedInvite
    ? actionType === "cancel"
      ? `¿Estás seguro de que deseas cancelar la invitación enviada a ${selectedInvite.email}? Una vez cancelada, ya no podrá usarse para crear la cuenta.`
      : `¿Estás seguro de que deseas reenviar la invitación a ${selectedInvite.email}? Se generará una nueva invitación y se enviará un nuevo correo.`
    : "";

  const confirmText =
    actionType === "cancel" ? "Cancelar invitación" : "Reenviar invitación";

  return (
    <div className="ail-page">
      <div className="ail-header">
        <div className="ail-header__left">
          <h1>Invitaciones</h1>
          <p>
            Total de invitaciones registradas:{" "}
            <span>{invites.length.toLocaleString("es-PE")}</span>
          </p>
        </div>
      </div>

      <div className="ail-toolbar">
        <div className="ail-search">
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
            placeholder="Buscar invitaciones por correo, rol o estado..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="ail-filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="PENDING">Pendientes</option>
          <option value="USED">Usadas</option>
          <option value="EXPIRED">Expiradas</option>
          <option value="CANCELLED">Canceladas</option>
        </select>

        <div className="ail-toolbar__count">
          Mostrando {paginatedInvites.length} de {filteredInvites.length}
        </div>
      </div>

      {error && <div className="ail-alert ail-alert--error">{error}</div>}

      {successMessage && (
        <div className="ail-alert ail-alert--success">
          <i className="bi bi-check-circle-fill"></i>
          <span>{successMessage}</span>
        </div>
      )}

      <div className="ail-table-card">
        <div className="ail-table-wrap">
          <table className="ail-table">
            <thead>
              <tr>
                <th>Invitación</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Enviada por</th>
                <th>Fecha de envío</th>
                <th>Hora de envío</th>
                <th>Fecha de vencimiento</th>
                <th>Hora de vencimiento</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="ail-empty">
                    Cargando invitaciones...
                  </td>
                </tr>
              ) : paginatedInvites.length === 0 ? (
                <tr>
                  <td colSpan="10" className="ail-empty">
                    No hay invitaciones para mostrar.
                  </td>
                </tr>
              ) : (
                paginatedInvites.map((invite) => {
                  const statusMeta = getInviteStatusMeta(invite.status);

                  return (
                    <tr key={invite.id}>
                      <td>
                        <div className="ail-user">
                          <div className="ail-user__avatar">
                            {getInitial(invite.email)}
                          </div>

                          <div className="ail-user__info">
                            <strong>{invite.email || "Sin email"}</strong>
                            <span>{getInviteDescription(invite.status)}</span>
                          </div>
                        </div>
                      </td>

                      <td className="ail-cell-muted">{invite.email || "—"}</td>

                      <td className="ail-cell-muted">{invite.role || "—"}</td>

                      <td>
                        <span className={`ail-badge ${statusMeta.className}`}>
                          {statusMeta.label}
                        </span>
                      </td>

                      <td className="ail-cell-muted">
                        {invite.invited_by_email || "—"}
                      </td>

                      <td className="ail-cell-muted">
                        {formatDate(invite.created_at)}
                      </td>

                      <td className="ail-cell-muted">
                        {formatTime(invite.created_at)}
                      </td>

                      <td className="ail-cell-muted">
                        {formatDate(invite.expires_at)}
                      </td>

                      <td className="ail-cell-muted">
                        {formatTime(invite.expires_at)}
                      </td>

                      <td>
                        {invite.status === "PENDING" ? (
                          <button
                            type="button"
                            className="ail-btn-cancel"
                            onClick={() => askCancelInvite(invite)}
                            disabled={actionLoadingId === invite.id}
                          >
                            {actionLoadingId === invite.id
                              ? "Procesando..."
                              : "Cancelar"}
                          </button>
                        ) : invite.status === "EXPIRED" ||
                          invite.status === "CANCELLED" ? (
                          <button
                            type="button"
                            className="ail-btn-resend"
                            onClick={() => askResendInvite(invite)}
                            disabled={actionLoadingId === invite.id}
                          >
                            {actionLoadingId === invite.id
                              ? "Procesando..."
                              : "Reenviar"}
                          </button>
                        ) : (
                          <span className="ail-cell-muted">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="ail-footer ail-footer--with-pagination">
          <span>
            Página {safeCurrentPage} de {totalPages}
          </span>

          <div className="ail-pagination">
            <button
              type="button"
              className="ail-pagination__btn"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={safeCurrentPage === 1}
            >
              Anterior
            </button>

            <span className="ail-pagination__info">
              {startIndex + 1}-{Math.min(endIndex, filteredInvites.length)} de{" "}
              {filteredInvites.length}
            </span>

            <button
              type="button"
              className="ail-pagination__btn"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={safeCurrentPage === totalPages}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        confirmText={confirmText}
        cancelText="Volver"
        danger={actionType === "cancel"}
        onConfirm={confirmInviteAction}
        onCancel={() => {
          if (actionLoadingId) return;
          setConfirmOpen(false);
          setSelectedInvite(null);
          setActionType("");
        }}
      />
    </div>
  );
}