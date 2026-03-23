import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import { apiFetch } from "../../services/api";
import "./admin-job-applications.css";

const STATUS_META = {
  APPLIED: { label: "Postuló", cls: "is-applied" },
  IN_REVIEW: { label: "En revisión", cls: "is-review" },
  INTERVIEW: { label: "Entrevista", cls: "is-interview" },
  REJECTED: { label: "Rechazado", cls: "is-rejected" },
  HIRED: { label: "Contratado", cls: "is-hired" },
};

const STATUS_ORDER = ["APPLIED", "IN_REVIEW", "INTERVIEW", "REJECTED", "HIRED"];

function getInitials(firstName, lastName, email) {
  const fullName = `${firstName || ""} ${lastName || ""}`.trim();

  if (fullName) {
    return fullName
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("");
  }

  if (email) return email.slice(0, 2).toUpperCase();

  return "—";
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status ?? "—", cls: "" };

  return (
    <span className={`hja-status-badge ${meta.cls}`}>
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

  const meta = STATUS_META[value] || { label: value ?? "—", cls: "" };

  function calcPos() {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();

    const width = Math.max(220, r.width);
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
          className="hja-status-menu"
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            width: pos.width,
            zIndex: 9999,
          }}
        >
          <div className="hja-status-menu__title">Cambiar estado</div>

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
                className={`hja-status-menu__item ${isSelected ? "is-selected" : ""}`}
              >
                <span className={`hja-status-menu__dot ${m.cls}`}></span>
                <span className="hja-status-menu__label">{m.label}</span>

                {isSelected && (
                  <span className="hja-status-menu__current">Actual</span>
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
        className={`hja-status-trigger ${meta.cls}`}
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
      >
        <span>{meta.label}</span>
        <i className="bi bi-chevron-down"></i>
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

  const [updatingId, setUpdatingId] = useState(null);

  const total = useMemo(() => rows.length, [rows]);

  async function loadAll() {
    try {
      setError("");
      setMsg("");
      setLoading(true);

      const apps = await apiFetch(`/admin/jobs/${jobId}/applications`);
      const list = apps?.applications ?? apps ?? [];
      setRows(Array.isArray(list) ? list : []);

      try {
        const j = await apiFetch(`/admin/jobs/${jobId}`);
        setJob(j?.job ?? j ?? null);
      } catch {
        setJob(null);
      }
    } catch (e) {
      setError(e.message || "No se pudieron cargar los postulantes");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
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
      setRows((prev) =>
        prev.map((r) =>
          r.application_id === applicationId
            ? { ...r, application_status: status }
            : r
        )
      );
    } catch (e) {
      setError(e.message || "No se pudo actualizar el estado");
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
      setError(e.message || "No se pudo descargar el CV");
    }
  }

  return (
    <div className="hja-page">
      <div className="hja-header">
        <div className="hja-header__left">
          <h1>Postulantes</h1>

          <div className="hja-job-meta">
            <i className="bi bi-info-circle-fill"></i>
            <span>
              Vacante:{" "}
              <strong>{job?.title || `ID ${jobId}`}</strong>
            </span>
          </div>
        </div>

        <div className="hja-header__right">
          <Link to="/rrhh/vacantes" className="hja-btn hja-btn--ghost">
            <i className="bi bi-arrow-left"></i>
            <span>Volver</span>
          </Link>

          <button
            type="button"
            className="hja-btn hja-btn--primary"
            onClick={loadAll}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise"></i>
            <span>Recargar</span>
          </button>
        </div>
      </div>

      {loading && <div className="hja-feedback">Cargando postulantes...</div>}
      {error && <div className="alert alert-danger hja-alert">{error}</div>}
      {msg && <div className="alert alert-success hja-alert">{msg}</div>}

      {!loading && (
        <div className="hja-table-card">
          <div className="table-responsive">
            <table className="hja-table">
              <thead>
                <tr>
                  <th>Candidato</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Documento</th>
                  <th>Estado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="hja-empty">
                      Aún no hay postulaciones para esta vacante.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => {
                    const fullName =
                      `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim() || "—";

                    const disabled = updatingId === r.application_id;

                    const document =
                      r.document_type || r.document_number
                        ? `${r.document_type || "Doc"} · ${r.document_number || "—"}`
                        : r.dni
                        ? `DNI · ${r.dni}`
                        : "—";

                    return (
                      <tr key={r.application_id}>
                        <td>
                          <div className="hja-candidate">
                            <div className="hja-candidate__avatar">
                              {getInitials(r.first_name, r.last_name, r.email)}
                            </div>

                            <div className="hja-candidate__info">
                              <strong>{fullName}</strong>
                            </div>
                          </div>
                        </td>

                        <td className="hja-cell-muted">{r.email ?? "—"}</td>
                        <td className="hja-cell-muted">{r.phone ?? "—"}</td>
                        <td className="hja-cell-muted">{document}</td>

                        <td style={{ minWidth: 210 }}>
                          <StatusDropdown
                            value={r.application_status}
                            onChange={(next) => updateStatus(r.application_id, next)}
                            disabled={disabled}
                          />
                        </td>

                        <td className="text-end">
                          <div className="hja-actions">
                            <button
                              type="button"
                              className="hja-download-btn"
                              onClick={() => downloadCandidateCv(r.candidate_id, r.email)}
                            >
                              <i className="bi bi-download"></i>
                              <span>Descargar CV</span>
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

          <div className="hja-footer">
            <span>
              Mostrando {rows.length} {rows.length === 1 ? "postulante" : "postulantes"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}