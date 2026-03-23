export default function ProfileContactCard({
  user,
  form,
  fullName,
  hasPersonalInfo,
  openSectionModal,
}) {
  const locationText = [form.department, form.city]
    .filter((v) => typeof v === "string" && v.trim())
    .join(", ");

  return (
    <section className="hx-section-shell">
      <div className="hx-section-top-row">
        <h2 className="hx-section-main-title">Información Personal</h2>

        {hasPersonalInfo ? (
          <button
            type="button"
            className="hx-btn-section"
            onClick={() => openSectionModal("personal")}
          >
            <i className="bi bi-pencil-fill"></i>
            Editar
          </button>
        ) : null}
      </div>

      {!hasPersonalInfo ? (
        <div className="hx-section-empty-state">
          <p className="hx-section-empty-text">
            Aún no has agregado información personal.
          </p>

          <button
            type="button"
            className="hx-btn-primary"
            onClick={() => openSectionModal("personal")}
          >
            Agregar información personal
          </button>
        </div>
      ) : (
        <div className="hx-profile-shell-card">
          <div className="hx-profile-contact-grid">
            <div className="hx-profile-contact-item">
              <div className="hx-profile-contact-icon">
                <i className="bi bi-person-fill"></i>
              </div>
              <div>
                <strong>NOMBRE COMPLETO</strong>
                <span>{fullName || "Pendiente"}</span>
              </div>
            </div>

            <div className="hx-profile-contact-item">
              <div className="hx-profile-contact-icon">
                <i className="bi bi-telephone-fill"></i>
              </div>
              <div>
                <strong>TELÉFONO</strong>
                <span>{form.phone || "Pendiente"}</span>
              </div>
            </div>

            <div className="hx-profile-contact-item">
              <div className="hx-profile-contact-icon">
                <i className="bi bi-envelope-fill"></i>
              </div>
              <div>
                <strong>EMAIL</strong>
                <span>{user?.email || "Pendiente"}</span>
              </div>
            </div>

            <div className="hx-profile-contact-item">
              <div className="hx-profile-contact-icon">
                <i className="bi bi-geo-alt-fill"></i>
              </div>
              <div>
                <strong>DEPARTAMENTO, PROVINCIA</strong>
                <span>{locationText || "Pendiente"}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}