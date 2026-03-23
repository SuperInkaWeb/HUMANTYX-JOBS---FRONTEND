import { AVAILABILITY } from "../../utils/profileHelpers";

export default function ProfessionalInfoModal({
  isOpen,
  closeModal,
  onSave,
  saving,
  form,
  onChange,
}) {
  if (!isOpen) return null;

  return (
    <div className="hx-modal-overlay">
      <div
        className="hx-modal-card hx-modal-card--wide"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hx-modal-header">
          <div className="hx-modal-title-wrap">
            <h2 className="hx-modal-title">Editar información profesional</h2>
            <p className="hx-modal-subtitle">
              Actualiza tu experiencia general, disponibilidad y resumen profesional.
            </p>
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

        <form onSubmit={onSave}>
          <div className="hx-modal-body">
            <div className="hx-modal-grid-2">
              <div className="hx-modal-field">
                <label className="hx-modal-label">Años de experiencia general</label>
                <input
                  type="text"
                  name="experience_years"
                  className="hx-modal-input"
                  value={form.experience_years ?? ""}
                  onChange={onChange}
                  placeholder="Ej. 3"
                  inputMode="numeric"
                />
              </div>

              <div className="hx-modal-field">
                <label className="hx-modal-label">Disponibilidad</label>
                <select
                  name="availability"
                  className="hx-modal-select"
                  value={form.availability || ""}
                  onChange={onChange}
                >
                  {AVAILABILITY.map((option) => (
                    <option key={option.value || "empty"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="hx-modal-field hx-modal-field--full">
                <label className="hx-modal-label">Acerca de mí</label>
                <textarea
                  name="about"
                  className="hx-modal-textarea"
                  value={form.about || ""}
                  onChange={onChange}
                  placeholder="Describe tu experiencia, fortalezas y enfoque profesional"
                />
              </div>
            </div>
          </div>

          <div className="hx-modal-footer">
            <button
              type="button"
              className="hx-btn-modal-cancel"
              onClick={closeModal}
              disabled={saving}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="hx-btn-modal-save"
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}