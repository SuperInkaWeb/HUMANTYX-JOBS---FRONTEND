import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

const COLUMN_DESCRIPTIONS = {
  APPLIED: "Nuevos candidatos",
  IN_REVIEW: "Pendientes de revisión",
  INTERVIEW: "Entrevistas agendadas",
  REJECTED: "No continúan el proceso",
  HIRED: "Candidatos contratados",
};

const COLUMN_ICONS = {
  APPLIED: "bi-inbox",
  IN_REVIEW: "bi-search",
  INTERVIEW: "bi-calendar-event",
  REJECTED: "bi-x-circle",
  HIRED: "bi-check-circle",
};

export default function KanbanColumn({ status, meta, items, children }) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: "COLUMN",
      status,
    },
  });

  return (
    <section
      ref={setNodeRef}
      className={`hja-kanban-column hja-kanban-column--${status.toLowerCase()} ${
        isOver ? "is-over" : ""
      }`}
    >
      <div className="hja-kanban-column__header">
        <div className="hja-kanban-column__title">
          <span className="hja-kanban-column__icon">
            <i className={`bi ${COLUMN_ICONS[status] || "bi-circle"}`}></i>
          </span>

          <div>
            <h3>{meta.label}</h3>
            <p>{COLUMN_DESCRIPTIONS[status] || "Etapa del proceso"}</p>
          </div>
        </div>

        <span className="hja-kanban-column__count">{items.length}</span>
      </div>

      <SortableContext
        items={items.map((item) => item.application_id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="hja-kanban-column__body">
          {items.length === 0 ? (
            <div className="hja-kanban-empty">
              <i className="bi bi-person-plus"></i>
              <span>Sin postulantes</span>
            </div>
          ) : (
            children
          )}
        </div>
      </SortableContext>
    </section>
  );
}