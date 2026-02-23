import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { apiFetch } from "../../services/api";

const JOB_STATUS_OPTIONS = [
  { value: "DRAFT", label: "Borrador" },
  { value: "PUBLISHED", label: "Publicado" },
  { value: "CLOSED", label: "Cerrado" },
];

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: "internship", label: "Prácticas (internship)" },
  { value: "full_time", label: "Tiempo completo (full_time)" },
  { value: "part_time", label: "Medio tiempo (part_time)" },
  { value: "contract", label: "Contrato (contract)" },
];

export default function AdminJobForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const nav = useNavigate();

  const [form, setForm] = useState({
    title: "",
    location: "",
    employment_type: "internship",
    salary_range: "",
    description: "",
    status: "DRAFT",
  });

  // guardar el status original para detectar cambios
  const originalStatusRef = useRef("DRAFT");

  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!editing) return;

    (async () => {
      try {
        setError("");
        setMsg("");
        setLoading(true);

        const data = await apiFetch(`/admin/jobs/${id}`);
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
        originalStatusRef.current = next.status; //  status original
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [editing, id]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return setError("El título es obligatorio.");

    try {
      setError("");
      setMsg("");
      setSaving(true);

      if (editing) {
        // 1) Actualiza datos generales (sin depender de status)
        const { status, ...rest } = form;

        await apiFetch(`/admin/jobs/${id}`, {
          method: "PUT",
          body: JSON.stringify(rest),
        });

        // 2) Si el status cambió, usa el endpoint PATCH /status
        const prevStatus = originalStatusRef.current;
        if (status !== prevStatus) {
          await apiFetch(`/admin/jobs/${id}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status }),
          });
          originalStatusRef.current = status;
        }

        setMsg("Vacante actualizada.");
      } else {
        // crear (aquí sí mandamos status)
        await apiFetch("/admin/jobs", {
          method: "POST",
          body: JSON.stringify(form),
        });
        setMsg("Vacante creada.");
      }

      setTimeout(() => nav("/rrhh/vacantes"), 400);
    } catch (e2) {
      setError(e2.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container py-4" style={{ maxWidth: 900 }}>
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <div>
          <h2 className="fw-bold mb-1">{editing ? "Editar vacante" : "Nueva vacante"}</h2>
          <div className="text-muted small">Completa la información principal de la vacante.</div>
        </div>

        <Link to="/rrhh/vacantes" className="btn btn-outline-secondary rounded-pill px-4">
          Volver
        </Link>
      </div>

      {loading && <div>Cargando...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {msg && <div className="alert alert-success">{msg}</div>}

      {!loading && (
        <form onSubmit={onSubmit} className="card">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-8">
                <label className="form-label">Título</label>
                <input
                  className="form-control"
                  name="title"
                  value={form.title}
                  onChange={onChange}
                  placeholder="Ej: Practicante Backend Node.js"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Estado</label>
                <select
                  className="form-select"
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

              <div className="col-md-6">
                <label className="form-label">Ubicación</label>
                <input
                  className="form-control"
                  name="location"
                  value={form.location}
                  onChange={onChange}
                  placeholder="Ej: Lima"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Tipo de empleo</label>
                <select
                  className="form-select"
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

              <div className="col-md-6">
                <label className="form-label">Rango salarial</label>
                <input
                  className="form-control"
                  name="salary_range"
                  value={form.salary_range}
                  onChange={onChange}
                  placeholder="Ej: S/ 1200 - 1500"
                />
              </div>

              <div className="col-12">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-control"
                  name="description"
                  value={form.description}
                  onChange={onChange}
                  rows={6}
                  placeholder="Describe responsabilidades, requisitos, beneficios..."
                />
              </div>
            </div>

            <div className="d-flex justify-content-end mt-4">
              <button className="btn btn-dark rounded-pill px-4" disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
