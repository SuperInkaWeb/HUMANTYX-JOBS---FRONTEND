import { DOC_TYPES, GENDERS, MARITAL } from "../../utils/profileHelpers";

export default function PersonalInfoModal({
  isOpen,
  closeModal,
  onSave,
  saving,
  form,
  onChange,
  onDocumentTypeChange,
  error = "",
}) {
  if (!isOpen) return null;

  return (
    <div className="hx-modal-backdrop hx-personal-modal-backdrop">
      <div
        className="hx-modal-panel hx-personal-modal-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="personal-info-title"
      >
        <div className="hx-personal-modal-header">
          <div className="hx-personal-modal-heading">
            <h2 id="personal-info-title" className="hx-personal-modal-title">
              Editar información personal
            </h2>
            <p className="hx-personal-modal-subtitle">
              Actualiza tus datos obligatorios y personales para completar tu perfil.
            </p>
          </div>

          <button
            type="button"
            className="hx-personal-modal-close"
            onClick={closeModal}
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={onSave} className="hx-personal-modal-body">
          {error ? (
            <div className="alert alert-danger rounded-4 mb-3">
              {error}
            </div>
          ) : null}

          <div className="hx-personal-grid">
            <div className="hx-personal-field hx-col-6">
              <label className="hx-personal-label">Nombres *</label>
              <input
                className="hx-personal-input"
                name="first_name"
                value={form.first_name || ""}
                onChange={onChange}
              />
            </div>

            <div className="hx-personal-field hx-col-6">
              <label className="hx-personal-label">Apellidos *</label>
              <input
                className="hx-personal-input"
                name="last_name"
                value={form.last_name || ""}
                onChange={onChange}
              />
            </div>

            <div className="hx-personal-field hx-col-6">
              <label className="hx-personal-label">Teléfono *</label>
              <input
                className="hx-personal-input"
                name="phone"
                value={form.phone || ""}
                onChange={onChange}
                maxLength={9}
                inputMode="numeric"
              />
            </div>

            <div className="hx-personal-field hx-col-3">
              <label className="hx-personal-label">Tipo documento *</label>
              <select
                className="hx-personal-input hx-personal-select"
                name="document_type"
                value={form.document_type || ""}
                onChange={(e) => onDocumentTypeChange(e.target.value)}
              >
                {DOC_TYPES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="hx-personal-field hx-col-3">
              <label className="hx-personal-label">N° documento *</label>
              <input
                className="hx-personal-input"
                name="document_number"
                value={form.document_number || ""}
                onChange={onChange}
                maxLength={20}
              />
            </div>

            <div className="hx-personal-field hx-col-6">
              <label className="hx-personal-label">País *</label>
              <input
                className="hx-personal-input"
                name="country"
                value={form.country || ""}
                onChange={onChange}
              />
            </div>

            <div className="hx-personal-field hx-col-6">
              <label className="hx-personal-label">Departamento/Estado *</label>
              <input
                className="hx-personal-input"
                name="department"
                value={form.department || ""}
                onChange={onChange}
              />
            </div>

            <div className="hx-personal-field hx-col-6">
              <label className="hx-personal-label">Ciudad *</label>
              <input
                className="hx-personal-input"
                name="city"
                value={form.city || ""}
                onChange={onChange}
              />
            </div>

            <div className="hx-personal-field hx-col-6">
              <label className="hx-personal-label">Fecha de nacimiento</label>
              <input
                type="date"
                className="hx-personal-input hx-personal-date"
                name="birth_date"
                value={form.birth_date || ""}
                onChange={onChange}
              />
            </div>

            <div className="hx-personal-field hx-col-6">
              <label className="hx-personal-label">Género</label>
              <select
                className="hx-personal-input hx-personal-select"
                name="gender"
                value={form.gender || ""}
                onChange={onChange}
              >
                {GENDERS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="hx-personal-field hx-col-6">
              <label className="hx-personal-label">Estado civil</label>
              <select
                className="hx-personal-input hx-personal-select"
                name="marital_status"
                value={form.marital_status || ""}
                onChange={onChange}
              >
                {MARITAL.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="hx-personal-modal-footer">
            <button
              type="button"
              className="hx-personal-btn-cancel"
              onClick={closeModal}
              disabled={saving}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="hx-personal-btn-save"
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