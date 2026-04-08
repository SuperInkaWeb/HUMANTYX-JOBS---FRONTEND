import "./confirm-action-modal.css";

export default function ConfirmActionModal({
  isOpen,
  title = "Confirmar acción",
  message = "¿Estás seguro de que deseas continuar?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  danger = false,
  loading = false,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="cam-overlay"
      onClick={loading ? undefined : onCancel}
      role="presentation"
    >
      <div
        className="cam-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cam-title"
      >
        <div className="cam-head">
          <div className={`cam-icon ${danger ? "is-danger" : ""}`}>
            <i
              className={`bi ${
                danger ? "bi-exclamation-triangle-fill" : "bi-question-lg"
              }`}
            ></i>
          </div>

          <div className="cam-copy">
            <h3 id="cam-title" className="cam-title">
              {title}
            </h3>
            <p className="cam-message">{message}</p>
          </div>
        </div>

        <div className="cam-actions">
          <button
            type="button"
            className="cam-btn cam-btn--ghost"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className={`cam-btn cam-btn--primary ${
              danger ? "cam-btn--danger" : ""
            }`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Procesando..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}