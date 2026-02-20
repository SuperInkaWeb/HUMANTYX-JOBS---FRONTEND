import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../services/api";

function StatusBadge({ status }) {
  const map = {
    APPLIED: { label: "Postulado", cls: "bg-secondary" },
    IN_REVIEW: { label: "En revisión", cls: "bg-info" },
    INTERVIEW: { label: "Entrevista", cls: "bg-warning text-dark" },
    REJECTED: { label: "Rechazado", cls: "bg-danger" },
    HIRED: { label: "Contratado", cls: "bg-success" },
  };

  const s = map[status] || { label: status || "—", cls: "bg-dark" };

  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

export default function MyApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setError("");
        setLoading(true);

        const data = await apiFetch("/candidate/applications");

        console.log("Respuesta /candidate/applications:", data);

        const list =
          Array.isArray(data) ? data :
          Array.isArray(data?.applications) ? data.applications :
          Array.isArray(data?.apps) ? data.apps :
          [];

        setApps(list);
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
          <h2 className="fw-bold mb-1">Mis postulaciones</h2>
          <div className="text-muted small">
            {apps.length} postulación(es)
          </div>
        </div>

        <Link to="/empleos" className="btn btn-outline-dark rounded-pill">
          Buscar más empleos
        </Link>
      </div>

      {loading && <div>Cargando...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && apps.length === 0 && (
        <div className="alert alert-light border">
          Aún no tienes postulaciones. Ve a <Link to="/empleos">Buscar empleos</Link>.
        </div>
      )}

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Empleo</th>
                <th>Ubicación</th>
                <th>Salario</th>
                <th>Estado</th>
                <th className="text-end">Acción</th>
              </tr>
            </thead>

            <tbody>
              {apps.map((a) => {
                // soporte si backend trae job anidado o campos planos
                const job = a.job || a.job_detail || null;
                const jobId = a.job_id || a.jobId;

                const title = a.title || a.job_title || "—";
                const location = a.location || a.job_location || "—";
                const salary = a.salary_range || "—";



                return (
                  <tr key={a.id}>
                    <td className="fw-semibold">{title}</td>
                    <td className="text-muted">{location}</td>
                    <td className="text-muted">{salary}</td>
                    <td><StatusBadge status={a.status} /></td>
                    <td className="text-end">
                      {jobId ? (
                        <Link
                          to={`/empleos/${jobId}`}
                          className="btn btn-sm btn-outline-dark rounded-pill"
                        >
                          Ver empleo
                        </Link>
                      ) : (
                        <span className="text-muted small">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}
