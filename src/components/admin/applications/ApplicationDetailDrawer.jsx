import { createPortal } from "react-dom";
import { useEffect } from "react";

export default function ApplicationDetailDrawer({
  open,
  row,
  onClose,
  getInitials,
  getApplicationDate,
  formatDate,
  formatRelativeDate,
  onOpenPreview,
  onOpenMessages,
}) {
  useEffect(() => {
    if (!open) return;

    document.body.classList.add("hja-modal-open");

    return () => {
      document.body.classList.remove("hja-modal-open");
    };
  }, [open]);

  if (!open || !row) return null;

  const fullName =
    `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim() || "Postulante";

  const location = [row.city, row.department, row.country]
    .filter(Boolean)
    .join(", ");

  const applicationDate = getApplicationDate(row);

  return createPortal(
    <div className="hja-drawer-backdrop" onClick={onClose}>
      <aside
        className="hja-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Detalle del candidato"
      >
        <div className="hja-drawer__header">
          <div>
            <span className="hja-drawer__eyebrow">Detalle del candidato</span>
            <h2>{fullName}</h2>
          </div>

          <button
            type="button"
            className="hja-drawer__close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="hja-drawer__profile">
          <div className="hja-drawer__avatar">
            {getInitials(row.first_name, row.last_name, row.email)}
          </div>

          <div>
            <h3>{fullName}</h3>
            <p>{row.headline || "Sin titular profesional"}</p>
          </div>
        </div>

        <div className="hja-drawer__section">
          <h4>Información de contacto</h4>

          <div className="hja-drawer__info">
            <span>
              <i className="bi bi-envelope"></i>
              {row.email || "Sin correo"}
            </span>

            <span>
              <i className="bi bi-telephone"></i>
              {row.phone || "Sin teléfono"}
            </span>

            <span>
              <i className="bi bi-geo-alt"></i>
              {location || "Sin ubicación"}
            </span>

            <span>
              <i className="bi bi-clock"></i>
              {formatRelativeDate(applicationDate)}
            </span>
          </div>
        </div>

        <div className="hja-drawer__section">
          <h4>Perfil profesional</h4>

          <p className="hja-drawer__text">
            {row.about || "Este candidato aún no ha completado su descripción profesional."}
          </p>

          <div className="hja-drawer__grid">
            <div>
              <small>Experiencia</small>
              <strong>{row.experience_years ?? "—"} años</strong>
            </div>

            <div>
              <small>Educación</small>
              <strong>{row.education_level || "—"}</strong>
            </div>

            <div>
              <small>Disponibilidad</small>
              <strong>{row.availability || "—"}</strong>
            </div>

            <div>
              <small>Salario deseado</small>
              <strong>{row.desired_salary || "—"}</strong>
            </div>
          </div>
        </div>

        <div className="hja-drawer__section">
          <h4>Postulación</h4>

          <div className="hja-drawer__info">
            <span>
              <i className="bi bi-calendar-check"></i>
              Fecha: {formatDate(applicationDate)}
            </span>

            <span>
              <i className="bi bi-file-earmark-text"></i>
              {row.cv_original_name || "Sin CV cargado"}
            </span>
          </div>
        </div>

        <div className="hja-drawer__actions">
          <button
            type="button"
            className="hja-btn hja-btn--ghost"
            onClick={() => onOpenPreview(row)}
          >
            <i className="bi bi-file-earmark-text"></i>
            Ver CV
          </button>

          <button
            type="button"
            className="hja-btn hja-btn--primary"
            onClick={() => onOpenMessages(row)}
          >
            <i className="bi bi-chat-dots"></i>
            Abrir chat
          </button>
        </div>
      </aside>
    </div>,
    document.body
  );
}