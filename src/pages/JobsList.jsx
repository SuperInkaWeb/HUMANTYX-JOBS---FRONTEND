import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../services/api";

export default function JobsList() {
  const [jobs, setJobs] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setError("");
        setLoading(true);

        const data = await apiFetch("/jobs");
       

        setJobs(Array.isArray(data?.jobs) ? data.jobs : []);
        setMeta({
          page: data?.page ?? 1,
          limit: data?.limit ?? 10,
          total: data?.total ?? 0,
        });
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="container py-4">
      <div className="d-flex align-items-end justify-content-between flex-wrap gap-2 mb-3">
        <div>
          <h2 className="fw-bold mb-1">Empleos</h2>
          <div className="text-muted small">
            {meta.total} resultado(s) • Página {meta.page}
          </div>
        </div>
      </div>

      {loading && <div>Cargando...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3">
        {jobs.map((j) => (
          <div className="col-md-6" key={j.id}>
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">{j.title}</h5>
                <p className="card-text text-muted mb-2">{j.location || "—"}</p>

                <Link className="btn btn-outline-dark rounded-pill" to={`/empleos/${j.id}`}>
                  Ver oferta
                </Link>
              </div>
            </div>
          </div>
        ))}

        {!loading && !error && jobs.length === 0 && (
          <div className="text-muted">No hay vacantes publicadas.</div>
        )}
      </div>
    </div>
  );
}
