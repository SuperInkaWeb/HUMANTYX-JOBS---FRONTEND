import { useEffect, useMemo, useState } from "react";
import RichTextEditor from "../shared/RichTextEditor";
import ConfirmActionModal from "../shared/ConfirmActionModal";
import { sanitizeRichTextHtml } from "../../utils/richText";
import "../../components/shared/rich-text-editor.css";
import "./job-description-modal.css";

function normalizeValue(value) {
  return sanitizeRichTextHtml(value || "");
}

export default function JobDescriptionModal({
  isOpen,
  job,
  onClose,
  onSaved,
  apiFetch,
}) {
  const [mode, setMode] = useState("view"); // view | edit
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [initialDescription, setInitialDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [confirmState, setConfirmState] = useState({
    open: false,
    mode: null, // save | cancel
  });

  useEffect(() => {
    if (!isOpen || !job) return;

    const clean = normalizeValue(job.description || "");
    setDescriptionDraft(clean);
    setInitialDescription(clean);
    setMode("view");
    setSaving(false);
    setError("");
    setConfirmState({ open: false, mode: null });
  }, [isOpen, job]);

  const hasChanges = useMemo(() => {
    return normalizeValue(descriptionDraft) !== normalizeValue(initialDescription);
  }, [descriptionDraft, initialDescription]);

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(e) {
      if (e.key === "Escape") {
        handleRequestClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  function handleRequestClose() {
    if (saving) return;

    if (mode === "edit" && hasChanges) {
      setConfirmState({
        open: true,
        mode: "cancel",
      });
      return;
    }

    onClose?.();
  }

  function handleStartEdit() {
    setMode("edit");
    setError("");
  }

  function handleCancelEdit() {
    if (hasChanges) {
      setConfirmState({
        open: true,
        mode: "cancel",
      });
      return;
    }

    setDescriptionDraft(initialDescription);
    setMode("view");
    setError("");
  }

  function handleSaveRequest() {
    setConfirmState({
      open: true,
      mode: "save",
    });
  }

  async function persistDescription() {
    if (!job?.id) return;

    try {
      setSaving(true);
      setError("");

      await apiFetch(`/admin/jobs/${job.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: job.title || "",
          location: job.location || "",
          employment_type: job.employment_type || "",
          salary_range: job.salary_range || "",
          description: normalizeValue(descriptionDraft),
          status: job.status || "DRAFT",
        }),
      });

      const clean = normalizeValue(descriptionDraft);
      setInitialDescription(clean);
      setDescriptionDraft(clean);
      setMode("view");
      setConfirmState({ open: false, mode: null });

      if (onSaved) {
        await onSaved();
      }
    } catch (e) {
      setError(e.message || "No se pudo guardar la descripción");
    } finally {
      setSaving(false);
    }
  }

  function handleConfirmAccept() {
    if (confirmState.mode === "cancel") {
      setDescriptionDraft(initialDescription);
      setMode("view");
      setConfirmState({ open: false, mode: null });
      setError("");
      return;
    }

    if (confirmState.mode === "save") {
      persistDescription();
    }
  }

  function handleConfirmClose() {
    if (saving) return;
    setConfirmState({ open: false, mode: null });
  }

  if (!isOpen || !job) return null;

  return (
    <>
      <div className="jdm-backdrop">
        <div
          className="jdm-modal"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Descripción de vacante"
        >
          <div className="jdm-header">
            <div className="jdm-header__copy">
              <h2>{job.title || "Descripción de vacante"}</h2>
              <p>
                {mode === "view"
                  ? "Visualiza la descripción completa de la vacante."
                  : "Edita la descripción de la vacante con formato enriquecido."}
              </p>
            </div>

            <button
              type="button"
              className="jdm-close-btn"
              onClick={handleRequestClose}
              aria-label="Cerrar modal"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <div className="jdm-divider"></div>

          <div className="jdm-body">
            {error && <div className="alert alert-danger jdm-alert">{error}</div>}

            {mode === "view" ? (
              <div className="jdm-content">
                <div
                  className="jdm-description-view"
                  dangerouslySetInnerHTML={{
                    __html:
                      normalizeValue(descriptionDraft) ||
                      "<p>Esta vacante aún no tiene una descripción registrada.</p>",
                  }}
                />
              </div>
            ) : (
              <div className="jdm-content">
                <RichTextEditor
                  id={`job-description-${job.id}`}
                  value={descriptionDraft}
                  onChange={setDescriptionDraft}
                  placeholder="Escribe la descripción de la vacante..."
                />
              </div>
            )}
          </div>

          <div className="jdm-footer">
            {mode === "view" ? (
              <>
                <button
                  type="button"
                  className="jdm-btn jdm-btn--ghost"
                  onClick={handleRequestClose}
                >
                  Cerrar
                </button>

                <button
                  type="button"
                  className="jdm-btn jdm-btn--primary"
                  onClick={handleStartEdit}
                >
                  Editar descripción
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="jdm-btn jdm-btn--ghost"
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="jdm-btn jdm-btn--primary"
                  onClick={handleSaveRequest}
                  disabled={saving}
                >
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <ConfirmActionModal
        isOpen={confirmState.open}
        title={
          confirmState.mode === "save"
            ? "Guardar descripción"
            : "Descartar cambios"
        }
        message={
          confirmState.mode === "save"
            ? "¿Deseas guardar los cambios realizados en la descripción de esta vacante?"
            : "Hay cambios sin guardar en la descripción. ¿Seguro que deseas descartarlos?"
        }
        confirmText={
          confirmState.mode === "save" ? "Sí, guardar" : "Sí, descartar"
        }
        cancelText={
          confirmState.mode === "save" ? "Cancelar" : "Seguir editando"
        }
        danger={confirmState.mode === "cancel"}
        loading={saving}
        onCancel={handleConfirmClose}
        onConfirm={handleConfirmAccept}
      />
    </>
  );
}