import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../services/api";
import AdminJobForm from "./AdminJobForm";
import "./admin-jobs-list.css";

const STATUS_META = {
  PUBLISHED: { label: "Publicado", cls: "is-published" },
  CLOSED: { label: "Cerrado", cls: "is-closed" },
  DRAFT: { label: "Borrador", cls: "is-draft" },
};

const FILTERS = [
  { key: "ALL", label: "Todas" },
  { key: "PUBLISHED", label: "Publicadas" },
  { key: "CLOSED", label: "Cerradas" },
  { key: "DRAFT", label: "Borradores" },
];

function formatEmploymentType(value) {
  if (!value) return "—";

  const map = {
    internship: "Internship",
    part_time: "Part-time",
    "part-time": "Part-time",
    full_time: "Full-time",
    "full-time": "Full-time",
    contract: "Contrato",
  };

  return map[value] || value;
}

export default function AdminJobsList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");

  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);

  async function load() {
    try {
      setLoading(true);
      setError("");
      setMsg("");

      const data = await apiFetch("/admin/jobs");
      const list = data?.jobs ?? data ?? [];
      setRows(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e.message || "No se pudieron cargar las vacantes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!showJobModal) return;

    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = original;
    };
  }, [showJobModal]);

  function openCreateModal() {
    setEditingJobId(null);
    setShowJobModal(true);
  }

  function openEditModal(jobId) {
    setEditingJobId(jobId);
    setShowJobModal(true);
  }

  function closeJobModal() {
    setShowJobModal(false);
    setEditingJobId(null);
  }

  async function onDelete(id) {
    const ok = confirm("¿Seguro que deseas eliminar esta vacante?");
    if (!ok) return;

    try {
      setError("");
      setMsg("");
      await apiFetch(`/admin/jobs/${id}`, { method: "DELETE" });
      setMsg("✅ Vacante eliminada.");
      await load();
    } catch (e) {
      setError(e.message || "No se pudo eliminar la vacante");
    }
  }

  async function onChangeStatus(job, nextStatus) {
    if (job.status === nextStatus) return;

    try {
      setError("");
      setMsg("");

      await apiFetch(`/admin/jobs/${job.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });

      setMsg(
        `✅ Estado actualizado a ${STATUS_META[nextStatus]?.label || nextStatus}.`
      );
      await load();
    } catch (e) {
      setError(e.message || "No se pudo actualizar el estado");
    }
  }

  const summary = useMemo(() => {
    return {
      total: rows.length,
      published: rows.filter((r) => r.status === "PUBLISHED").length,
      closed: rows.filter((r) => r.status === "CLOSED").length,
      draft: rows.filter((r) => r.status === "DRAFT").length,
    };
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (activeFilter === "ALL") return rows;
    return rows.filter((r) => r.status === activeFilter);
  }, [rows, activeFilter]);

  return (
    <>
      <section className="hx-admin-jobs-v2">
        <div className="hx-admin-jobs-v2__header">
          <div>
            <h1 className="hx-admin-jobs-v2__title">Vacantes</h1>
            <p className="hx-admin-jobs-v2__subtitle">
              Administra tus vacantes publicadas, cerradas y borradores desde un
              solo lugar.
            </p>
          </div>

          <button
            type="button"
            className="hx-admin-jobs-v2__new-btn border-0"
            onClick={openCreateModal}
          >
            <i className="bi bi-plus-lg"></i>
            <span>Nueva vacante</span>
          </button>
        </div>

        <div className="hx-admin-jobs-v2__stats">
          <article className="hx-admin-jobs-v2__stat-card">
            <span className="hx-admin-jobs-v2__stat-label">Total</span>
            <strong className="hx-admin-jobs-v2__stat-value">{summary.total}</strong>
          </article>

          <article className="hx-admin-jobs-v2__stat-card">
            <span className="hx-admin-jobs-v2__stat-label">Publicadas</span>
            <strong className="hx-admin-jobs-v2__stat-value is-accent">
              {summary.published}
            </strong>
          </article>

          <article className="hx-admin-jobs-v2__stat-card">
            <span className="hx-admin-jobs-v2__stat-label">Cerradas</span>
            <strong className="hx-admin-jobs-v2__stat-value">
              {summary.closed}
            </strong>
          </article>

          <article className="hx-admin-jobs-v2__stat-card">
            <span className="hx-admin-jobs-v2__stat-label">Borradores</span>
            <strong className="hx-admin-jobs-v2__stat-value is-muted">
              {summary.draft}
            </strong>
          </article>
        </div>

        <div className="hx-admin-jobs-v2__filters">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`hx-admin-jobs-v2__filter ${
                activeFilter === item.key ? "is-active" : ""
              }`}
              onClick={() => setActiveFilter(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="hx-admin-jobs-v2__feedback">Cargando vacantes...</div>
        )}
        {error && (
          <div className="alert alert-danger hx-admin-jobs-v2__alert">{error}</div>
        )}
        {msg && (
          <div className="alert alert-success hx-admin-jobs-v2__alert">{msg}</div>
        )}

        {!loading && (
          <div className="hx-admin-jobs-v2__table-card">
            <div className="table-responsive">
              <table className="table hx-admin-jobs-v2__table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Cargo</th>
                    <th>Ubicación</th>
                    <th>Tipo</th>
                    <th>Salario</th>
                    <th>Estado</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="hx-admin-jobs-v2__empty">
                          <h3>No hay vacantes en esta categoría</h3>
                          <p>Puedes crear una nueva vacante o cambiar el filtro.</p>
                          <button
                            type="button"
                            className="hx-admin-jobs-v2__empty-btn border-0"
                            onClick={openCreateModal}
                          >
                            Crear vacante
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((job) => {
                      const status = STATUS_META[job.status] || STATUS_META.DRAFT;

                      return (
                        <tr key={job.id}>
                          <td>
                            <div className="hx-admin-jobs-v2__job-cell">
                              <strong>{job.title || "Sin título"}</strong>
                            </div>
                          </td>

                          <td>
                            <div className="hx-admin-jobs-v2__location-cell">
                              <i className="bi bi-geo-alt-fill"></i>
                              <span>{job.location || "No especificado"}</span>
                            </div>
                          </td>

                          <td>
                            <span className="hx-admin-jobs-v2__type-pill">
                              {formatEmploymentType(job.employment_type)}
                            </span>
                          </td>

                          <td>{job.salary_range || "—"}</td>

                          <td>
                            <select
                              className={`hx-admin-jobs-v2__status-select ${status.cls}`}
                              value={job.status || "DRAFT"}
                              onChange={(e) => onChangeStatus(job, e.target.value)}
                            >
                              <option value="PUBLISHED">Publicado</option>
                              <option value="CLOSED">Cerrado</option>
                              <option value="DRAFT">Borrador</option>
                            </select>
                          </td>

                          <td className="text-end">
                            <div className="hx-admin-jobs-v2__actions">
                              <Link
                                to={`/rrhh/vacantes/${job.id}/postulantes`}
                                className="hx-admin-jobs-v2__action-btn is-postulantes"
                                title="Ver postulantes"
                              >
                                <i className="bi bi-people"></i>
                                <span>Postulantes</span>
                              </Link>

                              <button
                                type="button"
                                className="hx-admin-jobs-v2__icon-btn"
                                title="Editar vacante"
                                onClick={() => openEditModal(job.id)}
                              >
                                <i className="bi bi-pencil-fill"></i>
                              </button>

                              <button
                                type="button"
                                className="hx-admin-jobs-v2__icon-btn is-danger"
                                onClick={() => onDelete(job.id)}
                                title="Eliminar vacante"
                              >
                                <i className="bi bi-trash-fill"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="hx-admin-jobs-v2__footer">
              Mostrando 1 a {filteredRows.length} de {rows.length} vacantes
            </div>
          </div>
        )}
      </section>

      {showJobModal && (
        <div className="hx-job-form-modal" onClick={closeJobModal}>
          <div
            className="hx-job-form-modal__dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="hx-job-form-modal__content">
              <AdminJobForm
                embedded
                jobId={editingJobId}
                onClose={closeJobModal}
                onSaved={load}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}