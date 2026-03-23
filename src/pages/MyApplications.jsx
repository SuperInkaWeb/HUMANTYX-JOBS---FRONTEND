import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../services/api";
import "./my-applications.css";

function formatDate(dateString) {
  if (!dateString) return "—";

  const date = new Date(dateString);

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function StatusBadge({ status }) {
  const map = {
    APPLIED: { label: "Postulado", cls: "is-applied" },
    IN_REVIEW: { label: "En revisión", cls: "is-review" },
    INTERVIEW: { label: "Entrevista", cls: "is-interview" },
    REJECTED: { label: "Rechazado", cls: "is-rejected" },
    HIRED: { label: "Contratado", cls: "is-hired" },
  };

  const current = map[status] || {
    label: status || "Sin estado",
    cls: "is-default",
  };

  return <span className={`myapps-status ${current.cls}`}>{current.label}</span>;
}

export default function MyApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiFetch("/candidate/applications");

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.applications)
          ? data.applications
          : Array.isArray(data?.apps)
          ? data.apps
          : [];

        setApps(list);
      } catch (e) {
        setError(e.message || "Ocurrió un error cargando tus postulaciones.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const counts = useMemo(() => {
    return {
      all: apps.length,
      applied: apps.filter((a) => a.status === "APPLIED").length,
      review: apps.filter((a) => a.status === "IN_REVIEW").length,
      interview: apps.filter((a) => a.status === "INTERVIEW").length,
    };
  }, [apps]);

  const filteredApps = useMemo(() => {
    if (activeTab === "applied") {
      return apps.filter((a) => a.status === "APPLIED");
    }

    if (activeTab === "review") {
      return apps.filter((a) => a.status === "IN_REVIEW");
    }

    if (activeTab === "interview") {
      return apps.filter((a) => a.status === "INTERVIEW");
    }

    return apps;
  }, [apps, activeTab]);

  return (
    <section className="myapps-page">
      <div className="container py-4 py-lg-5">
        <div className="myapps-wrap">
          <div className="myapps-board">
            <div className="myapps-board__header">
              <div className="myapps-board__intro">
                <h1 className="myapps-board__title">Mis postulaciones</h1>
              </div>


            </div>

            <div className="myapps-tabs">
              <button
                type="button"
                className={`myapps-tab ${activeTab === "all" ? "active" : ""}`}
                onClick={() => setActiveTab("all")}
              >
                Todos
                <span>{counts.all}</span>
              </button>

              <button
                type="button"
                className={`myapps-tab ${activeTab === "applied" ? "active" : ""}`}
                onClick={() => setActiveTab("applied")}
              >
                Postulados
                <span>{counts.applied}</span>
              </button>

              <button
                type="button"
                className={`myapps-tab ${activeTab === "review" ? "active" : ""}`}
                onClick={() => setActiveTab("review")}
              >
                En revisión
                <span>{counts.review}</span>
              </button>

            </div>

            {loading && (
              <div className="myapps-feedback">Cargando postulaciones...</div>
            )}

            {error && <div className="alert alert-danger m-0">{error}</div>}

            {!loading && !error && (
              <>
                {filteredApps.length === 0 ? (
                  <div className="myapps-empty">
                    <div className="myapps-empty__icon">
                      <i className="bi bi-briefcase"></i>
                    </div>

                    <h3 className="myapps-empty__title">
                      No hay postulaciones en esta sección
                    </h3>

                    <p className="myapps-empty__text">
                      Explora nuevas oportunidades y encuentra vacantes que se
                      ajusten a tu perfil.
                    </p>

                    <Link to="/empleos" className="myapps-btn-primary">
                      Ir a buscar empleos
                    </Link>
                  </div>
                ) : (
                  <div className="myapps-job-list">
                    {filteredApps.map((a) => {
                      const jobId = a.job_id || a.jobId;
                      const title = a.title || a.job_title || "Sin título";
                      const location =
                        a.location || a.job_location || "Ubicación no especificada";
                      const salary = a.salary_range || "Salario no especificado";
                      const employmentType =
                        a.employment_type || "Modalidad no especificada";
                      const appliedAt = formatDate(a.created_at);

                      return (
                        <article key={a.id} className="myapps-row">
                          <div className="myapps-row__main">
                            <div className="myapps-row__top">
                              <div className="myapps-row__info">
                                <h2 className="myapps-row__title">{title}</h2>

                                <div className="myapps-row__meta">
                                  <span>{location}</span>
                                  <span>{employmentType}</span>
                                  <span>{salary}</span>
                                </div>

                                <div className="myapps-row__date">
                                  Postulaste el <strong>{appliedAt}</strong>
                                </div>
                              </div>

                              <div className="myapps-row__side">
                                <StatusBadge status={a.status} />

                                {jobId ? (
                                  <Link
                                    to={`/empleos/${jobId}`}
                                    state={{ application: a }}
                                    className="myapps-btn-ghost"
                                  >
                                    Ver empleo
                                  </Link>
                                ) : (
                                  <span className="myapps-row__unavailable">
                                    Empleo no disponible
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}