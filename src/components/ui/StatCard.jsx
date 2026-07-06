export default function StatCard({
  icon,
  title,
  value,
  subtitle,
  color = "primary",
}) {
  return (
    <article className={`hx-stat-card hx-stat-card--${color}`}>
      <div className="hx-stat-card__icon">
        <i className={`bi ${icon}`}></i>
      </div>

      <div className="hx-stat-card__body">
        <span className="hx-stat-card__title">
          {title}
        </span>

        <strong className="hx-stat-card__value">
          {value}
        </strong>

        {subtitle && (
          <small className="hx-stat-card__subtitle">
            {subtitle}
          </small>
        )}
      </div>
    </article>
  );
}