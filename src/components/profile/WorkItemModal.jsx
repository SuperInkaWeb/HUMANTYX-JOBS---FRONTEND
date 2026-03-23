export default function WorkItemModal({
  isOpen,
  closeModal,
  item,
  mode,
  onWorkChange,
  onSaveDraft,
  error,
}) {
  if (!isOpen || !item) return null;

  const title =
    mode === "create"
      ? "Agregar experiencia laboral"
      : "Editar experiencia laboral";

  const subtitle =
    mode === "create"
      ? "Completa los datos de tu experiencia para sumarlos a tu perfil."
      : "Actualiza los datos de esta experiencia laboral.";

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
              <label className="hx-modal-label">Cargo</label>
              <input
                type="text"
                className="hx-modal-input"
                value={item.position || ""}
                onChange={(e) => onWorkChange("position", e.target.value)}
                placeholder="Ej. Desarrollador Frontend"
              />
            </div>

            <div className="hx-modal-field">
              <label className="hx-modal-label">Empresa</label>
              <input
                type="text"
                className="hx-modal-input"
                value={item.company || ""}
                onChange={(e) => onWorkChange("company", e.target.value)}
                placeholder="Ej. Humantyx"
              />
            </div>

            <div className="hx-modal-field">
              <label className="hx-modal-label">Fecha de inicio</label>
              <input
                type="date"
                className="hx-modal-input"
                value={item.start_date || ""}
                onChange={(e) => onWorkChange("start_date", e.target.value)}
              />
            </div>

            <div className="hx-modal-field">
              <label className="hx-modal-label">Fecha de fin</label>
              <input
                type="date"
                className="hx-modal-input"
                value={item.end_date || ""}
                onChange={(e) => onWorkChange("end_date", e.target.value)}
              />
            </div>

            <div className="hx-modal-field">
              <label className="hx-modal-label">Ubicación</label>
              <input
                type="text"
                className="hx-modal-input"
                value={item.location || ""}
                onChange={(e) => onWorkChange("location", e.target.value)}
                placeholder="Ej. Lima, Perú"
              />
            </div>

            <div className="hx-modal-field">
              <label className="hx-modal-label">Años totales</label>
              <input
                type="text"
                className="hx-modal-input"
                value={item.total_years ?? ""}
                onChange={(e) => onWorkChange("total_years", e.target.value)}
                placeholder="Ej. 2"
                inputMode="numeric"
              />
            </div>

            <div className="hx-modal-field hx-modal-field--full">
              <label className="hx-modal-label">Descripción</label>
              <textarea
                className="hx-modal-textarea"
                value={item.description || ""}
                onChange={(e) => onWorkChange("description", e.target.value)}
                placeholder="Describe tus funciones, logros o responsabilidades"
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
            {mode === "create" ? "Agregar experiencia" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}