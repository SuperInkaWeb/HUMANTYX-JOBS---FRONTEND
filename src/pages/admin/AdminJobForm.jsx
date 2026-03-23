import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { apiFetch } from "../../services/api";
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

  const [form, setForm] = useState({
    title: "",
    location: "",
    employment_type: "internship",
    salary_range: "",
    description: "",
    status: "DRAFT",
  });

  const originalStatusRef = useRef("DRAFT");

  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!editing) {
      setForm({
        title: "",
        location: "",
        employment_type: "internship",
        salary_range: "",
        description: "",
        status: "DRAFT",
      });
      originalStatusRef.current = "DRAFT";
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
          employment_type: job?.employment_type ?? "internship",
          salary_range: job?.salary_range ?? "",
          description: job?.description ?? "",
          status: job?.status ?? "DRAFT",
        };

        setForm(next);
        originalStatusRef.current = next.status;
      } catch (e) {
        setError(e.message || "No se pudo cargar la vacante");
      } finally {
        setLoading(false);
      }
    })();
  }, [editing, effectiveId]);

  useEffect(() => {
    if (!embedded) return;

    function onKeyDown(e) {
      if (e.key === "Escape" && onClose) onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [embedded, onClose]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleCancel() {
    if (embedded && onClose) {
      onClose();
      return;
    }

    nav("/rrhh/vacantes");
  }

  async function onSubmit(e) {
    e.preventDefault();

    if (!form.title.trim()) {
      setError("El título es obligatorio.");
      return;
    }

    try {
      setError("");
      setMsg("");
      setSaving(true);

      if (editing) {
        const { status, ...rest } = form;

        await apiFetch(`/admin/jobs/${effectiveId}`, {
          method: "PUT",
          body: JSON.stringify(rest),
        });

        const prevStatus = originalStatusRef.current;

        if (status !== prevStatus) {
          await apiFetch(`/admin/jobs/${effectiveId}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status }),
          });
          originalStatusRef.current = status;
        }

        setMsg("Vacante actualizada.");
      } else {
        await apiFetch("/admin/jobs", {
          method: "POST",
          body: JSON.stringify(form),
        });

        setMsg("Vacante creada.");
      }

      if (embedded) {
        if (onSaved) await onSaved();
        if (onClose) onClose();
        return;
      }

      setTimeout(() => nav("/rrhh/vacantes"), 400);
    } catch (e2) {
      setError(e2.message || "No se pudo guardar la vacante");
    } finally {
      setSaving(false);
    }
  }

  const shellClass = embedded ? "ajf ajf--embedded" : "ajf";
  const headingTitle = editing ? "Editar vacante" : "Crear vacante";
  const headingText = editing
    ? "Actualiza la información principal de esta vacante."
    : "Completa los detalles para publicar una nueva oportunidad en la plataforma.";

  return (
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
              onClick={onClose}
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
          {error && <div className="alert alert-danger ajf-alert">{error}</div>}
          {msg && !embedded && (
            <div className="alert alert-success ajf-alert">{msg}</div>
          )}

          {!loading && (
            <form onSubmit={onSubmit} className="ajf-form">
              <div className="ajf-grid ajf-grid--single">
                <div className="ajf-field">
                  <label htmlFor="title">Título del puesto</label>
                  <input
                    id="title"
                    className="ajf-input"
                    name="title"
                    value={form.title}
                    onChange={onChange}
                    placeholder="Ej: Practicante Backend Node.js"
                  />
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
                      className="ajf-input ajf-input--with-icon"
                      name="location"
                      value={form.location}
                      onChange={onChange}
                      placeholder="Ej: Lima"
                    />
                  </div>
                </div>

                <div className="ajf-field">
                  <label htmlFor="employment_type">Tipo de empleo</label>
                  <select
                    id="employment_type"
                    className="ajf-select"
                    name="employment_type"
                    value={form.employment_type}
                    onChange={onChange}
                  >
                    {EMPLOYMENT_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ajf-field">
                  <label htmlFor="salary_range">Rango salarial</label>
                  <div className="ajf-input-wrap">
                    <span className="ajf-input-icon">
                      <i className="bi bi-cash-stack"></i>
                    </span>
                    <input
                      id="salary_range"
                      className="ajf-input ajf-input--with-icon"
                      name="salary_range"
                      value={form.salary_range}
                      onChange={onChange}
                      placeholder="Ej: S/ 1200 - 1500"
                    />
                  </div>
                </div>

                <div className="ajf-field">
                  <label htmlFor="status">Estado</label>
                  <select
                    id="status"
                    className="ajf-select"
                    name="status"
                    value={form.status || "DRAFT"}
                    onChange={onChange}
                  >
                    {JOB_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="ajf-grid ajf-grid--single">
                <div className="ajf-field">
                  <label htmlFor="description">Descripción del puesto</label>
                  <textarea
                    id="description"
                    className="ajf-textarea"
                    name="description"
                    value={form.description}
                    onChange={onChange}
                    rows={7}
                    placeholder="Describe el rol, responsabilidades, requisitos y beneficios..."
                  />
                </div>
              </div>

              <div className="ajf-card__footer">
                <button
                  type="button"
                  className="ajf-btn ajf-btn--ghost"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="ajf-btn ajf-btn--primary"
                  disabled={saving}
                >
                  {saving
                    ? "Guardando..."
                    : editing
                    ? "Guardar cambios"
                    : "Guardar vacante"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}