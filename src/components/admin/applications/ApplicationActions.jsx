import { Link } from "react-router-dom";

export default function ApplicationActions({
  jobId,
  row,
  unreadCount,
  openingPreview,
  previewLoading,
  variant = "list",
  onOpenPreview,
  onOpenMessages,
  getAdminChatButtonLabel,
}) {
  const isKanban = variant === "kanban";

  const wrapperClass = isKanban ? "hja-kanban-actions" : "hja-actions";
  const buttonClass = isKanban ? "hja-kanban-btn" : "hja-icon-action";
  const chatButtonClass = isKanban
    ? "hja-kanban-btn"
    : "hja-icon-action hja-icon-action--chat";
  const badgeClass = isKanban
    ? "hja-kanban-badge"
    : "hja-icon-action__badge";

  return (
    <div className={wrapperClass}>
      <Link
        to={`/rrhh/vacantes/${jobId}/postulantes/${row.candidate_id}/perfil`}
        className={buttonClass}
        title="Ver perfil"
        aria-label="Ver perfil"
      >
        <i className={isKanban ? "bi bi-person" : "bi bi-person-badge-fill"} />
      </Link>

      <button
        type="button"
        className={buttonClass}
        onClick={() => onOpenPreview(row)}
        disabled={openingPreview || previewLoading}
        title="Ver CV"
        aria-label="Ver CV"
      >
        <i
          className={`bi ${
            openingPreview ? "bi-hourglass-split" : "bi-download"
          }`}
        />
      </button>

      <button
        type="button"
        className={chatButtonClass}
        onClick={() => onOpenMessages(row)}
        title={getAdminChatButtonLabel(row)}
        aria-label={getAdminChatButtonLabel(row)}
      >
        <i className={isKanban ? "bi bi-chat" : "bi bi-chat-fill"} />

        {unreadCount > 0 && <span className={badgeClass}>{unreadCount}</span>}
      </button>
    </div>
  );
}