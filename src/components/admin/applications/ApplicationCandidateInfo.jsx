export default function ApplicationCandidateInfo({
  row,
  fullName,
  applicationDate,
  getInitials,
  formatDate,
  formatRelativeDate,
  getApplicationDate,
  variant = "list",
}) {
  const isKanban = variant === "kanban";

  return (
    <>
      <div
        className={
          isKanban
            ? "hja-kanban-card__header"
            : "hja-candidate"
        }
      >
        <div
          className={
            isKanban
              ? "hja-kanban-avatar"
              : "hja-candidate__avatar"
          }
        >
          {getInitials(row.first_name, row.last_name, row.email)}
        </div>

        <div
          className={
            isKanban
              ? "hja-kanban-info"
              : "hja-candidate__info"
          }
        >
          <h3>{fullName}</h3>

          <p>
            <i className="bi bi-clock-history"></i>

            {applicationDate
              ? `${formatRelativeDate(applicationDate)}${
                  !isKanban
                    ? ` · ${formatDate(applicationDate)}`
                    : ""
                }`
              : "Sin fecha de postulación"}
          </p>
        </div>
      </div>

      {!isKanban && (
        <div className="hja-app-card__contact">
          <div className="hja-contact-item">
            <i className="bi bi-envelope-fill"></i>

            <span>{row.email ?? "—"}</span>
          </div>

          <div className="hja-contact-item">
            <i className="bi bi-telephone-fill"></i>

            <span>{row.phone ?? "—"}</span>
          </div>
        </div>
      )}

      {isKanban && (
        <div className="hja-kanban-meta">
          <div>
            <i className="bi bi-envelope"></i>

            <span>{row.email ?? "Sin correo"}</span>
          </div>

          <div>
            <i className="bi bi-telephone"></i>

            <span>{row.phone || "Sin teléfono"}</span>
          </div>

          <div>
            <i className="bi bi-clock-history"></i>

            <span>
              {formatRelativeDate(getApplicationDate(row))}
            </span>
          </div>
        </div>
      )}
    </>
  );
}