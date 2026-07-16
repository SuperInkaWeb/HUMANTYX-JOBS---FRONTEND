import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function StatusDropdown({
  value,
  onChange,
  disabled,
  statusMeta,
  statusOrder,
}) {
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 240 });

  const meta = statusMeta[value] || { label: value ?? "—", cls: "" };

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

    window.addEventListener("resize", calcPos);
    window.addEventListener("scroll", calcPos, true);

    return () => {
      window.removeEventListener("resize", calcPos);
      window.removeEventListener("scroll", calcPos, true);
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

      {open &&
        createPortal(
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

            {statusOrder.map((k) => {
              const m = statusMeta[k];
              const isSelected = k === value;

              return (
                <button
                  key={k}
                  type="button"
                  disabled={disabled}
                  className={`hja-status-menu__item ${
                    isSelected ? "is-selected" : ""
                  }`}
                  onClick={() => {
                    if (disabled) return;

                    if (k !== value) {
                      onChange(k);
                    }

                    setOpen(false);
                  }}
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
        )}
    </>
  );
}