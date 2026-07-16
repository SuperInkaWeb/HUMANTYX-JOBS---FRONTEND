import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import { markNotificationsAsReadByContext } from "../../services/api";
import { useJobApplications } from "../../hooks/useJobApplications";
import ApplicationDetailDrawer from "../../components/admin/applications/ApplicationDetailDrawer";
import "./admin-job-applications.css";

import ApplicationsList from "../../components/admin/applications/ApplicationsList";
import ApplicationsKanban from "../../components/admin/applications/ApplicationsKanban";
import ApplicationMessagesModal from "../../components/messages/ApplicationMessagesModal";
import StatusDropdownBase from "../../components/admin/applications/StatusDropdown";

import {
  getAdminApplicationMessages,
  sendAdminApplicationMessage,
} from "../../services/api";

const STATUS_META = {
  APPLIED: { label: "Postuló", cls: "is-applied" },
  IN_REVIEW: { label: "En revisión", cls: "is-review" },
  INTERVIEW: { label: "Entrevista", cls: "is-interview" },
  REJECTED: { label: "No Seleccionado", cls: "is-rejected" },
  HIRED: { label: "Contratado", cls: "is-hired" },
};

const STATUS_ORDER = ["APPLIED", "IN_REVIEW", "INTERVIEW", "REJECTED", "HIRED"];

const STATUS_FILTERS = [
  { key: "ALL", label: "Todos" },
  { key: "APPLIED", label: "Postuló" },
  { key: "IN_REVIEW", label: "En revisión" },
  { key: "INTERVIEW", label: "Entrevista" },
  { key: "REJECTED", label: "No seleccionado" },
  { key: "HIRED", label: "Contratado" },
];

const CHAT_POLL_MS = 5000;
const LIST_POLL_MS = 15000;

function formatDate(value) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function formatRelativeDate(value) {
  if (!value) return "Sin fecha";

  const date = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "Postuló hace unos segundos";
  if (diffMinutes < 60) return `Postuló hace ${diffMinutes} min`;
  if (diffHours < 24) return `Postuló hace ${diffHours} h`;
  if (diffDays === 1) return "Postuló ayer";

  return `Postuló hace ${diffDays} días`;
}

function getApplicationDate(row) {
  return (
    row?.application_created_at ||
    row?.applied_at ||
    row?.created_at ||
    row?.application_date ||
    null
  );
}

function getInitials(firstName, lastName, email) {
  const fullName = `${firstName || ""} ${lastName || ""}`.trim();

  if (fullName) {
    return fullName
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("");
  }

  if (email) return email.slice(0, 2).toUpperCase();

  return "—";
}

function getUnreadCount(value) {
  return Number(value) || 0;
}

function getAdminChatButtonLabel(row) {
  if (!row?.has_conversation) return "Enviar mensaje";
  return "Ver chat";
}

function StatusDropdown(props) {
  return (
    <StatusDropdownBase
      {...props}
      statusMeta={STATUS_META}
      statusOrder={STATUS_ORDER}
    />
  );
}

function CvPreviewModal({
  open,
  title,
  blobUrl,
  loading,
  error,
  downloading,
  onClose,
  onDownload,
}) {
  const [frameReady, setFrameReady] = useState(false);

  useEffect(() => {
    if (!open) return;

    document.body.classList.add("hja-modal-open");

    return () => {
      document.body.classList.remove("hja-modal-open");
    };
  }, [open]);

  useEffect(() => {
    setFrameReady(false);
  }, [blobUrl]);

  if (!open) return null;

  const canDownload = !loading && !error && !!blobUrl;

  return createPortal(
    <div className="hja-modal-backdrop">
      <div
        className="hja-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Previsualización de CV"
      >
        <div className="hja-modal__header">
          <div className="hja-modal__title-wrap">
            <h2 className="hja-modal__title">Previsualización de CV</h2>
            <p className="hja-modal__subtitle">{title}</p>
          </div>

          <button
            type="button"
            className="hja-modal__close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="hja-modal__body">
          {loading && (
            <div className="hja-modal__loading">
              <div className="hja-modal__spinner"></div>
              <span>Cargando vista previa del CV...</span>
            </div>
          )}

          {!loading && error && (
            <div className="hja-modal__error">
              <i className="bi bi-exclamation-triangle"></i>
              <div>
                <strong>No se pudo cargar la vista previa.</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && blobUrl && (
            <>
              {!frameReady && (
                <div className="hja-modal__loading">
                  <div className="hja-modal__spinner"></div>
                  <span>Preparando documento...</span>
                </div>
              )}

              <iframe
                title="Vista previa del CV"
                src={blobUrl}
                className={`hja-modal__iframe ${
                  !frameReady ? "is-hidden" : ""
                }`}
                onLoad={() => setFrameReady(true)}
              />
            </>
          )}
        </div>

        <div className="hja-modal__footer">
          <div className="hja-modal__footer-actions">
            <button
              type="button"
              className="hja-btn hja-btn--primary hja-btn--download"
              onClick={onDownload}
              disabled={!canDownload || downloading}
            >
              <i
                className={`bi ${
                  downloading ? "bi-hourglass-split" : "bi-download"
                }`}
              ></i>
              <span>{downloading ? "Descargando..." : "Descargar CV"}</span>
            </button>

            <button
              type="button"
              className="hja-btn hja-btn--ghost"
              onClick={onClose}
              disabled={downloading}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function AdminJobApplications() {
  const { id: jobId } = useParams();

  const {
    job,
    rows,
    loading,
    error,
    msg,
    searchTerm,
    setSearchTerm,
    activeStatusFilter,
    setActiveStatusFilter,
    updatingId,
    statusCounts,
    filteredRows,
    groupedRows,
    total,
    visibleTotal,
    loadAll,
    updateStatus,
    getPendingStatus,
    handleDraftStatusChange,
    saveDraftStatus,
    cancelDraftStatus,
  } = useJobApplications({
    jobId,
    statusMeta: STATUS_META,
    statusOrder: STATUS_ORDER,
    getApplicationDate,
  });

  const [viewMode, setViewMode] = useState("LIST");
  const [selectedApplicationDetail, setSelectedApplicationDetail] =
    useState(null);

  const [previewCv, setPreviewCv] = useState({
    open: false,
    candidateId: null,
    candidateName: "",
    email: "",
  });

  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [previewBlobUrl, setPreviewBlobUrl] = useState("");
  const [previewFileName, setPreviewFileName] = useState("cv.pdf");
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [openingPreviewId, setOpeningPreviewId] = useState(null);

  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesSending, setMessagesSending] = useState(false);
  const [messagesError, setMessagesError] = useState("");
  const [selectedApplicationForMessages, setSelectedApplicationForMessages] =
    useState(null);
  const [messagesConversation, setMessagesConversation] = useState(null);
  const [messagesList, setMessagesList] = useState([]);
  const [messagesPermissions, setMessagesPermissions] = useState({
    can_send: false,
  });
  const [messagesApplicationInfo, setMessagesApplicationInfo] = useState(null);

  const loadApplicationMessages = useCallback(
    async (applicationId, { silent = false } = {}) => {
      if (!applicationId) return;

      if (!silent) {
        setMessagesLoading(true);
        setMessagesError("");
      }

      try {
        const data = await getAdminApplicationMessages(applicationId);

        setMessagesConversation(data.conversation || null);
        setMessagesList(Array.isArray(data.messages) ? data.messages : []);
        setMessagesPermissions(data.permissions || { can_send: false });
        setMessagesApplicationInfo(data.application || null);
      } catch (err) {
        if (!silent) {
          setMessagesError(err.message || "No se pudieron cargar los mensajes");
          setMessagesConversation(null);
          setMessagesList([]);
          setMessagesPermissions({ can_send: false });
          setMessagesApplicationInfo(null);
        }
      } finally {
        if (!silent) {
          setMessagesLoading(false);
        }
      }
    },
    []
  );

  async function handleOpenMessages(applicationRow) {
    setSelectedApplicationForMessages(applicationRow);
    setShowMessagesModal(true);

    try {
      await markNotificationsAsReadByContext({
        type: "NEW_MESSAGE",
        application_id: applicationRow.application_id,
      });
    } catch {
      // silencioso
    }

    await loadApplicationMessages(applicationRow.application_id);
    await loadAll(true);
  }

  function handleCloseMessages() {
    setShowMessagesModal(false);
    setMessagesError("");
    setMessagesConversation(null);
    setMessagesList([]);
    setMessagesPermissions({ can_send: false });
    setMessagesApplicationInfo(null);
    setSelectedApplicationForMessages(null);
  }

  async function handleSendMessage(messageText) {
    if (!selectedApplicationForMessages?.application_id) return;

    setMessagesSending(true);
    setMessagesError("");

    try {
      await sendAdminApplicationMessage(
        selectedApplicationForMessages.application_id,
        messageText
      );

      await loadApplicationMessages(
        selectedApplicationForMessages.application_id
      );
      await loadAll(true);
    } catch (err) {
      setMessagesError(err.message || "No se pudo enviar el mensaje");
    } finally {
      setMessagesSending(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (!showMessagesModal || !selectedApplicationForMessages?.application_id) {
      return;
    }

    async function pollChat() {
      if (document.visibilityState !== "visible") return;

      await loadApplicationMessages(
        selectedApplicationForMessages.application_id,
        { silent: true }
      );

      await loadAll(true);
    }

    const interval = setInterval(pollChat, CHAT_POLL_MS);

    return () => clearInterval(interval);
  }, [
    showMessagesModal,
    selectedApplicationForMessages?.application_id,
    loadApplicationMessages,
    loadAll,
  ]);

  useEffect(() => {
    async function pollList() {
      if (document.visibilityState !== "visible") return;
      if (showMessagesModal) return;

      await loadAll(true);
    }

    const interval = setInterval(pollList, LIST_POLL_MS);

    return () => clearInterval(interval);
  }, [showMessagesModal, loadAll]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState !== "visible") return;
      loadAll(true);
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadAll]);

  useEffect(() => {
    return () => {
      if (previewBlobUrl) {
        URL.revokeObjectURL(previewBlobUrl);
      }
    };
  }, [previewBlobUrl]);

  function getSafeFileNameFromHeaders(
    contentDisposition,
    fallbackName = "cv.pdf"
  ) {
    if (!contentDisposition) return fallbackName;

    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);

    if (utf8Match?.[1]) {
      return decodeURIComponent(utf8Match[1]).replace(/["]/g, "");
    }

    const normalMatch = contentDisposition.match(/filename="?([^"]+)"?/i);

    if (normalMatch?.[1]) {
      return normalMatch[1];
    }

    return fallbackName;
  }

  async function fetchPreviewBlob(candidateId) {
    const token = localStorage.getItem("token") || "";
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000";

    const response = await fetch(
      `${apiBase}/admin/jobs/${jobId}/candidates/${candidateId}/cv/preview`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      let message = "No se pudo cargar el CV.";

      if (contentType.includes("application/json")) {
        const data = await response.json();
        message = data?.message || message;
      } else {
        const text = await response.text();
        if (text) message = text;
      }

      throw new Error(message);
    }

    const blob = await response.blob();
    const fileName = getSafeFileNameFromHeaders(
  response.headers.get("content-disposition"),
  ""
);

    return {
  blobUrl: URL.createObjectURL(blob),
  fileName: fileName || null,
};
  }

  async function downloadCvFile(candidateId, fallbackName) {
    const token = localStorage.getItem("token") || "";
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000";

    const response = await fetch(
      `${apiBase}/admin/jobs/${jobId}/candidates/${candidateId}/cv`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
  let message = "No se pudo descargar el CV.";

  if (contentType.includes("application/json")) {
    const data = await response.json();

    switch (data?.code) {
      case "CV_FILE_NOT_FOUND":
        message =
          "El CV está registrado, pero el archivo ya no existe en el servidor.";
        break;

      case "CV_NOT_REGISTERED":
        message = "Este postulante aún no ha subido un CV.";
        break;

      default:
        message = data?.message || message;
    }
  } else {
    const text = await response.text();
    if (text) message = text;
  }

  throw new Error(message);
}

    const blob = await response.blob();

    const fileName = getSafeFileNameFromHeaders(
      response.headers.get("content-disposition"),
      fallbackName || "cv.pdf"
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = fileName;

    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  }

  async function handleOpenPreview(candidate) {
    if (openingPreviewId || previewLoading || downloadLoading) return;

    const fullName =
      `${candidate.first_name ?? ""} ${candidate.last_name ?? ""}`.trim() ||
      "Candidato";

    if (previewBlobUrl) {
      URL.revokeObjectURL(previewBlobUrl);
      setPreviewBlobUrl("");
    }

    setOpeningPreviewId(candidate.candidate_id);
    setPreviewError("");
    setPreviewLoading(true);
    setPreviewFileName("");
    setDownloadLoading(false);

    setPreviewCv({
      open: true,
      candidateId: candidate.candidate_id,
      candidateName: fullName,
      email: candidate.email || "",
    });

    try {
      const { blobUrl, fileName } = await fetchPreviewBlob(
        candidate.candidate_id
      );

      setPreviewBlobUrl(blobUrl);
      setPreviewFileName(fileName || "CV.pdf");
    } catch (e) {
      setPreviewError(
        e.message || "No se pudo cargar la vista previa del CV."
      );
    } finally {
      setPreviewLoading(false);
      setOpeningPreviewId(null);
    }
  }

  async function handleDownloadPreviewCv() {
    if (!previewCv.candidateId || downloadLoading) return;

    try {
      setPreviewError("");
      setDownloadLoading(true);

      await downloadCvFile(previewCv.candidateId, previewFileName);
    } catch (e) {
      setPreviewError(e.message || "No se pudo descargar el CV.");
    } finally {
      setDownloadLoading(false);
    }
  }

  function handleClosePreview() {
    if (downloadLoading) return;

    if (previewBlobUrl) {
      URL.revokeObjectURL(previewBlobUrl);
    }

    setPreviewBlobUrl("");
    setPreviewFileName("cv.pdf");
    setPreviewError("");
    setPreviewLoading(false);
    setDownloadLoading(false);
    setOpeningPreviewId(null);

    setPreviewCv({
      open: false,
      candidateId: null,
      candidateName: "",
      email: "",
    });
  }

  function handleOpenApplicationDetail(row) {
    setSelectedApplicationDetail(row);
  }

  function handleCloseApplicationDetail() {
    setSelectedApplicationDetail(null);
  }

  return (
    <div className="hja-page">
      <div className="hja-header">
        <div className="hja-header__left">
          <h1>Postulantes</h1>

          <div className="hja-job-meta">
            <span className="hja-job-meta__badge">Vacante</span>
            <span className="hja-job-meta__title">
              {job?.title || `ID ${jobId}`}
            </span>
          </div>
        </div>

        <div className="hja-header__right">
          <Link to="/rrhh/vacantes" className="hja-btn hja-btn--ghost">
            <i className="bi bi-arrow-left"></i>
            <span>Volver</span>
          </Link>

          <button
            type="button"
            className="hja-btn hja-btn--primary"
            onClick={() => loadAll()}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise"></i>
            <span>Recargar</span>
          </button>
        </div>
      </div>

      {!loading && rows.length > 0 && (
        <div className="hja-toolbar">
          <div className="hja-search">
            <i className="bi bi-search"></i>

            <input
              type="text"
              placeholder="Buscar por nombre, correo, teléfono o estado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {searchTerm && (
              <button
                type="button"
                className="hja-search__clear"
                onClick={() => setSearchTerm("")}
                aria-label="Limpiar búsqueda"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </div>

          <div className="hja-view-toggle">
            <button
              type="button"
              className={`hja-view-btn ${
                viewMode === "LIST" ? "is-active" : ""
              }`}
              onClick={() => setViewMode("LIST")}
            >
              <i className="bi bi-list-ul"></i>
              <span>Lista</span>
            </button>

            <button
              type="button"
              className={`hja-view-btn ${
                viewMode === "KANBAN" ? "is-active" : ""
              }`}
              onClick={() => setViewMode("KANBAN")}
            >
              <i className="bi bi-kanban"></i>
              <span>Kanban</span>
            </button>
          </div>

          <div className="hja-filter-group">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.key}
                type="button"
                className={`hja-filter-chip ${
                  activeStatusFilter === filter.key ? "is-active" : ""
                }`}
                onClick={() => setActiveStatusFilter(filter.key)}
              >
                <span>{filter.label}</span>
                <strong>{statusCounts[filter.key] || 0}</strong>
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && <div className="hja-feedback">Cargando postulantes...</div>}
      {error && <div className="alert alert-danger hja-alert">{error}</div>}
      {msg && <div className="alert alert-success hja-alert">{msg}</div>}

      {!loading && rows.length === 0 && (
        <div className="hja-empty-card">
          <div className="hja-empty-card__icon">
            <i className="bi bi-people"></i>
          </div>

          <h3>Aún no hay postulaciones para esta vacante</h3>

          <p>
            Cuando los candidatos postulen, aparecerán aquí para que puedas
            revisar su perfil, su CV y gestionar su estado.
          </p>
        </div>
      )}

      {!loading && rows.length > 0 && filteredRows.length === 0 && (
        <div className="hja-empty-card">
          <div className="hja-empty-card__icon">
            <i className="bi bi-search"></i>
          </div>

          <h3>No hay postulantes que coincidan</h3>

          <p>
            Prueba con otro término de búsqueda o cambia el filtro de estado.
          </p>
        </div>
      )}

      {!loading && filteredRows.length > 0 && (
        <>
          {viewMode === "LIST" ? (
            <ApplicationsList
              rows={filteredRows}
              jobId={jobId}
              updatingId={updatingId}
              openingPreviewId={openingPreviewId}
              previewLoading={previewLoading}
              StatusDropdown={StatusDropdown}
              getPendingStatus={getPendingStatus}
              getInitials={getInitials}
              getUnreadCount={getUnreadCount}
              getApplicationDate={getApplicationDate}
              formatDate={formatDate}
              formatRelativeDate={formatRelativeDate}
              getAdminChatButtonLabel={getAdminChatButtonLabel}
              onDraftStatusChange={handleDraftStatusChange}
              onSaveDraftStatus={saveDraftStatus}
              onCancelDraftStatus={cancelDraftStatus}
              onOpenPreview={handleOpenPreview}
              onOpenMessages={handleOpenMessages}
              onOpenApplicationDetail={handleOpenApplicationDetail}
            />
          ) : (
            <ApplicationsKanban
              groupedRows={groupedRows}
              STATUS_ORDER={STATUS_ORDER}
              STATUS_META={STATUS_META}
              jobId={jobId}
              updatingId={updatingId}
              openingPreviewId={openingPreviewId}
              previewLoading={previewLoading}
              StatusDropdown={StatusDropdown}
              getPendingStatus={getPendingStatus}
              getInitials={getInitials}
              getUnreadCount={getUnreadCount}
              getApplicationDate={getApplicationDate}
              formatDate={formatDate}
              formatRelativeDate={formatRelativeDate}
              getAdminChatButtonLabel={getAdminChatButtonLabel}
              onDraftStatusChange={handleDraftStatusChange}
              onSaveDraftStatus={saveDraftStatus}
              onCancelDraftStatus={cancelDraftStatus}
              onOpenPreview={handleOpenPreview}
              onOpenMessages={handleOpenMessages}
              onMoveApplication={updateStatus}
              onOpenApplicationDetail={handleOpenApplicationDetail}
            />
          )}

          <div className="hja-footer">
            <span>
              Mostrando {visibleTotal} de {total}{" "}
              {total === 1 ? "postulante" : "postulantes"}
            </span>
          </div>
        </>
      )}

      <CvPreviewModal
        open={previewCv.open}
        title={previewCv.candidateName}
        blobUrl={previewBlobUrl}
        loading={previewLoading}
        error={previewError}
        downloading={downloadLoading}
        onClose={handleClosePreview}
        onDownload={handleDownloadPreviewCv}
      />

      <ApplicationMessagesModal
        show={showMessagesModal}
        mode="admin"
        title="Mensajes con postulante"
        application={messagesApplicationInfo}
        conversation={messagesConversation}
        messages={messagesList}
        canSend={!!messagesPermissions?.can_send}
        loading={messagesLoading}
        sending={messagesSending}
        error={messagesError}
        onClose={handleCloseMessages}
        onSend={handleSendMessage}
      />

      <ApplicationDetailDrawer
        open={!!selectedApplicationDetail}
        row={selectedApplicationDetail}
        onClose={handleCloseApplicationDetail}
        getInitials={getInitials}
        getApplicationDate={getApplicationDate}
        formatDate={formatDate}
        formatRelativeDate={formatRelativeDate}
        onOpenPreview={handleOpenPreview}
        onOpenMessages={handleOpenMessages}
      />
    </div>
  );
}