import {
  ACADEMIC_STATUS,
  EDUCATION,
  formatDate,
  formatYears,
} from "../../../utils/profileHelpers";

export default function AcademicSectionModal({
  isOpen,
  closeModal,
  onSave,
  saving,
  items,
  openAddItem,
  openEditItem,
  removeAcademicItem,
}) {
  if (!isOpen) return null;

  return (
    <div className="hx-modal-backdrop" onClick={closeModal}>
      <div
        className="hx-modal-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="academic-section-title"
      >
        <div className="hx-modal-header">
          <div>
            <h2 id="academic-section-title" className="hx-modal-title">
              Editar información académica
            </h2>
            <p className="hx-modal-subtitle">
              Administra tus estudios, agrega nuevos y edita cada formación por separado.
            </p>
          </div>

          <button
            type="button"
            className="hx-btn-close"
            onClick={closeModal}
            aria-label="Cerrar"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <form onSubmit={onSave} className="hx-modal-body">
          <div className="hx-profile-form-block">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="hx-profile-form-title mb-0">Formaciones registradas</h4>

              <button
                type="button"
                className="hx-btn-secondary"
                onClick={openAddItem}
              >
                <i className="bi bi-plus-lg me-2"></i>
                Agregar formación
              </button>
            </div>

            <div className="d-flex flex-column gap-4">
              {items.length === 0 ? (
                <div className="hx-profile-shell-card is-compact">
                  Aún no tienes formación registrada.
                </div>
              ) : (
                items.map((item, index) => {
                  const eduLabel = item.education_level
                    ? EDUCATION.find((x) => x.value === item.education_level)?.label ||
                      "No especificado"
                    : "No especificado";

                  const statusLabel = item.academic_status
                    ? ACADEMIC_STATUS.find((x) => x.value === item.academic_status)?.label ||
                      "No especificado"
                    : "No especificado";

                  return (
                    <div key={item.id} className="hx-profile-shell-card p-3">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <strong>
                          {item.institution?.trim() ||
                            item.career?.trim() ||
                            `Formación #${index + 1}`}
                        </strong>

                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="hx-btn-secondary"
                            onClick={() => openEditItem(item.id)}
                          >
                            <i className="bi bi-pencil me-2"></i>
                            Editar
                          </button>

                          <button
                            type="button"
                            className="hx-btn-secondary"
                            onClick={() => removeAcademicItem(item.id)}
                          >
                            <i className="bi bi-trash me-2"></i>
                            Borrar
                          </button>
                        </div>
                      </div>

                      <div className="hx-profile-info-grid">
                        <div className="hx-profile-info-item">
                          <span className="hx-profile-info-label">Nivel de estudios</span>
                          <strong>{eduLabel}</strong>
                        </div>

                        <div className="hx-profile-info-item">
                          <span className="hx-profile-info-label">Institución educativa</span>
                          <strong>{item.institution?.trim() || "No especificada"}</strong>
                        </div>

                        <div className="hx-profile-info-item">
                          <span className="hx-profile-info-label">Carrera / especialidad</span>
                          <strong>{item.career?.trim() || "No especificada"}</strong>
                        </div>

                        <div className="hx-profile-info-item">
                          <span className="hx-profile-info-label">Estado académico</span>
                          <strong>{statusLabel}</strong>
                        </div>

                        <div className="hx-profile-info-item">
                          <span className="hx-profile-info-label">Fecha de inicio</span>
                          <strong>{formatDate(item.start_date)}</strong>
                        </div>

                        <div className="hx-profile-info-item">
                          <span className="hx-profile-info-label">Fecha de fin</span>
                          <strong>{formatDate(item.end_date)}</strong>
                        </div>

                        <div className="hx-profile-info-item">
                          <span className="hx-profile-info-label">Ubicación</span>
                          <strong>{item.location?.trim() || "No especificada"}</strong>
                        </div>

                        <div className="hx-profile-info-item">
                          <span className="hx-profile-info-label">Años totales</span>
                          <strong>{formatYears(item.total_years)}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="hx-modal-footer">
            <button
              type="button"
              className="hx-btn-secondary"
              onClick={closeModal}
              disabled={saving}
            >
              Cancelar
            </button>

            <button type="submit" className="hx-btn-primary" disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}