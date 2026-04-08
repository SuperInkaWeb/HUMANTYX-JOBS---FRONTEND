import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  apiFetch,
  getCandidateApplicationMessages,
  replyCandidateApplicationMessage,
} from "../services/api";
import ApplicationMessagesModal from "../components/messages/ApplicationMessagesModal";
import "./my-applications.css";

function formatDate(dateString) {
  if (!dateString) return "—";

  const date = new Date(dateString);

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function StatusBadge({ status }) {
  const map = {
    APPLIED: { label: "Postulado", cls: "is-applied" },
    IN_REVIEW: { label: "En revisión", cls: "is-review" },
    INTERVIEW: { label: "Entrevista", cls: "is-interview" },
    REJECTED: { label: "Rechazado", cls: "is-rejected" },
    HIRED: { label: "Contratado", cls: "is-hired" },
  };

  const current = map[status] || {
    label: status || "Sin estado",
    cls: "is-default",
  };

  return <span className={`myapps-status ${current.cls}`}>{current.label}</span>;
}

function getJobIconClass() {
  return "bi bi-briefcase";
}

function getUnreadCount(value) {
  return Number(value) || 0;
}

function getCandidateChatButtonLabel(row) {
  if (!row?.has_conversation) return "";
  return "Ver chat";
}

export default function MyApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesSending, setMessagesSending] = useState(false);
  const [messagesError, setMessagesError] = useState("");
  const [selectedApplicationForMessages, setSelectedApplicationForMessages] =
    useState(null);
  const [messagesConversation, setMessagesConversation] = useState(null);
  const [messagesList, setMessagesList] = useState([]);
  const [messagesPermissions, setMessagesPermissions] = useState({
    can_reply: false,
  });
  const [messagesApplicationInfo, setMessagesApplicationInfo] = useState(null);

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiFetch("/candidate/applications");

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.applications)
        ? data.applications
        : Array.isArray(data?.apps)
        ? data.apps
        : [];

      setApps(list);
    } catch (e) {
      setError(e.message || "Ocurrió un error cargando tus postulaciones.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  async function loadCandidateMessages(applicationId) {
    setMessagesLoading(true);
    setMessagesError("");

    try {
      const data = await getCandidateApplicationMessages(applicationId);

      setMessagesConversation(data.conversation || null);
      setMessagesList(Array.isArray(data.messages) ? data.messages : []);
      setMessagesPermissions(data.permissions || { can_reply: false });
      setMessagesApplicationInfo(data.application || null);
    } catch (err) {
      setMessagesError(err.message || "No se pudieron cargar los mensajes");
      setMessagesConversation(null);
      setMessagesList([]);
      setMessagesPermissions({ can_reply: false });
      setMessagesApplicationInfo(null);
    } finally {
      setMessagesLoading(false);
    }
  }

  async function handleOpenMessages(applicationRow) {
    setSelectedApplicationForMessages(applicationRow);
    setShowMessagesModal(true);

    await loadCandidateMessages(applicationRow.id);
    await loadApplications();
  }

  function handleCloseMessages() {
    setShowMessagesModal(false);
    setMessagesError("");
    setMessagesConversation(null);
    setMessagesList([]);
    setMessagesPermissions({ can_reply: false });
    setMessagesApplicationInfo(null);
    setSelectedApplicationForMessages(null);
  }

  async function handleReplyMessage(messageText) {
    if (!selectedApplicationForMessages?.id) return;

    setMessagesSending(true);
    setMessagesError("");

    try {
      await replyCandidateApplicationMessage(
        selectedApplicationForMessages.id,
        messageText
      );

      await loadCandidateMessages(selectedApplicationForMessages.id);
      await loadApplications();
    } catch (err) {
      setMessagesError(err.message || "No se pudo enviar la respuesta");
    } finally {
      setMessagesSending(false);
    }
  }

  const counts = useMemo(() => {
    return {
      all: apps.length,
      applied: apps.filter((a) => a.status === "APPLIED").length,
      review: apps.filter((a) => a.status === "IN_REVIEW").length,
      interview: apps.filter((a) => a.status === "INTERVIEW").length,
    };
  }, [apps]);

  const filteredApps = useMemo(() => {
    if (activeTab === "applied") {
      return apps.filter((a) => a.status === "APPLIED");
    }

    if (activeTab === "review") {
      return apps.filter((a) => a.status === "IN_REVIEW");
    }

    if (activeTab === "interview") {
      return apps.filter((a) => a.status === "INTERVIEW");
    }

    return apps;
  }, [apps, activeTab]);

  return (
    <section className="myapps-page">
      <div className="myapps-shell">
        <div className="myapps-header">
          <h1 className="myapps-title">Mis postulaciones</h1>
          <p className="myapps-subtitle">
            Gestiona y realiza el seguimiento de tus solicitudes de empleo.
          </p>
        </div>

        <div className="myapps-tabs">
          <button
            type="button"
            className={`myapps-tab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            Todos ({counts.all})
          </button>

          <button
            type="button"
            className={`myapps-tab ${activeTab === "applied" ? "active" : ""}`}
            onClick={() => setActiveTab("applied")}
          >
            Postulados ({counts.applied})
          </button>

          <button
            type="button"
            className={`myapps-tab ${activeTab === "review" ? "active" : ""}`}
            onClick={() => setActiveTab("review")}
          >
            En revisión ({counts.review})
          </button>
        </div>

        {loading && <div className="myapps-feedback">Cargando postulaciones...</div>}

        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && !error && (
          <>
            {filteredApps.length === 0 ? (
              <div className="myapps-empty">
                <div className="myapps-empty__icon">
                  <i className="bi bi-briefcase"></i>
                </div>

                <h3 className="myapps-empty__title">
                  No hay postulaciones en esta sección
                </h3>

                <p className="myapps-empty__text">
                  Explora nuevas oportunidades y encuentra vacantes que se ajusten
                  a tu perfil.
                </p>

                <Link to="/empleos" className="myapps-btn-primary">
                  Ir a buscar empleos
                </Link>
              </div>
            ) : (
              <div className="myapps-list">
                {filteredApps.map((a) => {
                  const jobId = a.job_id || a.jobId;
                  const title = a.title || a.job_title || "Sin título";
                  const location =
                    a.location || a.job_location || "Ubicación no especificada";
                  const salary = a.salary_range || "Salario no especificado";
                  const employmentType =
                    a.employment_type || "Modalidad no especificada";
                  const appliedAt = formatDate(a.created_at);
                  const unreadCount = getUnreadCount(a.unread_messages_count);

                  return (
                    <article key={a.id} className="myapps-card">
                      <div className="myapps-card__accent"></div>

                      <div className="myapps-card__icon">
                        <i className={getJobIconClass(title)}></i>
                      </div>

                      <div className="myapps-card__body">
                        <h2 className="myapps-card__title">{title}</h2>

                        <div className="myapps-card__meta">
                          <span>
                            <i className="bi bi-geo-alt-fill"></i>
                            {location}
                          </span>

                          <span>
                            <i className="bi bi-briefcase-fill"></i>
                            {employmentType}
                          </span>

                          <span>
                            <i className="bi bi-cash-stack"></i>
                            {salary}
                          </span>
                        </div>

                        <div className="myapps-card__date">
                          Postulaste el {appliedAt}
                        </div>
                      </div>

                      <div className="myapps-card__actions">
                        <StatusBadge status={a.status} />

                        {a.has_conversation ? (
                          <button
                            type="button"
                            className="myapps-chat-btn"
                            onClick={() => handleOpenMessages(a)}
                          >
                            <span>{getCandidateChatButtonLabel(a)}</span>

                            {unreadCount > 0 ? (
                              <span className="myapps-chat-badge">
                                {unreadCount}
                              </span>
                            ) : null}
                          </button>
                        ) : null}

                        {jobId ? (
                          <Link
                            to={`/empleos/${jobId}`}
                            state={{ application: a }}
                            className="myapps-btn-view"
                          >
                            Ver empleo
                          </Link>
                        ) : (
                          <span className="myapps-card__unavailable">
                            Empleo no disponible
                          </span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <ApplicationMessagesModal
        show={showMessagesModal}
        mode="candidate"
        title="Mensajes de tu postulación"
        application={messagesApplicationInfo}
        conversation={messagesConversation}
        messages={messagesList}
        canSend={!!messagesPermissions?.can_reply}
        loading={messagesLoading}
        sending={messagesSending}
        error={messagesError}
        onClose={handleCloseMessages}
        onSend={handleReplyMessage}
      />
    </section>
  );
}