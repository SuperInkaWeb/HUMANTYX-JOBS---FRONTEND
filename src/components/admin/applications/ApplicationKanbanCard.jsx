import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import ApplicationActions from "./ApplicationActions";
import ApplicationStatusControl from "./ApplicationStatusControl";

export default function ApplicationKanbanCard({
  row,
  jobId,
  updatingId,
  openingPreviewId,
  previewLoading,
  StatusDropdown,
  getPendingStatus,
  getInitials,
  getUnreadCount,
  getApplicationDate,
  formatRelativeDate,
  getAdminChatButtonLabel,
  onDraftStatusChange,
  onSaveDraftStatus,
  onCancelDraftStatus,
  onOpenPreview,
  onOpenMessages,
  onOpenApplicationDetail,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: row.application_id,
    data: {
      type: "CARD",
      applicationId: row.application_id,
      candidateId: row.candidate_id,
      status: row.application_status,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
  };

  const fullName =
    `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim() || "Postulante";

  const disabledStatus = updatingId === row.application_id;
  const openingThisPreview = openingPreviewId === row.candidate_id;
  const unreadCount = getUnreadCount(row.unread_messages_count);

  const pendingStatus = getPendingStatus(
    row.application_id,
    row.application_status
  );

  const displayStatus = pendingStatus || row.application_status;
  const hasPendingStatusChange = Boolean(pendingStatus);

  const location = [row.city, row.department, row.country]
    .filter(Boolean)
    .join(", ");

  const headline = row.headline || "Sin titular profesional";
  const hasCv = Boolean(row.cv_original_name);
  const statusClass = (row.application_status || "APPLIED").toLowerCase();

  function handleCardClick(event) {
    const interactiveElement = event.target.closest(
      "button, a, input, select, textarea"
    );

    if (interactiveElement) return;

    onOpenApplicationDetail?.(row);
  }

  function handleCardKeyDown(event) {
    if (event.key !== "Enter" && event.key !== " ") return;

    const interactiveElement = event.target.closest(
      "button, a, input, select, textarea"
    );

    if (interactiveElement) return;

    event.preventDefault();
    onOpenApplicationDetail?.(row);
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`hja-kanban-card hja-kanban-card--${statusClass} ${
        isDragging ? "is-dragging" : ""
      }`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleCardKeyDown}
    >
      <div className="hja-kanban-card__top">
        <div className="hja-kanban-card__avatar">
          {getInitials(row.first_name, row.last_name, row.email)}
        </div>

        <div className="hja-kanban-card__identity">
          <h4>{fullName}</h4>
          <p>{headline}</p>
        </div>

        <button
          type="button"
          className="hja-kanban-drag-handle"
          aria-label="Mover postulante"
          title="Mover postulante"
          {...attributes}
          {...listeners}
        >
          <i className="bi bi-grip-vertical"></i>
        </button>
      </div>

      <div className="hja-kanban-card__meta">
        {location && (
          <span>
            <i className="bi bi-geo-alt"></i>
            {location}
          </span>
        )}

        <span>
          <i className="bi bi-envelope"></i>
          {row.email || "Sin correo"}
        </span>

        <span>
          <i className="bi bi-telephone"></i>
          {row.phone || "Sin teléfono"}
        </span>

        <span>
          <i className="bi bi-clock"></i>
          {formatRelativeDate(getApplicationDate(row))}
        </span>
      </div>

      <div className="hja-kanban-card__badges">
        <span className={`hja-mini-badge ${hasCv ? "is-ok" : "is-muted"}`}>
          <i className="bi bi-file-earmark-text"></i>
          {hasCv ? "CV cargado" : "Sin CV"}
        </span>

        {unreadCount > 0 && (
          <span className="hja-mini-badge is-alert">
            <i className="bi bi-chat-dots"></i>
            {unreadCount} sin leer
          </span>
        )}
      </div>

      <div className="hja-kanban-card__status">
        <ApplicationStatusControl
          applicationId={row.application_id}
          currentStatus={row.application_status}
          displayStatus={displayStatus}
          disabledStatus={disabledStatus}
          hasPendingStatusChange={hasPendingStatusChange}
          StatusDropdown={StatusDropdown}
          onDraftStatusChange={onDraftStatusChange}
          onSaveDraftStatus={onSaveDraftStatus}
          onCancelDraftStatus={onCancelDraftStatus}
        />
      </div>

      <ApplicationActions
        jobId={jobId}
        row={row}
        unreadCount={unreadCount}
        openingPreview={openingThisPreview}
        previewLoading={previewLoading}
        variant="kanban"
        onOpenPreview={onOpenPreview}
        onOpenMessages={onOpenMessages}
        getAdminChatButtonLabel={getAdminChatButtonLabel}
      />
    </article>
  );
}