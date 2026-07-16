import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { apiFetch } from "../../services/api";
import ConfirmActionModal from "../../components/shared/ConfirmActionModal";
import RichTextEditor from "../../components/shared/RichTextEditor";
import "../../components/shared/rich-text-editor.css";
import "./admin-job-form.css";

const JOB_STATUS_OPTIONS = [
  { value: "DRAFT", label: "Borrador" },
  { value: "PUBLISHED", label: "Publicado" },
  { value: "CLOSED", label: "Cerrado" },
];

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: "internship", label: "Prácticas" },
  { value: "full_time", label: "Tiempo completo" },
  { value: "part_time", label: "Medio tiempo" },
  { value: "contract", label: "Contrato" },
];

const EMPTY_FORM = {
  title: "",
  location: "",
  employment_type: "",
  salary_range: "",
  description: "",
  status: "DRAFT",
};

function stripHtml(html) {
  return String(html || "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeHtml(html) {
  return String(html || "").trim();
}

function normalizeForm(data) {
  return {
    title: String(data?.title || "").trim(),
    location: String(data?.location || "").trim(),
    employment_type: String(data?.employment_type || "").trim(),
    salary_range: String(data?.salary_range || "").trim(),
    description: normalizeHtml(data?.description || ""),
    status: String(data?.status || "").trim(),
  };
}

function normalizeEmploymentType(value) {
  const raw = String(value || "").trim();

  const map = {
    internship: "internship",
    practicas: "internship",
    "prácticas": "internship",

    full_time: "full_time",
    "full-time": "full_time",
    "tiempo completo": "full_time",

    part_time: "part_time",
    "part-time": "part_time",
    "medio tiempo": "part_time",

    contract: "contract",
    contrato: "contract",
  };

  return map[raw.toLowerCase()] || raw;
}

export default function AdminJobForm({
  embedded = false,
  onClose,
  onSaved,
  jobId = null,
}) {
  const params = useParams();
  const nav = useNavigate();

  const effectiveId = jobId ?? params.id;
  const editing = Boolean(effectiveId);

  const [form, setForm] = useState(EMPTY_FORM);
  const [submitIntent, setSubmitIntent] = useState("DRAFT");
  const initialSnapshotRef = useRef(normalizeForm(EMPTY_FORM));

  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [confirmState, setConfirmState] = useState({
    open: false,
    mode: null,
  });

  useEffect(() => {
    if (!editing) {
      setForm(EMPTY_FORM);
      setSubmitIntent("DRAFT");
      initialSnapshotRef.current = normalizeForm(EMPTY_FORM);
      setFieldErrors({});
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setError("");
        setMsg("");
        setLoading(true);

        const data = await apiFetch(`/admin/jobs/${effectiveId}`);
        const job = data?.job ?? data;

        const next = {
          title: job?.title ?? "",
          location: job?.location ?? "",
          employment_type: normalizeEmploymentType(job?.employment_type),
          salary_range: job?.salary_range ?? "",
          description: job?.description ?? "",
          status: job?.status ?? "DRAFT",
        };

        setForm(next);
        initialSnapshotRef.current = normalizeForm(next);
        setFieldErrors({});
      } catch (e) {
        setError(e.message || "No se pudo cargar la vacante");
      } finally {
        setLoading(false);
      }
    })();
  }, [editing, effectiveId]);

  const hasChanges = useMemo(() => {
    return (
      JSON.stringify(normalizeForm(form)) !==
      JSON.stringify(initialSnapshotRef.current)
    );
  }, [form]);

  useEffect(() => {
    if (!embedded) return;

    function onKeyDown(e) {
      if (e.key === "Escape") {
        handleRequestClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  function onChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setError("");
    setMsg("");
  }

  function onDescriptionChange(nextHtml) {
    setForm((prev) => ({
      ...prev,
      description: nextHtml,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      description: "",
    }));

    setError("");
    setMsg("");
  }

  function validateForm() {
    const cleaned = normalizeForm(form);
    const nextErrors = {};

    if (!cleaned.title) nextErrors.title = "El título es obligatorio.";
    if (!cleaned.location) nextErrors.location = "La ubicación es obligatoria.";

    if (!cleaned.employment_type) {
      nextErrors.employment_type = "Selecciona el tipo de empleo.";
    }

    if (!cleaned.salary_range) {
      nextErrors.salary_range = "El rango salarial es obligatorio.";
    }

    if (!stripHtml(cleaned.description)) {
      nextErrors.description = "La descripción es obligatoria.";
    }

    if (editing && !cleaned.status) {
      nextErrors.status = "Selecciona el estado.";
    }

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setError("Completa todos los campos obligatorios antes de continuar.");
      return false;
    }

    setError("");
    return true;
  }

  function performClose() {
    setConfirmState({ open: false, mode: null });

    if (embedded && onClose) {
      onClose();
      return;
    }

    nav("/rrhh/vacantes");
  }

  function handleRequestClose() {
    if (saving) return;

    if (!hasChanges) {
      performClose();
      return;
    }

    setConfirmState({
      open: true,
      mode: "cancel",
    });
  }

  function handleCancelClick() {
    handleRequestClose();
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!editing) {
      setSubmitIntent("PUBLISHED");
    }

    if (!validateForm()) return;

    setConfirmState({
      open: true,
      mode: "save",
    });
  }

  function handleSaveDraft() {
    setSubmitIntent("DRAFT");

    if (!validateForm()) return;

    setConfirmState({
      open: true,
      mode: "save",
    });
  }

  function handlePublishJob() {
    setSubmitIntent("PUBLISHED");

    if (!validateForm()) return;

    setConfirmState({
      open: true,
      mode: "save",
    });
  }

  function closeConfirm() {
    if (saving) return;
    setConfirmState({ open: false, mode: null });
  }

  async function persistJob() {
    const cleaned = normalizeForm(form);

    const statusToSave = editing ? cleaned.status : submitIntent;

    const payload = {
      ...cleaned,
      status: statusToSave,
    };

    try {
      setSaving(true);
      setError("");
      setMsg("");

      if (editing) {
        await apiFetch(`/admin/jobs/${effectiveId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        setMsg("Vacante actualizada.");
        initialSnapshotRef.current = normalizeForm(payload);
      } else {
        await apiFetch("/admin/jobs", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setMsg(
          statusToSave === "DRAFT"
            ? "Vacante guardada como borrador."
            : "Vacante publicada."
        );

        initialSnapshotRef.current = normalizeForm(payload);
      }

      setConfirmState({ open: false, mode: null });

      if (embedded) {
        if (onSaved) await onSaved();
        if (onClose) onClose();
        return;
      }

      setTimeout(() => nav("/rrhh/vacantes"), 350);
    } catch (e) {
      setError(e.message || "No se pudo guardar la vacante");
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmAction() {
    if (confirmState.mode === "cancel") {
      performClose();
      return;
    }

    if (confirmState.mode === "save") {
      await persistJob();
    }
  }

  const shellClass = embedded ? "ajf ajf--embedded" : "ajf";

  const headingTitle = editing ? "Editar vacante" : "Crear vacante";

  const headingText = editing
    ? "Actualiza la información principal de esta vacante."
    : "Completa los detalles y decide si deseas guardarla como borrador o publicarla.";

  const confirmSaveTitle = editing
    ? "Guardar cambios"
    : submitIntent === "DRAFT"
    ? "Guardar borrador"
    : "Publicar vacante";

  const confirmSaveMessage = editing
    ? "¿Deseas guardar los cambios realizados en esta vacante?"
    : submitIntent === "DRAFT"
    ? "¿Deseas guardar esta vacante como borrador?"
    : "¿Deseas publicar esta vacante en el portal de empleos?";

  const confirmSaveText = editing
    ? "Sí, guardar"
    : submitIntent === "DRAFT"
    ? "Sí, guardar borrador"
    : "Sí, publicar";

  return (
    <>
      <div className={shellClass}>
        <div className="ajf-card">
          <div className="ajf-card__header">
            <div className="ajf-card__header-copy">
              <h2>{headingTitle}</h2>
              <p>{headingText}</p>
            </div>

            {embedded ? (
              <button
                type="button"
                className="ajf-close-btn"
                onClick={handleRequestClose}
                aria-label="Cerrar modal"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            ) : (
              <Link to="/rrhh/vacantes" className="ajf-back-link">
                <i className="bi bi-arrow-left"></i>
                <span>Volver</span>
              </Link>
            )}
          </div>

          <div className="ajf-card__divider"></div>

          <div className="ajf-card__body">
            {loading && <div className="ajf-feedback">Cargando...</div>}

            {error && (
              <div className="alert alert-danger ajf-alert">{error}</div>
            )}

            {msg && !embedded && (
              <div className="alert alert-success ajf-alert">{msg}</div>
            )}

            {!loading && (
              <form onSubmit={handleSubmit} className="ajf-form" noValidate>
                <div className="ajf-grid ajf-grid--single">
                  <div className="ajf-field">
                    <label htmlFor="title">Título del puesto</label>
                    <input
                      id="title"
                      className={`ajf-input ${
                        fieldErrors.title ? "is-invalid" : ""
                      }`}
                      name="title"
                      value={form.title}
                      onChange={onChange}
                      placeholder="Ej: Practicante Backend Node.js"
                      aria-invalid={Boolean(fieldErrors.title)}
                    />
                    {fieldErrors.title && (
                      <span className="ajf-field-error">
                        {fieldErrors.title}
                      </span>
                    )}
                  </div>
                </div>

                <div className="ajf-grid ajf-grid--two">
                  <div className="ajf-field">
                    <label htmlFor="location">Ubicación</label>
                    <div className="ajf-input-wrap">
                      <span className="ajf-input-icon">
                        <i className="bi bi-geo-alt-fill"></i>
                      </span>
                      <input
                        id="location"
                        className={`ajf-input ajf-input--with-icon ${
                          fieldErrors.location ? "is-invalid" : ""
                        }`}
                        name="location"
                        value={form.location}
                        onChange={onChange}
                        placeholder="Ej: Lima"
                        aria-invalid={Boolean(fieldErrors.location)}
                      />
                    </div>
                    {fieldErrors.location && (
                      <span className="ajf-field-error">
                        {fieldErrors.location}
                      </span>
                    )}
                  </div>

                  <div className="ajf-field">
                    <label htmlFor="employment_type">Tipo de empleo</label>
                    <select
                      id="employment_type"
                      className={`ajf-select ${
                        fieldErrors.employment_type ? "is-invalid" : ""
                      }`}
                      name="employment_type"
                      value={form.employment_type}
                      onChange={onChange}
                      aria-invalid={Boolean(fieldErrors.employment_type)}
                    >
                      <option value="">Seleccionar...</option>
                      {EMPLOYMENT_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.employment_type && (
                      <span className="ajf-field-error">
                        {fieldErrors.employment_type}
                      </span>
                    )}
                  </div>

                  <div className="ajf-field">
                    <label htmlFor="salary_range">Rango salarial</label>
                    <div className="ajf-input-wrap">
                      <span className="ajf-input-icon">
                        <i className="bi bi-cash-stack"></i>
                      </span>
                      <input
                        id="salary_range"
                        className={`ajf-input ajf-input--with-icon ${
                          fieldErrors.salary_range ? "is-invalid" : ""
                        }`}
                        name="salary_range"
                        value={form.salary_range}
                        onChange={onChange}
                        placeholder="Ej: S/ 1200 - 1500"
                        aria-invalid={Boolean(fieldErrors.salary_range)}
                      />
                    </div>
                    {fieldErrors.salary_range && (
                      <span className="ajf-field-error">
                        {fieldErrors.salary_range}
                      </span>
                    )}
                  </div>

                  {editing && (
                    <div className="ajf-field">
                      <label htmlFor="status">Estado</label>
                      <select
                        id="status"
                        className={`ajf-select ${
                          fieldErrors.status ? "is-invalid" : ""
                        }`}
                        name="status"
                        value={form.status}
                        onChange={onChange}
                        aria-invalid={Boolean(fieldErrors.status)}
                      >
                        <option value="">Seleccionar...</option>
                        {JOB_STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {fieldErrors.status && (
                        <span className="ajf-field-error">
                          {fieldErrors.status}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="ajf-grid ajf-grid--single">
                  <div className="ajf-field">
                    <label htmlFor="description">Descripción del puesto</label>

                    <RichTextEditor
                      id="description"
                      value={form.description}
                      onChange={onDescriptionChange}
                      invalid={Boolean(fieldErrors.description)}
                      placeholder="Describe el rol, responsabilidades, requisitos y beneficios..."
                    />

                    {fieldErrors.description && (
                      <span className="ajf-field-error">
                        {fieldErrors.description}
                      </span>
                    )}
                  </div>
                </div>

                <div className="ajf-card__footer">
                  <button
                    type="button"
                    className="ajf-btn ajf-btn--ghost"
                    onClick={handleCancelClick}
                    disabled={saving}
                  >
                    Cancelar
                  </button>

                  {editing ? (
                    <button
                      type="submit"
                      className="ajf-btn ajf-btn--primary"
                      disabled={saving}
                    >
                      {saving ? "Guardando..." : "Guardar cambios"}
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="ajf-btn ajf-btn--secondary"
                        onClick={handleSaveDraft}
                        disabled={saving}
                      >
                        {saving && submitIntent === "DRAFT"
                          ? "Guardando..."
                          : "Guardar borrador"}
                      </button>

                      <button
                        type="button"
                        className="ajf-btn ajf-btn--primary"
                        onClick={handlePublishJob}
                        disabled={saving}
                      >
                        {saving && submitIntent === "PUBLISHED"
                          ? "Publicando..."
                          : "Publicar vacante"}
                      </button>
                    </>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <ConfirmActionModal
        isOpen={confirmState.open}
        title={
          confirmState.mode === "save" ? confirmSaveTitle : "Descartar cambios"
        }
        message={
          confirmState.mode === "save"
            ? confirmSaveMessage
            : "Hay cambios sin guardar. ¿Seguro que deseas salir sin guardar?"
        }
        confirmText={
          confirmState.mode === "save" ? confirmSaveText : "Sí, salir"
        }
        cancelText={
          confirmState.mode === "save" ? "Cancelar" : "Seguir editando"
        }
        danger={confirmState.mode === "cancel"}
        loading={saving}
        onCancel={closeConfirm}
        onConfirm={handleConfirmAction}
      />
    </>
  );
}