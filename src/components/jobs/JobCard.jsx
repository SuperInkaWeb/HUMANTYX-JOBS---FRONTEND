function formatPostedTime(dateString) {
  if (!dateString) return "";

  const created = new Date(dateString);
  if (Number.isNaN(created.getTime())) return "";

  const now = new Date();
  const diffMs = now - created;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Publicado hoy";
  if (diffDays === 1) return "Hace 1 día";
  if (diffDays < 7) return `Hace ${diffDays} días`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks === 1) return "Hace 1 semana";
  return `Hace ${diffWeeks} semanas`;
}

export default function JobCard({ job, active, onSelect }) {
  const postedText = formatPostedTime(job.created_at);

  return (
    <button
      type="button"
      className={`jobs-card ${active ? "is-active" : ""}`}
      onClick={() => onSelect(job.id)}
    >
      <div className="jobs-card__top">
        <div className="jobs-card__main">
          <h3 className="jobs-card__title">{job.title}</h3>

          {job.company_name ? (
            <div className="jobs-card__company">{job.company_name}</div>
          ) : null}
        </div>
      </div>

      <div className="jobs-card__chips">
        {job.location ? <span className="jobs-card__chip">{job.location}</span> : null}
        {job.employment_type ? (
          <span className="jobs-card__chip jobs-card__chip--muted">
            {job.employment_type}
          </span>
        ) : null}
      </div>

      {job.salary_range ? (
        <div className="jobs-card__salary">
          <i className="bi bi-cash-stack"></i>
          <span>{job.salary_range}</span>
        </div>
      ) : null}

      {postedText ? <div className="jobs-card__time">{postedText}</div> : null}
    </button>
  );
}