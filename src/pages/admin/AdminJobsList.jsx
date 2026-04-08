import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../services/api";
import AdminJobForm from "./AdminJobForm";
import ConfirmActionModal from "../../components/shared/ConfirmActionModal";
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

function getSafeDescription(value) {
  const text = String(value || "").trim();
  if (!text) return "Esta vacante aún no tiene una descripción registrada.";
  return text;
}

function canDeleteJob(job) {
  const applicantsCount = Number(job?.applicants_count ?? 0);
  const isPublished = job?.status === "PUBLISHED";

  return applicantsCount === 0 && !isPublished;
}

export default function AdminJobsList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");

  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);

  const [jobToDelete, setJobToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

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
    const isAnyModalOpen = showJobModal || Boolean(jobToDelete);
    if (!isAnyModalOpen) return;

    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = original;
    };
  }, [showJobModal, jobToDelete]);

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

  function requestDelete(job) {
    if (!canDeleteJob(job)) {
      if (Number(job?.applicants_count ?? 0) > 0) {
        setError(
          "No se puede eliminar esta vacante porque ya tiene postulantes asociados."
        );
        return;
      }

      if (job?.status === "PUBLISHED") {
        setError(
          "No se puede eliminar una vacante publicada. Cámbiala a borrador o cerrada primero."
        );
        return;
      }
    }

    setJobToDelete(job);
  }

  function cancelDelete() {
    if (deleting) return;
    setJobToDelete(null);
  }

  async function confirmDelete() {
    if (!jobToDelete?.id) return;

    try {
      setDeleting(true);
      setError("");
      setMsg("");

      await apiFetch(`/admin/jobs/${jobToDelete.id}`, { method: "DELETE" });

      setMsg("✅ Vacante eliminada.");
      setJobToDelete(null);
      await load();
    } catch (e) {
      setError(e.message || "No se pudo eliminar la vacante");
    } finally {
      setDeleting(false);
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
            <strong className="hx-admin-jobs-v2__stat-value">
              {summary.total}
            </strong>
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
          <div className="alert alert-danger hx-admin-jobs-v2__alert">
            {error}
          </div>
        )}

        {msg && (
          <div className="alert alert-success hx-admin-jobs-v2__alert">
            {msg}
          </div>
        )}

        {!loading && (
          <div className="hx-admin-jobs-v2__cards-wrap">
            {filteredRows.length === 0 ? (
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
            ) : (
              filteredRows.map((job) => {
                const status = STATUS_META[job.status] || STATUS_META.DRAFT;

                return (
                  <article key={job.id} className="hx-admin-jobs-v2__job-card">
                    <div className="hx-admin-jobs-v2__job-main">
                      <div className="hx-admin-jobs-v2__job-header-row">
                        <div className="hx-admin-jobs-v2__job-copy">
                          <div className="hx-admin-jobs-v2__title-row">
                            <h3 className="hx-admin-jobs-v2__job-title">
                              {job.title || "Sin título"}
                            </h3>

                            <span
                              className={`hx-admin-jobs-v2__status-badge ${status.cls}`}
                            >
                              {status.label}
                            </span>
                          </div>

                          <p className="hx-admin-jobs-v2__job-description">
                            {getSafeDescription(job.description)}
                          </p>
                        </div>
                      </div>

                      <div className="hx-admin-jobs-v2__meta-row">
                        <span className="hx-admin-jobs-v2__meta-item">
                          <i className="bi bi-geo-alt-fill"></i>
                          <span>{job.location || "No especificado"}</span>
                        </span>

                        <span className="hx-admin-jobs-v2__meta-item">
                          <i className="bi bi-briefcase-fill"></i>
                          <span>
                            {formatEmploymentType(job.employment_type)}
                          </span>
                        </span>

                        <span className="hx-admin-jobs-v2__meta-item">
                          <i className="bi bi-cash-stack"></i>
                          <span>{job.salary_range || "—"}</span>
                        </span>
                      </div>
                    </div>

                    <div className="hx-admin-jobs-v2__job-aside">
                      <div className="hx-admin-jobs-v2__actions">
                        <Link
                          to={`/rrhh/vacantes/${job.id}/postulantes`}
                          className="hx-admin-jobs-v2__action-btn is-postulantes"
                          title="Ver postulantes"
                        >
                          <i className="bi bi-people"></i>
                          <span>Postulantes ({job.applicants_count ?? 0})</span>
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
                          className={`hx-admin-jobs-v2__icon-btn is-danger ${
                            !canDeleteJob(job) ? "is-disabled" : ""
                          }`}
                          onClick={() => requestDelete(job)}
                          title={
                            Number(job?.applicants_count ?? 0) > 0
                              ? "No se puede eliminar porque tiene postulantes"
                              : job?.status === "PUBLISHED"
                              ? "No se puede eliminar una vacante publicada"
                              : "Eliminar vacante"
                          }
                          disabled={!canDeleteJob(job)}
                        >
                          <i className="bi bi-trash-fill"></i>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            )}

            <div className="hx-admin-jobs-v2__footer">
              Mostrando {filteredRows.length} de {rows.length} vacantes
            </div>
          </div>
        )}
      </section>

      {showJobModal && (
        <div className="hx-job-form-modal">
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

      <ConfirmActionModal
        isOpen={Boolean(jobToDelete)}
        title="Eliminar vacante"
        message={
          jobToDelete
            ? `¿Seguro que deseas eliminar la vacante "${jobToDelete.title}"? Esta acción no se puede deshacer.`
            : ""
        }
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        danger
        loading={deleting}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
    </>
  );
}