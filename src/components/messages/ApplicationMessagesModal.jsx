import { useEffect, useMemo, useRef, useState } from "react";
import "./messages.css";

function formatDateTime(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function ApplicationMessagesModal({
  show,
  mode = "admin", // "admin" | "candidate"
  title = "Mensajes",
  application = null,
  conversation = null,
  messages = [],
  canSend = false,
  loading = false,
  sending = false,
  error = "",
  onClose,
  onSend,
}) {
  const [messageText, setMessageText] = useState("");
  const messagesScrollRef = useRef(null);
  const shouldStickToBottomRef = useRef(true);
  const prevMessagesLengthRef = useRef(0);

  function isNearBottom() {
    const el = messagesScrollRef.current;
    if (!el) return true;

    const threshold = 100;
    return el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
  }

  function jumpToBottom() {
    requestAnimationFrame(() => {
      const el = messagesScrollRef.current;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    });
  }

  function forceJumpToBottom() {
    requestAnimationFrame(() => {
      const el = messagesScrollRef.current;
      if (!el) return;
      el.scrollTop = el.scrollHeight;

      setTimeout(() => {
        const latestEl = messagesScrollRef.current;
        if (!latestEl) return;
        latestEl.scrollTop = latestEl.scrollHeight;
      }, 80);
    });
  }

  function handleScroll() {
    shouldStickToBottomRef.current = isNearBottom();
  }

  useEffect(() => {
    if (!show) return;
    setMessageText("");
  }, [show, conversation?.id]);

  useEffect(() => {
    if (!show) return;

    shouldStickToBottomRef.current = true;
    prevMessagesLengthRef.current = messages.length;
    forceJumpToBottom();
  }, [show, conversation?.id]);

  useEffect(() => {
    if (!show) return;

    const currentLength = messages.length;
    const prevLength = prevMessagesLengthRef.current;
    const hasNewMessages = currentLength > prevLength;

    if (hasNewMessages && shouldStickToBottomRef.current) {
      forceJumpToBottom();
    }

    prevMessagesLengthRef.current = currentLength;
  }, [messages, show]);

  const headerSubtitle = useMemo(() => {
    if (!application) return "";

    if (mode === "admin") {
      const fullName = [application.first_name, application.last_name]
        .filter(Boolean)
        .join(" ")
        .trim();

      return `${fullName || application.candidate_email || "Postulante"} · ${
        application.job_title || "Vacante"
      }`;
    }

    return application.job_title || "Tu postulación";
  }, [application, mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmed = messageText.trim();
    if (!trimmed || !canSend || sending) return;

    try {
      shouldStickToBottomRef.current = true;
      await onSend?.(trimmed);
      setMessageText("");
      forceJumpToBottom();
    } catch {
      // el error ya lo maneja el padre
    }
  };

  if (!show) return null;

  return (
    <div className="hx-msg-backdrop">
      <div className="hx-msg-modal">
        <div className="hx-msg-header">
          <div>
            <h3 className="hx-msg-title">{title}</h3>
            {headerSubtitle ? (
              <div className="hx-msg-subtitle">{headerSubtitle}</div>
            ) : null}
          </div>

          <button
            type="button"
            className="hx-msg-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div
          className="hx-msg-body"
          ref={messagesScrollRef}
          onScroll={handleScroll}
        >
          {loading ? (
            <div className="hx-msg-empty">Cargando mensajes...</div>
          ) : error ? (
            <div className="hx-msg-error">{error}</div>
          ) : messages.length === 0 ? (
            <div className="hx-msg-empty">
              {mode === "admin"
                ? "Aún no hay mensajes. Puedes iniciar la conversación."
                : "Aún no tienes mensajes para esta postulación."}
            </div>
          ) : (
            <div className="hx-msg-list">
              {messages.map((msg) => {
                const isMine =
                  mode === "admin"
                    ? msg.sender_role === "ADMIN" || msg.sender_role === "RRHH"
                    : msg.sender_role === "CANDIDATE";

                return (
                  <div
                    key={msg.id}
                    className={`hx-msg-item ${isMine ? "mine" : "other"}`}
                  >
                    <div className="hx-msg-bubble">
                      <div className="hx-msg-meta">
                        <strong>{msg.sender_label || msg.sender_role}</strong>
                        <span>{formatDateTime(msg.created_at)}</span>
                      </div>
                      <div className="hx-msg-text">{msg.message_text}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="hx-msg-footer">
          {!canSend ? (
            <div className="hx-msg-disabled">
              {mode === "admin"
                ? "No se pueden enviar mensajes en esta postulación."
                : conversation
                ? "Esta postulación ya no admite respuestas."
                : "Aún no tienes una conversación iniciada para esta postulación."}
            </div>
          ) : (
            <form className="hx-msg-form" onSubmit={handleSubmit}>
              <textarea
                className="hx-msg-textarea"
                placeholder={
                  mode === "admin"
                    ? "Escribe un mensaje para el postulante..."
                    : "Escribe tu respuesta..."
                }
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                maxLength={2000}
                rows={4}
              />

              <div className="hx-msg-actions">
                <span className="hx-msg-counter">{messageText.length}/2000</span>

                <button
                  type="submit"
                  className="hx-msg-send"
                  disabled={sending || !messageText.trim()}
                >
                  {sending ? "Enviando..." : "Enviar"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}