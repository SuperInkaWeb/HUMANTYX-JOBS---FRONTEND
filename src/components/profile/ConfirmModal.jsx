export default function ConfirmModal({
  isOpen,
  title = "Confirmar acción",
  message = "¿Estás seguro de que deseas continuar?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  danger = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="hx-modal-backdrop">
      <div
        className="hx-confirm-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <div className="hx-confirm-modal__header">
          <div className={`hx-confirm-modal__icon ${danger ? "is-danger" : ""}`}>
            <i className={`bi ${danger ? "bi-exclamation-triangle" : "bi-question-lg"}`}></i>
          </div>

          <div>
            <h3 id="confirm-modal-title" className="hx-confirm-modal__title">
              {title}
            </h3>
            <p className="hx-confirm-modal__message">{message}</p>
          </div>
        </div>

        <div className="hx-confirm-modal__actions">
          <button
            type="button"
            className="hx-btn-secondary"
            onClick={onCancel}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className={`hx-btn-primary ${danger ? "hx-btn-danger" : ""}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}