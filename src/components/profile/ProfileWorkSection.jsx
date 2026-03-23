function formatMonthYear(dateValue) {
  if (!dateValue) return "Actualidad";

  try {
    return new Intl.DateTimeFormat("es-PE", {
      month: "short",
      year: "numeric",
    }).format(new Date(dateValue));
  } catch {
    return dateValue;
  }
}

export default function ProfileWorkSection({
  hasWorkInfo,
  visibleWorkItems,
  openWorkSectionForAdd,
  openSectionModal,
  removeWorkItem,
}) {
  return (
    <section className="hx-section-shell">
      <div className="hx-section-top-row">
        <h2 className="hx-section-main-title">Experiencia Laboral</h2>

        <button
          type="button"
          className="hx-btn-section"
          onClick={openWorkSectionForAdd}
        >
          <i className="bi bi-plus-lg"></i>
          Agregar
        </button>
      </div>

      {!hasWorkInfo ? (
        <div className="hx-section-empty-state">
          <p className="hx-section-empty-text">
            Aún no has agregado experiencia laboral.
          </p>
        </div>
      ) : (
        <div className="hx-section-record-list">
          {visibleWorkItems.map((item) => (
            <article key={item.id} className="hx-section-record-wrap">
              <div className="hx-section-record-head">
                <div className="hx-section-record-main">
                  <div className="hx-section-record-icon">
                    <i className="bi bi-briefcase-fill"></i>
                  </div>

                  <div>
                    <h3 className="hx-section-record-title">
                      {item.position || "Cargo"}
                    </h3>

                    <p className="hx-section-record-subtitle">
                      {item.company || "Empresa"}
                    </p>

                    <div className="hx-section-record-meta">
                      <span>
                        <i className="bi bi-geo-alt-fill"></i>
                        {item.location || "Ubicación no especificada"}
                      </span>

                      <span>
                        <i className="bi bi-calendar3"></i>
                        {formatMonthYear(item.start_date)} - {formatMonthYear(item.end_date)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="hx-section-record-actions">
                  <button
                    type="button"
                    className="hx-btn-icon"
                    onClick={() => openSectionModal("work", item.id)}
                    aria-label="Editar experiencia laboral"
                    title="Editar"
                  >
                    <i className="bi bi-pencil-fill"></i>
                  </button>

                  <button
                    type="button"
                    className="hx-btn-icon hx-btn-icon-danger"
                    onClick={() => removeWorkItem(item.id)}
                    aria-label="Eliminar experiencia laboral"
                    title="Eliminar"
                  >
                    <i className="bi bi-trash3-fill"></i>
                  </button>
                </div>
              </div>

              <p className="hx-section-record-description">
                {item.description || "Sin descripción"}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}