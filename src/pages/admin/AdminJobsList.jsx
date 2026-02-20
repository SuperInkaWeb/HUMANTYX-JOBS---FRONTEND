import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { apiFetch } from "../../services/api";

/**
 * Estados del enum en tu BD: {DRAFT, PUBLISHED, CLOSED}
 */
const STATUS_META = {
  PUBLISHED: {
    value: "PUBLISHED",
    label: "Publicado",
    pillBg: "#2f6f44",
    pillText: "#fff",
  },
  CLOSED: {
    value: "CLOSED",
    label: "Cerrado",
    pillBg: "#b54545",
    pillText: "#fff",
  },
  DRAFT: {
    value: "DRAFT",
    label: "Borrador",
    pillBg: "#e0b737",
    pillText: "#1a1a1a",
  },
};

const ORDER = ["PUBLISHED", "CLOSED", "DRAFT"];

/**
 * Dropdown
 */
function StatusDropdownPortal({
  open,
  anchorEl,
  currentStatus,
  disabled,
  onSelect,
  onClose,
}) {
  const menuRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0, minWidth: 0 });

  function computePosition() {
    if (!anchorEl) return;

    const rect = anchorEl.getBoundingClientRect();
    const gap = 8;

    const minWidth = Math.max(200, rect.width);
    let left = rect.left;
    let top = rect.bottom + gap;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (left + minWidth > vw - 8) left = Math.max(8, vw - minWidth - 8);
    if (left < 8) left = 8;

    const menuH = menuRef.current?.offsetHeight || 180;
    const spaceBelow = vh - rect.bottom;
    const spaceAbove = rect.top;

    const shouldFlip = spaceBelow < menuH + gap && spaceAbove > menuH + gap;
    if (shouldFlip) top = rect.top - menuH - gap;

    setPos({ top: top + window.scrollY, left: left + window.scrollX, minWidth });
  }

  useLayoutEffect(() => {
    if (!open) return;
    computePosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, anchorEl, currentStatus]);

  useEffect(() => {
    if (!open) return;

    const onDocClick = (e) => {
      const target = e.target;
      const clickedMenu = menuRef.current && menuRef.current.contains(target);
      const clickedAnchor = anchorEl && anchorEl.contains(target);
      if (!clickedMenu && !clickedAnchor) onClose();
    };

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };

    const onAnyScroll = () => computePosition();
    const onResize = () => computePosition();

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onAnyScroll, true);
    window.addEventListener("resize", onResize);

    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onAnyScroll, true);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, anchorEl]);

  if (!open || !anchorEl) return null;

  const menu = (
    <div
      ref={menuRef}
      className="shadow-sm"
      style={{
        position: "absolute",
        top: pos.top,
        left: pos.left,
        minWidth: pos.minWidth,
        background: "white",
        border: "1px solid rgba(0,0,0,0.12)",
        borderRadius: 12,
        padding: 8,
        zIndex: 9999,
      }}
    >
      <div className="px-2 pt-1 pb-2 small text-muted" style={{ userSelect: "none" }}>
        Cambiar estado
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        {ORDER.map((k) => {
          const item = STATUS_META[k];
          const isActive = currentStatus === item.value;

          return (
            <button
              key={item.value}
              type="button"
              className="btn btn-sm text-start"
              disabled={disabled || isActive}
              onClick={() => onSelect(item.value)}
              style={{
                borderRadius: 10,
                border: "1px solid rgba(0,0,0,0.08)",
                padding: "10px 10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                opacity: isActive ? 0.55 : 1,
                background: isActive ? "rgba(0,0,0,0.02)" : "white",
                cursor: disabled ? "not-allowed" : isActive ? "default" : "pointer",
              }}
            >
              <div className="d-flex align-items-center gap-2">
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: item.pillBg,
                    display: "inline-block",
                  }}
                />
                <span className="fw-semibold">{item.label}</span>
              </div>

              {isActive ? (
                <span className="small text-muted">Actual</span>
              ) : (
                <span className="small text-muted">Cambiar</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return createPortal(menu, document.body);
}

export default function AdminJobsList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const [openId, setOpenId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const anchorsRef = useRef(new Map());

  const openJob = useMemo(() => rows.find((r) => r.id === openId) || null, [rows, openId]);

  async function load() {
    try {
      setError("");
      setMsg("");
      setLoading(true);

      const data = await apiFetch("/admin/jobs");
      const list = data?.jobs ?? data ?? [];
      setRows(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onDelete(id) {
    const ok = confirm("¿Seguro que deseas eliminar esta vacante?");
    if (!ok) return;

    try {
      setMsg("");
      setError("");
      await apiFetch(`/admin/jobs/${id}`, { method: "DELETE" });
      setMsg("✅ Vacante eliminada.");
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function onChangeStatus(job, nextStatus) {
    try {
      setMsg("");
      setError("");
      setSavingId(job.id);

      await apiFetch(`/admin/jobs/${job.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });

      setMsg(`✅ Estado actualizado a ${STATUS_META[nextStatus]?.label ?? nextStatus}.`);
      setOpenId(null);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSavingId(null);
    }
  }

  function pillStyle(status) {
    const m = STATUS_META[status] || STATUS_META.DRAFT;
    return {
      background: m.pillBg,
      color: m.pillText,
      border: "1px solid rgba(0,0,0,0.08)",
    };
  }

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <div>
          <h2 className="fw-bold mb-1">Vacantes (RRHH)</h2>
          <div className="text-muted small">
            Administra tus vacantes publicadas, cerradas y borradores.
          </div>
        </div>

        <Link to="/rrhh/vacantes/nueva" className="btn btn-dark rounded-pill px-4">
          + Nueva vacante
        </Link>
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
                  <th>Título</th>
                  <th>Ubicación</th>
                  <th>Tipo</th>
                  <th>Salario</th>
                  <th>Estado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-muted p-4">
                      No hay vacantes aún.
                    </td>
                  </tr>
                ) : (
                  rows.map((j) => {
                    const meta = STATUS_META[j.status] || STATUS_META.DRAFT;
                    const isSaving = savingId === j.id;
                    const isOpen = openId === j.id;

                    return (
                      <tr key={j.id}>
                        <td className="fw-semibold">{j.title ?? "—"}</td>
                        <td>{j.location ?? "—"}</td>
                        <td>{j.employment_type ?? "—"}</td>
                        <td>{j.salary_range ?? "—"}</td>

                        <td>
                          <button
                            ref={(el) => {
                              if (el) anchorsRef.current.set(j.id, el);
                              else anchorsRef.current.delete(j.id);
                            }}
                            type="button"
                            className="btn btn-sm rounded-pill px-3 d-inline-flex align-items-center gap-2"
                            onClick={() => setOpenId((prev) => (prev === j.id ? null : j.id))}
                            disabled={isSaving}
                            style={{
                              ...pillStyle(j.status),
                              fontWeight: 700,
                              boxShadow: "0 1px 0 rgba(0,0,0,0.05)",
                            }}
                            title="Cambiar estado"
                          >
                            <span>{meta.label}</span>
                            <span style={{ opacity: 0.9, fontSize: 12 }}>▼</span>
                          </button>

                          <StatusDropdownPortal
                            open={isOpen}
                            anchorEl={anchorsRef.current.get(j.id)}
                            currentStatus={j.status}
                            disabled={isSaving}
                            onClose={() => setOpenId(null)}
                            onSelect={(next) => onChangeStatus(j, next)}
                          />
                        </td>

                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-2 flex-wrap">
                            {/* ✅ NUEVO: ir a postulantes */}
                            <Link
                              to={`/rrhh/vacantes/${j.id}/postulantes`}
                              className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                            >
                              Postulantes
                            </Link>

                            <Link
                              to={`/rrhh/vacantes/${j.id}/editar`}
                              className="btn btn-outline-primary btn-sm rounded-pill px-3"
                            >
                              Editar
                            </Link>

                            <button
                              className="btn btn-outline-danger btn-sm rounded-pill px-3"
                              onClick={() => onDelete(j.id)}
                              disabled={isSaving}
                            >
                              Eliminar
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
