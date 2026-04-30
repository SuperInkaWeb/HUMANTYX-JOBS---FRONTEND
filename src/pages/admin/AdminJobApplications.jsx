import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import { apiFetch, markNotificationsAsReadByContext } from "../../services/api";
import "./admin-job-applications.css";

import ApplicationMessagesModal from "../../components/messages/ApplicationMessagesModal";
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
const CHAT_POLL_MS = 5000;
const LIST_POLL_MS = 15000;

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

function StatusDropdown({ value, onChange, disabled }) {
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 240 });

  const meta = STATUS_META[value] || { label: value ?? "—", cls: "" };

  function calcPos() {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();

    const width = Math.max(220, r.width);
    const left = Math.min(Math.max(8, r.left), window.innerWidth - width - 8);
    const top = r.bottom + 8;

    setPos({ top, left, width });
  }

  useEffect(() => {
    if (!open) return;
    calcPos();

    const onResize = () => calcPos();
    const onScroll = () => calcPos();

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onDocClick(e) {
      const btn = btnRef.current;
      const menu = menuRef.current;
      if (!btn || !menu) return;

      if (btn.contains(e.target) || menu.contains(e.target)) return;
      setOpen(false);
    }

    function onEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);

    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const menu = open
    ? createPortal(
        <div
          ref={menuRef}
          className="hja-status-menu"
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            width: pos.width,
            zIndex: 9999,
          }}
        >
          <div className="hja-status-menu__title">Cambiar estado</div>

          {STATUS_ORDER.map((k) => {
            const m = STATUS_META[k];
            const isSelected = k === value;

            return (
              <button
                key={k}
                type="button"
                onClick={() => {
                  if (disabled) return;
                  if (k === value) {
                    setOpen(false);
                    return;
                  }
                  onChange(k);
                  setOpen(false);
                }}
                disabled={disabled}
                className={`hja-status-menu__item ${
                  isSelected ? "is-selected" : ""
                }`}
              >
                <span className={`hja-status-menu__dot ${m.cls}`}></span>
                <span className="hja-status-menu__label">{m.label}</span>

                {isSelected && (
                  <span className="hja-status-menu__current">Actual</span>
                )}
              </button>
            );
          })}
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className={`hja-status-trigger ${meta.cls}`}
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
      >
        <span>{meta.label}</span>
        <i className="bi bi-chevron-down"></i>
      </button>

      {menu}
    </>
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

  const [job, setJob] = useState(null);
  const [rows, setRows] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const [updatingId, setUpdatingId] = useState(null);
  const [pendingStatusByApp, setPendingStatusByApp] = useState({});

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

  const total = useMemo(() => rows.length, [rows]);

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

      await loadApplicationMessages(selectedApplicationForMessages.application_id);
      await loadAll(true);
    } catch (err) {
      setMessagesError(err.message || "No se pudo enviar el mensaje");
    } finally {
      setMessagesSending(false);
    }
  }

  const loadAll = useCallback(
    async (silent = false) => {
      try {
        if (!silent) {
          setError("");
          setMsg("");
          setLoading(true);
        }

        const apps = await apiFetch(`/admin/jobs/${jobId}/applications`);
        const list = apps?.applications ?? apps ?? [];
        setRows(Array.isArray(list) ? list : []);

        if (!silent) {
          setPendingStatusByApp({});
        }

        try {
          const j = await apiFetch(`/admin/jobs/${jobId}`);
          setJob(j?.job ?? j ?? null);
        } catch {
          setJob(null);
        }
      } catch (e) {
        if (!silent) {
          setError(e.message || "No se pudieron cargar los postulantes");
          setRows([]);
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [jobId]
  );

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (!showMessagesModal || !selectedApplicationForMessages?.application_id)
      return;

    async function pollChat() {
      if (document.visibilityState !== "visible") return;

      await loadApplicationMessages(
        selectedApplicationForMessages.application_id,
        {
          silent: true,
        }
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

  async function updateStatus(applicationId, status) {
    try {
      setError("");
      setMsg("");
      setUpdatingId(applicationId);

      await apiFetch(`/admin/applications/${applicationId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      setMsg("✅ Estado de postulación actualizado.");
      setRows((prev) =>
        prev.map((r) =>
          r.application_id === applicationId
            ? { ...r, application_status: status }
            : r
        )
      );

      return true;
    } catch (e) {
      setError(e.message || "No se pudo actualizar el estado");
      return false;
    } finally {
      setUpdatingId(null);
    }
  }

  function getPendingStatus(applicationId, currentStatus) {
    const draft = pendingStatusByApp[applicationId];
    if (!draft || draft === currentStatus) return null;
    return draft;
  }

  function handleDraftStatusChange(applicationId, nextStatus, currentStatus) {
    setError("");
    setMsg("");

    setPendingStatusByApp((prev) => {
      const copy = { ...prev };

      if (!nextStatus || nextStatus === currentStatus) {
        delete copy[applicationId];
        return copy;
      }

      copy[applicationId] = nextStatus;
      return copy;
    });
  }

  function cancelDraftStatus(applicationId) {
    setPendingStatusByApp((prev) => {
      const copy = { ...prev };
      delete copy[applicationId];
      return copy;
    });
  }

  async function saveDraftStatus(applicationId) {
    const nextStatus = pendingStatusByApp[applicationId];
    if (!nextStatus) return;

    const ok = await updateStatus(applicationId, nextStatus);
    if (!ok) return;

    setPendingStatusByApp((prev) => {
      const copy = { ...prev };
      delete copy[applicationId];
      return copy;
    });
  }

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
      "cv.pdf"
    );

    return {
      blobUrl: URL.createObjectURL(blob),
      fileName,
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

    setError("");
    setMsg("");

    if (previewBlobUrl) {
      URL.revokeObjectURL(previewBlobUrl);
      setPreviewBlobUrl("");
    }

    setOpeningPreviewId(candidate.candidate_id);
    setPreviewError("");
    setPreviewLoading(true);
    setPreviewFileName("cv.pdf");
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
      setPreviewFileName(fileName);
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

      {!loading && rows.length > 0 && (
        <>
          <div className="hja-cards">
            {rows.map((r) => {
              const fullName =
                `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim() || "—";

              const disabledStatus = updatingId === r.application_id;
              const openingThisPreview = openingPreviewId === r.candidate_id;
              const unreadCount = getUnreadCount(r.unread_messages_count);

              const pendingStatus = getPendingStatus(
                r.application_id,
                r.application_status
              );

              const displayStatus = pendingStatus || r.application_status;
              const hasPendingStatusChange = Boolean(pendingStatus);

              return (
                <article key={r.application_id} className="hja-app-card">
                  <div className="hja-app-card__main">
                    <div className="hja-candidate">
                      <div className="hja-candidate__avatar">
                        {getInitials(r.first_name, r.last_name, r.email)}
                      </div>

                      <div className="hja-candidate__info">
                        <h3>{fullName}</h3>
                        <p>Postulante</p>
                      </div>
                    </div>

                    <div className="hja-app-card__contact">
                      <div className="hja-contact-item">
                        <i className="bi bi-envelope-fill"></i>
                        <span>{r.email ?? "—"}</span>
                      </div>

                      <div className="hja-contact-item">
                        <i className="bi bi-telephone-fill"></i>
                        <span>{r.phone ?? "—"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="hja-app-card__side">
                    <div className="hja-status-stack">
                      <StatusDropdown
                        value={displayStatus}
                        onChange={(next) =>
                          handleDraftStatusChange(
                            r.application_id,
                            next,
                            r.application_status
                          )
                        }
                        disabled={disabledStatus}
                      />

                      {hasPendingStatusChange && (
                        <div className="hja-status-pending-box">
                          <div className="hja-status-pending-box__actions">
                            <button
                              type="button"
                              className="hja-inline-btn hja-inline-btn--primary"
                              onClick={() => saveDraftStatus(r.application_id)}
                              disabled={disabledStatus}
                            >
                              {disabledStatus ? "Guardando..." : "Guardar"}
                            </button>

                            <button
                              type="button"
                              className="hja-inline-btn hja-inline-btn--ghost"
                              onClick={() =>
                                cancelDraftStatus(r.application_id)
                              }
                              disabled={disabledStatus}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="hja-actions">
                      <Link
                        to={`/rrhh/vacantes/${jobId}/postulantes/${r.candidate_id}/perfil`}
                        className="hja-icon-action"
                        title="Ver perfil"
                        aria-label="Ver perfil"
                      >
                        <i className="bi bi-person-badge-fill"></i>
                      </Link>

                      <button
                        type="button"
                        className="hja-icon-action"
                        onClick={() => handleOpenPreview(r)}
                        title="Ver CV"
                        aria-label="Ver CV"
                        disabled={openingThisPreview || previewLoading}
                      >
                        <i
                          className={`bi ${
                            openingThisPreview
                              ? "bi-hourglass-split"
                              : "bi-download"
                          }`}
                        ></i>
                      </button>

                      <button
                        type="button"
                        className="hja-icon-action hja-icon-action--chat"
                        onClick={() => handleOpenMessages(r)}
                        title={getAdminChatButtonLabel(r)}
                        aria-label={getAdminChatButtonLabel(r)}
                      >
                        <i className="bi bi-chat-fill"></i>

                        {unreadCount > 0 ? (
                          <span className="hja-icon-action__badge">
                            {unreadCount}
                          </span>
                        ) : null}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="hja-footer">
            <span>
              Mostrando {total} {total === 1 ? "postulante" : "postulantes"}
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
    </div>
  );
}