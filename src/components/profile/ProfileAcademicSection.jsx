function formatYear(dateValue) {
  if (!dateValue) return "Actualidad";

  try {
    return new Intl.DateTimeFormat("es-PE", {
      year: "numeric",
    }).format(new Date(dateValue));
  } catch {
    return dateValue;
  }
}

export default function ProfileAcademicSection({
  hasAcademicInfo,
  visibleAcademicItems,
  openAcademicSectionForAdd,
  openSectionModal,
  removeAcademicItem,
}) {
  return (
    <section className="hx-section-shell">
      <div className="hx-section-top-row">
        <h2 className="hx-section-main-title">Información Académica</h2>

        <button
          type="button"
          className="hx-btn-section"
          onClick={openAcademicSectionForAdd}
        >
          <i className="bi bi-plus-lg"></i>
          Agregar
        </button>
      </div>

      {!hasAcademicInfo ? (
        <div className="hx-section-empty-state">
          <p className="hx-section-empty-text">
            Aún no has agregado información académica.
          </p>
        </div>
      ) : (
        <div className="hx-section-record-list">
          {visibleAcademicItems.map((item) => (
            <article key={item.id} className="hx-section-record-wrap">
              <div className="hx-section-record-head">
                <div className="hx-section-record-main">
                  <div className="hx-section-record-icon">
                    <i className="bi bi-mortarboard-fill"></i>
                  </div>

                  <div>
                    <h3 className="hx-section-record-title">
                      {item.institution || "Institución educativa"}
                    </h3>

                    <p className="hx-section-record-subtitle">
                      {item.career || "Carrera o especialidad"}
                    </p>

                    <div className="hx-section-record-meta">
                      <span>
                        <i className="bi bi-calendar3"></i>
                        {formatYear(item.start_date)} - {formatYear(item.end_date)}
                      </span>

                      <span>
                        <i className="bi bi-patch-check-fill"></i>
                        {item.academic_status || "No especificado"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="hx-section-record-actions">
                  <button
                    type="button"
                    className="hx-btn-icon"
                    onClick={() => openSectionModal("academic", item.id)}
                    aria-label="Editar información académica"
                    title="Editar"
                  >
                    <i className="bi bi-pencil-fill"></i>
                  </button>

                  <button
                    type="button"
                    className="hx-btn-icon hx-btn-icon-danger"
                    onClick={() => removeAcademicItem(item.id)}
                    aria-label="Eliminar información académica"
                    title="Eliminar"
                  >
                    <i className="bi bi-trash3-fill"></i>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}