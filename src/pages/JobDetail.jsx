import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { apiFetch } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function JobDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [posting, setPosting] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setError("");
        setLoading(true);

        const data = await apiFetch(`/jobs/${id}`);
        const raw = data?.job ?? data;
        setJob(raw);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  function isProfileComplete(u) {
    return !!(u?.first_name && u?.last_name && u?.phone && u?.dni);
  }

  async function handleApply() {
    // 1) No logueado -> login (y guarda "from" para volver)
    if (!user || !localStorage.getItem("token")) {
      nav("/login", { state: { from: location.pathname } });
      return;
    }

    try {
      setMsg("");
      setError("");
      setPosting(true);

      // 2) Validación UX: pedir /auth/me y comprobar perfil completo
      const me = await apiFetch("/auth/me");
      const u = me?.user;

      if (!isProfileComplete(u)) {
        nav("/mi-perfil", {
          state: {
            from: location.pathname,
            reason: "complete_profile",
            message:
              "Completa tu perfil (nombres, apellidos, teléfono y DNI) antes de postular.",
          },
        });
        return;
      }

      // 3) Postular (backend espera { job_id })
      await apiFetch("/candidate/applications", {
        method: "POST",
        body: JSON.stringify({ job_id: id }),
      });

      setMsg("✅ Postulación enviada correctamente.");
    } catch (e) {
   
      setMsg(`${e.message}`);
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="container py-4" style={{ maxWidth: 980 }}>
      {loading && <div>Cargando...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {job && (
        <>
          <div className="d-flex align-items-start justify-content-between flex-wrap gap-2">
            <div>
              <h2 className="fw-bold mb-1">{job.title ?? "Sin título"}</h2>
              <div className="text-muted">
                {job.location || "—"}{" "}
                {job.salary_range ? `• ${job.salary_range}` : ""}
              </div>
            </div>

            <div className="d-flex gap-2">
              <Link className="btn btn-outline-secondary rounded-pill" to="/empleos">
                Volver
              </Link>

              <button
                className="btn btn-dark rounded-pill px-4"
                onClick={handleApply}
                disabled={posting}
              >
                {posting ? "Postulando..." : "Postular"}
              </button>
            </div>
          </div>

          {msg && <div className="alert alert-info mt-3">{msg}</div>}

          <div className="card mt-3">
            <div className="card-body">
              <h5 className="fw-bold">Descripción</h5>
              <p className="mb-0">
                {job.description ?? "Aún no hay descripción para esta vacante."}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
