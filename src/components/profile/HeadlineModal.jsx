export default function HeadlineModal({
  isOpen,
  closeModal,
  onSave,
  saving,
  form,
  onChange,
}) {
  if (!isOpen) return null;

  return (
    <div className="hx-modal-backdrop">
      <div
        className="hx-modal-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="headline-modal-title"
      >
        <div className="hx-modal-header">
          <div>
            <h2 id="headline-modal-title" className="hx-modal-title">
              Editar titular profesional
            </h2>
            <p className="hx-modal-subtitle">
              Este texto aparecerá debajo de tu nombre en el perfil.
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
            <label className="form-label hx-label">Titular / Headline</label>
            <input
              className="hx-input"
              name="headline"
              value={form.headline}
              onChange={onChange}
              placeholder="Ej: Programador fullstack"
            />
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