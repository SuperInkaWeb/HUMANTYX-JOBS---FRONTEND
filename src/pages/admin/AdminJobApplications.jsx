import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import { apiFetch } from "../../services/api";

const STATUS_META = {
  APPLIED: { label: "Postuló", bg: "#6b7280", color: "#fff" },
  IN_REVIEW: { label: "En revisión", bg: "#2563eb", color: "#fff" },
  INTERVIEW: { label: "Entrevista", bg: "#f59e0b", color: "#111827" },
  REJECTED: { label: "Rechazado", bg: "#ef4444", color: "#fff" },
  HIRED: { label: "Contratado", bg: "#16a34a", color: "#fff" },
};

const STATUS_ORDER = ["APPLIED", "IN_REVIEW", "INTERVIEW", "REJECTED", "HIRED"];

function Pill({ status }) {
  const meta = STATUS_META[status] || { label: status ?? "—", bg: "#e5e7eb", color: "#111827" };
  return (
    <span
      className="badge rounded-pill"
      style={{
        background: meta.bg,
        color: meta.color,
        padding: "10px 14px",
        fontSize: 14,
        fontWeight: 600,
        letterSpacing: 0.2,
      }}
    >
      {meta.label}
    </span>
  );
}

/**
 * Dropdown custom con Portal 
 */
function StatusDropdown({ value, onChange, disabled }) {
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 240 });

  const meta = STATUS_META[value] || { label: value ?? "—", bg: "#e5e7eb", color: "#111827" };

  function calcPos() {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();

    const width = Math.max(240, r.width);
    const left = Math.min(Math.max(8, r.left), window.innerWidth - width - 8);
    const top = r.bottom + 8;

    setPos({ top, left, width });
  }

  useEffect(() => {
    if (!open) return;
    calcPos();

    const onResize = () => calcPos();
    const onScroll = () => calcPos();

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onDocClick(e) {
      const btn = btnRef.current;
      const menu = menuRef.current;
      if (!btn || !menu) return;

      if (btn.contains(e.target) || menu.contains(e.target)) return;
      setOpen(false);
    }

    function onEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const menu = open
    ? createPortal(
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            width: pos.width,
            zIndex: 9999,
            background: "white",
            borderRadius: 14,
            border: "1px solid rgba(0,0,0,0.12)",
            boxShadow: "0 18px 55px rgba(0,0,0,0.18)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: 10, fontSize: 12, color: "#6b7280", fontWeight: 700 }}>
            Cambiar estado
          </div>

          {STATUS_ORDER.map((k) => {
            const m = STATUS_META[k];
            const isSelected = k === value;
            return (
              <button
                key={k}
                type="button"
                onClick={() => {
                  if (disabled) return;
                  if (k === value) {
                    setOpen(false);
                    return;
                  }
                  onChange(k);
                  setOpen(false);
                }}
                disabled={disabled}
                className="w-100 text-start"
                style={{
                  border: "none",
                  background: "transparent",
                  padding: "12px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: disabled ? "not-allowed" : "pointer",
                  opacity: isSelected ? 0.55 : 1,
                }}
              >
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 999,
                    background: m.bg,
                    display: "inline-block",
                  }}
                />
                <span style={{ fontWeight: 700, color: "#111827" }}>{m.label}</span>
                {isSelected && (
                  <span className="ms-auto" style={{ fontSize: 12, color: "#6b7280", fontWeight: 700 }}>
                    Actual
                  </span>
                )}
              </button>
            );
          })}
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className="btn rounded-pill d-inline-flex align-items-center gap-2"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        style={{
          background: meta.bg,
          color: meta.color,
          fontWeight: 800,
          padding: "10px 14px",
          border: "1px solid rgba(0,0,0,0.10)",
          opacity: disabled ? 0.7 : 1,
        }}
      >
        {meta.label}
        <span style={{ fontSize: 12, opacity: 0.9 }}>▼</span>
      </button>

      {menu}
    </>
  );
}

export default function AdminJobApplications() {
  const { id: jobId } = useParams();

  const [job, setJob] = useState(null);
  const [rows, setRows] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  // Para deshabilitar un solo dropdown mientras actualiza
  const [updatingId, setUpdatingId] = useState(null);

  const total = useMemo(() => rows.length, [rows]);

  async function loadAll() {
    try {
      setError("");
      setMsg("");
      setLoading(true);

      // 1) Postulantes
      const apps = await apiFetch(`/admin/jobs/${jobId}/applications`);
      const list = apps?.applications ?? apps ?? [];
      setRows(Array.isArray(list) ? list : []);

      // 2) (Opcional) info vacante para el header
      try {
        const j = await apiFetch(`/admin/jobs/${jobId}`);
        setJob(j?.job ?? j ?? null);
      } catch {
        setJob(null);
      }
    } catch (e) {
      setError(e.message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  async function updateStatus(applicationId, status) {
    try {
      setError("");
      setMsg("");
      setUpdatingId(applicationId);

      await apiFetch(`/admin/applications/${applicationId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      setMsg("✅ Estado de postulación actualizado.");
      // Actualización optimista
      setRows((prev) =>
        prev.map((r) =>
          r.application_id === applicationId ? { ...r, application_status: status } : r
        )
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setUpdatingId(null);
    }
  }

  async function downloadCandidateCv(candidateId, email) {
    try {
      setError("");
      setMsg("");

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
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="container py-4">
      <div className="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-3">
        <div>
          <h2 className="fw-bold mb-1">Postulantes</h2>
          <div className="text-muted small">
            {job?.title ? (
              <>
                Vacante: <span className="fw-semibold">{job.title}</span> • {total} postulante(s)
              </>
            ) : (
              <>
                Vacante ID: <span className="fw-semibold">{jobId}</span> • {total} postulante(s)
              </>
            )}
          </div>
        </div>

        <div className="d-flex gap-2">
          <Link to="/rrhh/vacantes" className="btn btn-outline-secondary rounded-pill px-4">
            Volver
          </Link>
          <button className="btn btn-outline-dark rounded-pill px-4" onClick={loadAll} disabled={loading}>
            Recargar
          </button>
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
                  <th>Estado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-muted p-4">
                      Aún no hay postulaciones para esta vacante.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => {
                    const fullName =
                      `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim() || "—";
                    const disabled = updatingId === r.application_id;

                    return (
                      <tr key={r.application_id}>
                        <td className="fw-semibold">{fullName}</td>
                        <td>{r.email ?? "—"}</td>
                        <td>{r.phone ?? "—"}</td>
                        <td>{r.dni ?? "—"}</td>

                        <td style={{ minWidth: 220 }}>
                          <StatusDropdown
                            value={r.application_status}
                            onChange={(next) => updateStatus(r.application_id, next)}
                            disabled={disabled}
                          />
                        </td>

                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-2 flex-wrap">
                            <button
                              className="btn btn-outline-primary btn-sm rounded-pill px-3"
                              onClick={() => downloadCandidateCv(r.candidate_id, r.email)}
                            >
                              Descargar CV
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
