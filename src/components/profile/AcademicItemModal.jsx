import { ACADEMIC_STATUS, EDUCATION } from "../../utils/profileHelpers";

export default function AcademicItemModal({
  isOpen,
  closeModal,
  item,
  mode,
  onAcademicChange,
  onSaveDraft,
  error,
}) {
  if (!isOpen || !item) return null;

  const title =
    mode === "create"
      ? "Agregar información académica"
      : "Editar información académica";

  const subtitle =
    mode === "create"
      ? "Completa los datos de tu formación para sumarlos a tu perfil."
      : "Actualiza los datos de esta formación académica.";

  return (
    <div className="hx-modal-overlay">
      <div
        className="hx-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hx-modal-header">
          <div className="hx-modal-title-wrap">
            <h2 className="hx-modal-title">{title}</h2>
            <p className="hx-modal-subtitle">{subtitle}</p>
          </div>

          <button
            type="button"
            className="hx-modal-close"
            onClick={closeModal}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <hr className="hx-modal-divider" />

        <div className="hx-modal-body">
          {error ? <div className="hx-modal-alert">{error}</div> : null}

          <div className="hx-modal-grid-2">
            <div className="hx-modal-field">
              <label className="hx-modal-label">Nivel de estudios</label>
              <select
                className="hx-modal-select"
                value={item.education_level || ""}
                onChange={(e) => onAcademicChange("education_level", e.target.value)}
              >
                {EDUCATION.map((level) => (
                  <option key={level.value || "empty"} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="hx-modal-field">
              <label className="hx-modal-label">Estado académico</label>
              <select
                className="hx-modal-select"
                value={item.academic_status || ""}
                onChange={(e) => onAcademicChange("academic_status", e.target.value)}
              >
                {ACADEMIC_STATUS.map((status) => (
                  <option key={status.value || "empty"} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="hx-modal-field hx-modal-field--full">
              <label className="hx-modal-label">Institución educativa</label>
              <input
                type="text"
                className="hx-modal-input"
                value={item.institution || ""}
                onChange={(e) => onAcademicChange("institution", e.target.value)}
                placeholder="Ej. Universidad Nacional Mayor de San Marcos"
              />
            </div>

            <div className="hx-modal-field hx-modal-field--full">
              <label className="hx-modal-label">Carrera o especialidad</label>
              <input
                type="text"
                className="hx-modal-input"
                value={item.career || ""}
                onChange={(e) => onAcademicChange("career", e.target.value)}
                placeholder="Ej. Ingeniería de Sistemas"
              />
            </div>

            <div className="hx-modal-field">
              <label className="hx-modal-label">Fecha de inicio</label>
              <input
                type="date"
                className="hx-modal-input"
                value={item.start_date || ""}
                onChange={(e) => onAcademicChange("start_date", e.target.value)}
              />
            </div>

            <div className="hx-modal-field">
              <label className="hx-modal-label">Fecha de fin</label>
              <input
                type="date"
                className="hx-modal-input"
                value={item.end_date || ""}
                onChange={(e) => onAcademicChange("end_date", e.target.value)}
              />
            </div>

            <div className="hx-modal-field">
              <label className="hx-modal-label">Ubicación</label>
              <input
                type="text"
                className="hx-modal-input"
                value={item.location || ""}
                onChange={(e) => onAcademicChange("location", e.target.value)}
                placeholder="Ej. Lima, Perú"
              />
            </div>

            <div className="hx-modal-field">
              <label className="hx-modal-label">Años totales</label>
              <input
                type="text"
                className="hx-modal-input"
                value={item.total_years ?? ""}
                onChange={(e) => onAcademicChange("total_years", e.target.value)}
                placeholder="Ej. 5"
                inputMode="numeric"
              />
            </div>
          </div>
        </div>

        <div className="hx-modal-footer">
          <button
            type="button"
            className="hx-btn-modal-cancel"
            onClick={closeModal}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="hx-btn-modal-save"
            onClick={onSaveDraft}
          >
            {mode === "create" ? "Agregar formación" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}