import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { apiFetch } from "../services/api";
import "./job-detail.css";

function formatDate(dateString) {
  if (!dateString) return "—";

  const date = new Date(dateString);

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function mapApplicationStatus(status) {
  const map = {
    APPLIED: "Solicitud enviada",
    IN_REVIEW: "En revisión",
    INTERVIEW: "Entrevista",
    REJECTED: "Postulación rechazada",
    HIRED: "Contratado",
  };

  return map[status] || status || "Sin estado";
}

function mapJobStatus(status) {
  const map = {
    PUBLISHED: "Vacante activa",
    CLOSED: "Vacante cerrada",
    DRAFT: "Borrador",
  };

  return map[status] || status || "No especificado";
}

export default function JobDetail() {
  const { id } = useParams();
  const location = useLocation();
  const application = location.state?.application || null;

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadJob() {
      try {
        setLoading(true);
        setError("");

        const data = await apiFetch(`/jobs/${id}`);
        setJob(data.job || null);
      } catch (err) {
        setError(err.message || "Error cargando el empleo");
      } finally {
        setLoading(false);
      }
    }

    loadJob();
  }, [id]);

  if (loading) {
    return (
      <section className="jobdetail-page py-4 py-lg-5">
        <div className="jobdetail-shell">
          <div className="jobdetail-card">Cargando empleo...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="jobdetail-page py-4 py-lg-5">
        <div className="jobdetail-shell">
          <div className="jobdetail-card">
            <p className="text-danger mb-0">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!job) {
    return (
      <section className="jobdetail-page py-4 py-lg-5">
        <div className="jobdetail-shell">
          <div className="jobdetail-card">
            <p className="mb-0">No se encontró la vacante.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="jobdetail-page py-4 py-lg-5">
      <div className="jobdetail-shell">
        <Link to="/mis-postulaciones" className="jobdetail-back">
          <i className="bi bi-arrow-left"></i>
          Volver a mis postulaciones
        </Link>

        <article className="jobdetail-card">
          <div className="jobdetail-hero-top">
            <div className="jobdetail-brand">
              

              <div className="jobdetail-brand-info">
                

                <h1 className="jobdetail-title">
                  {job.title || "Sin título"}
                </h1>

                <div className="jobdetail-status-row">
                  <span className="jobdetail-job-status">
                    {mapJobStatus(job.status)}
                  </span>
                </div>
              </div>
            </div>

            {application && (
              <div className="jobdetail-hero-right">
                <span className="jobdetail-application-pill">
                  {mapApplicationStatus(application.status)}
                </span>
              </div>
            )}
          </div>

          <div className="jobdetail-divider"></div>

          <div className="jobdetail-section-head">
            <h2 className="jobdetail-section-title">Detalles del empleo</h2>
          </div>

          <div className="jobdetail-info-grid">
            <div className="jobdetail-info-item">
              <div className="jobdetail-info-icon">
                <i className="bi bi-geo-alt"></i>
              </div>
              <div>
                <span className="jobdetail-info-label">Ubicación</span>
                <strong className="jobdetail-info-value">
                  {job.location || "No especificado"}
                </strong>
              </div>
            </div>

            <div className="jobdetail-info-item">
              <div className="jobdetail-info-icon">
                <i className="bi bi-briefcase"></i>
              </div>
              <div>
                <span className="jobdetail-info-label">Tipo de empleo</span>
                <strong className="jobdetail-info-value">
                  {job.employment_type || "No especificado"}
                </strong>
              </div>
            </div>

            <div className="jobdetail-info-item">
              <div className="jobdetail-info-icon">
                <i className="bi bi-cash-stack"></i>
              </div>
              <div>
                <span className="jobdetail-info-label">Salario</span>
                <strong className="jobdetail-info-value">
                  {job.salary_range || "No especificado"}
                </strong>
              </div>
            </div>

            {application?.created_at && (
              <div className="jobdetail-info-item">
                <div className="jobdetail-info-icon">
                  <i className="bi bi-send-check"></i>
                </div>
                <div>
                  <span className="jobdetail-info-label">Fecha de postulación</span>
                  <strong className="jobdetail-info-value">
                    {formatDate(application.created_at)}
                  </strong>
                </div>
              </div>
            )}
          </div>
        </article>

        <article className="jobdetail-card">
          <div className="jobdetail-section-head">
            <h2 className="jobdetail-section-title">Acerca del empleo</h2>
          </div>

          <div className="jobdetail-divider"></div>

          <div className="jobdetail-description">
            {job.description ? (
              job.description.split("\n").map((line, index) => (
                <p key={index}>{line.trim() || "\u00A0"}</p>
              ))
            ) : (
              <p>No hay descripción disponible.</p>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}