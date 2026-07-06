export default function PageHeader({
  title,
  subtitle,
  action,
  eyebrow,
}) {
  return (
    <div className="hx-page-header">
      <div>
        {eyebrow && (
          <div className="hx-page-header__eyebrow">
            {eyebrow}
          </div>
        )}

        <h1>{title}</h1>

        {subtitle && (
          <p>{subtitle}</p>
        )}
      </div>

      {action && (
        <div className="hx-page-header__action">
          {action}
        </div>
      )}
    </div>
  );
}