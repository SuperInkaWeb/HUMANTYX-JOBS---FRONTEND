export default function ProfileProfessionalSection({
  hasProfessionalInfo,
  form,
  availabilityLabel,
  openSectionModal,
}) {
  return (
    <section className="hx-section-shell">
      <div className="hx-section-top-row">
        <h2 className="hx-section-main-title">Información profesional</h2>

        {hasProfessionalInfo ? (
          <button
            type="button"
            className="hx-btn-section"
            onClick={() => openSectionModal("professional")}
          >
            <i className="bi bi-pencil-fill"></i>
            Editar
          </button>
        ) : (
          <button
            type="button"
            className="hx-section-add-btn"
            onClick={() => openSectionModal("professional")}
          >
            <i className="bi bi-plus-lg"></i>
            Agregar
          </button>
        )}
      </div>

      {!hasProfessionalInfo ? (
        <div className="hx-section-empty-state">
          <p className="hx-section-empty-text">
            Aún no has agregado información profesional.
          </p>
        </div>
      ) : (
        <article className="hx-section-record-wrap">
          <div className="hx-section-record-head">
            <div className="hx-section-record-main">
              <div className="hx-section-record-icon">
                <i className="bi bi-briefcase-fill"></i>
              </div>

              <div>
                <h3 className="hx-section-record-title">
                  {form.headline || "Titular profesional"}
                </h3>

                <p className="hx-section-record-subtitle">
                  {form.experience_years
                    ? `${form.experience_years} años de experiencia`
                    : "Experiencia no especificada"}
                </p>

                <div className="hx-section-record-meta">
                  <span>
                    <i className="bi bi-clock-fill"></i>
                    {availabilityLabel || "Disponibilidad no especificada"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="hx-section-record-description">
            {form.about?.trim()
              ? form.about
              : "Aún no has agregado una descripción profesional."}
          </p>
        </article>
      )}
    </section>
  );
}