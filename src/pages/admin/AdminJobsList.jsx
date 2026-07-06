import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../services/api";
import AdminJobForm from "./AdminJobForm";
import ConfirmActionModal from "../../components/shared/ConfirmActionModal";
import "./admin-jobs-list.css";
import { sanitizeRichTextHtml } from "../../utils/richText";
import JobDescriptionModal from "../../components/admin/JobDescriptionModal";
import { useAuth } from "../../hooks/useAuth";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/ui/StatCard";
import AdminToolbar from "../../components/ui/AdminToolbar";
import AdminJobCard from "../../components/admin/AdminJobCard";

const DESCRIPTION_PREVIEW_WORDS = 50;

function formatEmploymentType(value) {
  if (!value) return "—";

  const map = {
    internship: "Prácticas",
    part_time: "Medio Tiempo",
    "part-time": "Medio Tiempo",
    full_time: "Tiempo Completo",
    "full-time": "Tiempo Completo",
    contract: "Contrato",
  };

  return map[value] || value;
}

function extractPreviewData(value) {
  const html = sanitizeRichTextHtml(value);

  if (!html) {
    return {
      contentTitle: "",
      previewText: "Esta vacante aún no tiene una descripción registrada.",
    };
  }

  const temp = document.createElement("div");
  temp.innerHTML = html;

  const firstHeading = temp.querySelector("h2") || temp.querySelector("h3");

  const contentTitle = firstHeading
    ? (firstHeading.textContent || "").trim()
    : "";

  if (firstHeading) {
    firstHeading.remove();
  }

  const fullText = (temp.textContent || "")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = fullText.split(" ").filter(Boolean);

  const previewText =
    words.length > DESCRIPTION_PREVIEW_WORDS
      ? `${words.slice(0, DESCRIPTION_PREVIEW_WORDS).join(" ")}...`
      : fullText;

  return {
    contentTitle,
    previewText:
      previewText || "Esta vacante aún no tiene una descripción registrada.",
  };
}

function canDeleteJob(job) {
  const applicantsCount = Number(job?.applicants_count ?? 0);
  const isPublished = job?.status === "PUBLISHED";

  return applicantsCount === 0 && !isPublished;
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export default function AdminJobsList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);

  const [jobToDelete, setJobToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [descriptionModalOpen, setDescriptionModalOpen] = useState(false);
  const [selectedJobForDescription, setSelectedJobForDescription] =
    useState(null);

  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  function openDescriptionModal(job) {
    setSelectedJobForDescription(job);
    setDescriptionModalOpen(true);
  }

  function closeDescriptionModal() {
    setDescriptionModalOpen(false);
    setSelectedJobForDescription(null);
  }

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

  const toolbarFilters = useMemo(() => {
    return [
      { key: "ALL", label: "Todas", count: summary.total },
      { key: "PUBLISHED", label: "Publicadas", count: summary.published },
      { key: "CLOSED", label: "Cerradas", count: summary.closed },
      { key: "DRAFT", label: "Borradores", count: summary.draft },
    ];
  }, [summary]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm);

    return rows.filter((job) => {
      const matchesStatus =
        activeFilter === "ALL" || job.status === activeFilter;

      if (!matchesStatus) return false;
      if (!normalizedSearch) return true;

      const searchableText = normalizeText(
        [
          job.title,
          job.location,
          job.employment_type,
          formatEmploymentType(job.employment_type),
          job.salary_range,
          job.creator_email,
          job.creator_first_name,
          job.creator_last_name,
          job.status,
        ].join(" ")
      );

      return searchableText.includes(normalizedSearch);
    });
  }, [rows, activeFilter, searchTerm]);

  return (
    <>
      <section className="hx-admin-jobs-v2">
        <PageHeader
          eyebrow="Gestión RRHH"
          title="Vacantes"
          subtitle="Administra tus vacantes publicadas, cerradas y borradores desde un solo lugar."
          action={
            <button
              type="button"
              className="hx-admin-jobs-v2__new-btn border-0"
              onClick={openCreateModal}
            >
              <i className="bi bi-plus-lg"></i>
              <span>Nueva vacante</span>
            </button>
          }
        />

        <div className="hx-admin-jobs-v2__stats">
          <StatCard
            icon="bi-briefcase"
            title="Total"
            value={summary.total}
            subtitle="Vacantes registradas"
          />

          <StatCard
            icon="bi-megaphone"
            title="Publicadas"
            value={summary.published}
            subtitle="Disponibles para candidatos"
            color="success"
          />

          <StatCard
            icon="bi-lock"
            title="Cerradas"
            value={summary.closed}
            subtitle="Procesos finalizados"
            color="muted"
          />

          <StatCard
            icon="bi-pencil-square"
            title="Borradores"
            value={summary.draft}
            subtitle="Pendientes de publicar"
            color="warning"
          />
        </div>

        <AdminToolbar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          filters={toolbarFilters}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

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
                <h3>No hay vacantes disponibles</h3>
                <p>
                  Puedes crear una nueva vacante, cambiar el filtro o limpiar la
                  búsqueda.
                </p>

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
                const preview = extractPreviewData(job.description);

                return (
                  <AdminJobCard
                    key={job.id}
                    job={job}
                    preview={preview}
                    isAdmin={isAdmin}
                    onViewDescription={openDescriptionModal}
                    onEdit={openEditModal}
                    onDelete={requestDelete}
                  />
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

      <JobDescriptionModal
        isOpen={descriptionModalOpen}
        job={selectedJobForDescription}
        onClose={closeDescriptionModal}
        onSaved={load}
        apiFetch={apiFetch}
      />

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