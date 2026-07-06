import { Link } from "react-router-dom";
import { formatEmploymentType } from "../../utils/jobs";

const DEFAULT_COMPANY_LOGO = "/logo-humantyx-jobs-nobg.png";

function formatPostedTime(dateString) {
  if (!dateString) return "";

  const published = new Date(dateString);
  if (Number.isNaN(published.getTime())) return "";

  const now = new Date();
  const diffMs = now - published;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Publicado hoy";
  if (diffDays === 1) return "Hace 1 día";
  if (diffDays < 7) return `Hace ${diffDays} días`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks === 1) return "Hace 1 semana";
  return `Hace ${diffWeeks} semanas`;
}

function isNewJob(dateString) {
  if (!dateString) return false;

  const published = new Date(dateString);
  if (Number.isNaN(published.getTime())) return false;

  const now = new Date();
  const diffHours = (now - published) / (1000 * 60 * 60);

  return diffHours <= 48;
}

export default function JobCard({
  job,
  active,
  onSelect,
  isFavorite,
  onToggleFavorite,
  jobUrl,
}) {
  const publishedDate = job.published_at || job.created_at;
  const postedText = formatPostedTime(publishedDate);
  const isNew = isNewJob(publishedDate);

  const companyName = job.company_name || "Humantyx Jobs";
  const companyLogo = job.company_logo_url || DEFAULT_COMPANY_LOGO;

  return (
    <Link
      to={jobUrl || `/empleos/${job.id}`}
      className={`jobs-card ${active ? "is-active" : ""}`}
      onClick={(e) => {
        if (
          e.button !== 0 ||
          e.ctrlKey ||
          e.metaKey ||
          e.shiftKey ||
          e.altKey
        ) {
          return;
        }

        e.preventDefault();
        onSelect(job.id);
      }}
    >
      <div className="jobs-card__header">
        <div className="jobs-card__identity">
          <div className="jobs-card__logo">
            <img src={companyLogo} alt={companyName} />
          </div>

          <div className="jobs-card__heading">
            <h3 className="jobs-card__title">{job.title}</h3>
            <p className="jobs-card__company">{companyName}</p>
          </div>
        </div>

        <span
          role="button"
          tabIndex={0}
          className={`jobs-card__favorite ${isFavorite ? "is-favorite" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite(job.id);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite(job.id);
            }
          }}
          title={isFavorite ? "Quitar de favoritos" : "Guardar favorito"}
        >
          <i className={`bi ${isFavorite ? "bi-heart-fill" : "bi-heart"}`} />
        </span>
      </div>

      <div className="jobs-card__badges">
        {job.employment_type && (
          <span className="jobs-card__badge jobs-card__badge--type">
            <i className="bi bi-briefcase"></i>
            {formatEmploymentType(job.employment_type)}
          </span>
        )}

        {isNew && (
          <span className="jobs-card__badge jobs-card__badge--new">
            <i className="bi bi-lightning-charge-fill"></i>
            Nuevo
          </span>
        )}
      </div>

      <div className="jobs-card__meta">
        {job.location && (
          <span className="jobs-card__meta-item">
            <i className="bi bi-geo-alt-fill"></i>
            {job.location}
          </span>
        )}

        {job.salary_range && (
          <span className="jobs-card__meta-item jobs-card__meta-item--salary">
            <i className="bi bi-cash-stack"></i>
            {job.salary_range}
          </span>
        )}
      </div>

      <div className="jobs-card__footer">
        {postedText && (
          <span className="jobs-card__time">
            <i className="bi bi-clock"></i>
            {postedText}
          </span>
        )}

        <span className="jobs-card__details">
          Ver detalles
          <i className="bi bi-arrow-right"></i>
        </span>
      </div>
    </Link>
  );
}