export default function ApplicationStatusControl({
  applicationId,
  currentStatus,
  displayStatus,
  disabledStatus,
  hasPendingStatusChange,
  StatusDropdown,
  onDraftStatusChange,
  onSaveDraftStatus,
  onCancelDraftStatus,
}) {
  return (
    <div className="hja-status-stack">
      <StatusDropdown
        value={displayStatus}
        onChange={(next) =>
          onDraftStatusChange(applicationId, next, currentStatus)
        }
        disabled={disabledStatus}
      />

      {hasPendingStatusChange && (
        <div className="hja-status-pending-box">
          <div className="hja-status-pending-box__actions">
            <button
              type="button"
              className="hja-inline-btn hja-inline-btn--primary"
              onClick={() => onSaveDraftStatus(applicationId)}
              disabled={disabledStatus}
            >
              {disabledStatus ? "Guardando..." : "Guardar"}
            </button>

            <button
              type="button"
              className="hja-inline-btn hja-inline-btn--ghost"
              onClick={() => onCancelDraftStatus(applicationId)}
              disabled={disabledStatus}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}