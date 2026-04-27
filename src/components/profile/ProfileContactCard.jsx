function formatGender(value) {
  const map = {
    M: "Masculino",
    F: "Femenino",
  };

  return map[value] || "Pendiente";
}

function formatMaritalStatus(value) {
  const map = {
    SINGLE: "Soltero(a)",
    MARRIED: "Casado(a)",
    DIVORCED: "Divorciado(a)",
    WIDOWED: "Viudo(a)",
    COHABITING: "Conviviente",
    OTHER: "Otro",
  };

  return map[value] || "Pendiente";
}

export default function ProfileContactCard({
  user,
  form,
  fullName,
  hasPersonalInfo,
  openSectionModal,
  isInternalUser = false,
}) {
  const locationText = [form.department, form.city]
    .filter((v) => typeof v === "string" && v.trim())
    .join(", ");

  const fullLocationText = [
    form.country,
    form.department,
    form.city,
    form.district,
  ]
    .filter((v) => typeof v === "string" && v.trim())
    .join(", ");

  const documentText = [form.document_type, form.document_number]
    .filter((v) => typeof v === "string" && v.trim())
    .join(": ");

  const addressText = [
    form.address_line,
    form.postal_code ? `C.P. ${form.postal_code}` : "",
  ]
    .filter((v) => typeof v === "string" && v.trim())
    .join(" · ");

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
          {!isInternalUser ? (
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
          ) : (
            <div className="hx-profile-contact-grid hx-profile-contact-grid--internal">
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
                  <i className="bi bi-envelope-fill"></i>
                </div>
                <div>
                  <strong>EMAIL</strong>
                  <span>{user?.email || "Pendiente"}</span>
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
                  <i className="bi bi-card-text"></i>
                </div>
                <div>
                  <strong>DOCUMENTO</strong>
                  <span>{documentText || "Pendiente"}</span>
                </div>
              </div>

              <div className="hx-profile-contact-item">
                <div className="hx-profile-contact-icon">
                  <i className="bi bi-calendar-event-fill"></i>
                </div>
                <div>
                  <strong>FECHA DE NACIMIENTO</strong>
                  <span>{form.birth_date || "Pendiente"}</span>
                </div>
              </div>

              <div className="hx-profile-contact-item">
                <div className="hx-profile-contact-icon">
                  <i className="bi bi-person-vcard-fill"></i>
                </div>
                <div>
                  <strong>GÉNERO</strong>
                  <span>{formatGender(form.gender)}</span>
                </div>
              </div>

              <div className="hx-profile-contact-item">
                <div className="hx-profile-contact-icon">
                  <i className="bi bi-heart-fill"></i>
                </div>
                <div>
                  <strong>ESTADO CIVIL</strong>
                  <span>{formatMaritalStatus(form.marital_status)}</span>
                </div>
              </div>

              <div className="hx-profile-contact-item">
                <div className="hx-profile-contact-icon">
                  <i className="bi bi-geo-alt-fill"></i>
                </div>
                <div>
                  <strong>UBICACIÓN</strong>
                  <span>{fullLocationText || "Pendiente"}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}