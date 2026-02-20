import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../services/api";

export default function AdminCandidatesList() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");

  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    try {
      setError("");
      setMsg("");
      setLoading(true);

      const data = await apiFetch("/admin/candidates");
      const list = data?.candidates ?? data?.users ?? data ?? [];
      setRows(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e.message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;

    return rows.filter((c) => {
      const fullName = `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim().toLowerCase();
      const email = (c.email ?? "").toLowerCase();
      const dni = (c.dni ?? "").toLowerCase();
      const phone = (c.phone ?? "").toLowerCase();

      return (
        fullName.includes(s) ||
        email.includes(s) ||
        dni.includes(s) ||
        phone.includes(s)
      );
    });
  }, [rows, q]);

  function fmtDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString();
  }

  async function downloadCv(candidateId, email) {
    try {
      setError("");
      setMsg("");
      setDownloadingId(candidateId);

      const token = localStorage.getItem("token");
      const BASE_URL = import.meta.env.VITE_API_URL;

      const res = await fetch(`${BASE_URL}/admin/candidates/${candidateId}/cv`, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        const text = await res.text();
        let message = `Error HTTP ${res.status}`;
        try {
          const j = JSON.parse(text);
          message = j?.message || message;
        } catch {
          if (text) message = text;
        }
        throw new Error(message);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `cv-${email || candidateId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

      setMsg("✅ CV descargado correctamente.");
    } catch (e) {
      // Caso típico: 404 "El candidato no tiene CV"
      setError(e.message);
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="container py-4">
      <div className="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-3">
        <div>
          <h2 className="fw-bold mb-1">Candidatos</h2>
          <div className="text-muted small">
            Lista global de candidatos registrados (máx. 100).
          </div>
        </div>

        <div className="d-flex gap-2">
          <Link to="/rrhh/vacantes" className="btn btn-outline-secondary rounded-pill px-4">
            Volver
          </Link>
          <button className="btn btn-outline-dark rounded-pill px-4" onClick={load} disabled={loading}>
            Recargar
          </button>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div style={{ minWidth: 280, flex: 1 }}>
            <label className="form-label mb-1 fw-semibold">Buscar</label>
            <input
              className="form-control"
              placeholder="Buscar por nombre, email, DNI o teléfono…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="text-muted small">
            Mostrando <span className="fw-semibold">{filtered.length}</span> de{" "}
            <span className="fw-semibold">{rows.length}</span>
          </div>
        </div>
      </div>

      {loading && <div>Cargando...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {msg && <div className="alert alert-success">{msg}</div>}

      {!loading && (
        <div className="card">
          <div className="table-responsive">
            <table className="table mb-0 align-middle">
              <thead>
                <tr>
                  <th>Candidato</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>DNI</th>
                  <th>Registrado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-muted p-4">
                      No hay candidatos para mostrar.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => {
                    const fullName =
                      `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() || "—";
                    const isDownloading = downloadingId === c.id;

                    return (
                      <tr key={c.id}>
                        <td className="fw-semibold">{fullName}</td>
                        <td>{c.email ?? "—"}</td>
                        <td>{c.phone ?? "—"}</td>
                        <td>{c.dni ?? "—"}</td>
                        <td className="text-muted">{fmtDate(c.created_at)}</td>

                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-2 flex-wrap">
                            {/* (Opcional) detalle si luego lo creas */}
                            {/* <Link
                              to={`/rrhh/candidatos/${c.id}`}
                              className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                            >
                              Ver
                            </Link> */}

                            <button
                              className="btn btn-outline-primary btn-sm rounded-pill px-3"
                              onClick={() => downloadCv(c.id, c.email)}
                              disabled={isDownloading}
                              title="Descargar CV"
                            >
                              {isDownloading ? "Descargando..." : "Descargar CV"}
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

          
        </div>
      )}
    </div>
  );
}
