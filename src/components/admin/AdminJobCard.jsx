import { Link } from "react-router-dom";

const STATUS_META = {
  PUBLISHED: { label: "Publicado", cls: "is-published" },
  CLOSED: { label: "Cerrado", cls: "is-closed" },
  DRAFT: { label: "Borrador", cls: "is-draft" },
};

function formatEmploymentType(value) {
  if (!value) return "—";

  const map = {
    internship: "Prácticas",
    part_time: "Medio Tiempo",
    "part-time": "Medio Tiempo",
    full_time: "Tiempo Completo",
    "full-time": "Tiempo Completo",
    contract: "Contrato",
  };

  return map[value] || value;
}

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
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Publicado hoy";
  if (diffDays === 1) return "Publicado ayer";

  return `Publicado hace ${diffDays} días`;
}

function formatCreator(job) {
  const roleLabel =
    job?.creator_role === "ADMIN"
      ? "Admin"
      : job?.creator_role === "RRHH"
      ? "RRHH"
      : "Usuario";

  const firstName = (job?.creator_first_name || "").trim();
  const lastName = (job?.creator_last_name || "").trim();

  const fullName =
    firstName && lastName
      ? `${firstName} ${lastName}`
      : firstName || lastName || "";

  const visibleName = fullName || job?.creator_email || "No disponible";

  return `${roleLabel} · ${visibleName}`;
}

function canDeleteJob(job) {
  const applicantsCount = Number(job?.applicants_count ?? 0);
  const isPublished = job?.status === "PUBLISHED";

  return applicantsCount === 0 && !isPublished;
}

export default function AdminJobCard({
  job,
  preview,
  isAdmin,
  onViewDescription,
  onEdit,
  onDelete,
}) {
  const status = STATUS_META[job?.status] || STATUS_META.DRAFT;
  const applicantsCount = Number(job?.applicants_count ?? 0);

  return (
    <article className="hx-job-card-v2">
      <div className="hx-job-card-v2__main">
        <div className="hx-job-card-v2__header">
          <div className="hx-job-card-v2__header-left">
            <div className="hx-job-card-v2__title-row">
              <div className="hx-job-card-v2__company-avatar">HX</div>

              <div className="hx-job-card-v2__title-content">
                <h3>{job?.title || "Sin título"}</h3>

            <div className="hx-job-card-v2__status-row">

                <span className={`hx-job-card-v2__status ${status.cls}`}>
                    <i className="bi bi-check-circle-fill"></i>
                    {status.label}
                </span>

                {job?.published_at && (
                    <span className="hx-job-card-v2__published-time">
                    • {formatRelativeDate(job.published_at)}
                    </span>
                )}

                </div>
              </div>
            </div>
          </div>

          <div className="hx-job-card-v2__header-actions">

                <button
                    type="button"
                    className="hx-job-card-v2__description-btn"
                    onClick={() => onViewDescription(job)}
                >
                    <i className="bi bi-file-earmark-text"></i>
                    <span>Descripción</span>
                </button>

                </div>
        </div>

        <p className="hx-job-card-v2__description">
          {preview?.previewText ||
            "Esta vacante aún no tiene una descripción registrada."}
        </p>

        <div className="hx-job-card-v2__chips">
          <span>
            <i className="bi bi-geo-alt-fill"></i>
            {job?.location || "No especificado"}
          </span>

          <span>
            <i className="bi bi-briefcase-fill"></i>
            {formatEmploymentType(job?.employment_type)}
          </span>

          <span>
            <i className="bi bi-cash-stack"></i>
            {job?.salary_range || "No especificado"}
          </span>
        </div>

        <div className="hx-job-card-v2__meta-grid">
          {isAdmin && (
            <div>
              <small>Creado por</small>
              <strong>{formatCreator(job)}</strong>
            </div>
          )}

          <div>
            <small>Creada</small>
            <strong>{formatDate(job?.created_at)}</strong>
          </div>

          {job?.published_at && (
            <div>
              <small>Publicada</small>
              <strong>{formatDate(job.published_at)}</strong>
            </div>
          )}

          {job?.updated_at && (
            <div>
              <small>Última edición</small>
              <strong>{formatDate(job.updated_at)}</strong>
            </div>
          )}
        </div>
      </div>

      <aside className="hx-job-card-v2__aside">
        <div className="hx-job-card-v2__metric">
          <strong>{applicantsCount}</strong>
          <span>Postulantes</span>
        </div>

        <div className="hx-job-card-v2__actions">
          <Link
            to={`/rrhh/vacantes/${job?.id}/postulantes`}
            className="hx-job-card-v2__primary-action"
          >
            <i className="bi bi-people"></i>
            <span>Ver postulantes</span>
          </Link>

          <button
            type="button"
            className="hx-job-card-v2__icon-action"
            onClick={() => onEdit(job?.id)}
            title="Editar vacante"
          >
            <i className="bi bi-pencil-fill"></i>
            <span>Editar</span>
          </button>

          <button
            type="button"
            className="hx-job-card-v2__icon-action is-danger"
            onClick={() => onDelete(job)}
            disabled={!canDeleteJob(job)}
            title={
              !canDeleteJob(job)
                ? "No se puede eliminar esta vacante"
                : "Eliminar vacante"
            }
          >
            <i className="bi bi-trash-fill"></i>
            <span>Eliminar</span>
          </button>
        </div>
      </aside>
    </article>
  );
}