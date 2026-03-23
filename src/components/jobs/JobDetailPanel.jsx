import JobDetailHeader from "./JobDetailHeader";
import JobInfoList from "./JobInfoList";

function renderDescription(description) {
  if (!description) return "Sin descripción por ahora.";

  return description.split("\n").map((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return null;

    return (
      <p key={index} className="job-detail-panel__paragraph">
        {trimmed}
      </p>
    );
  });
}

export default function JobDetailPanel({
  selectedId,
  loadingDetail,
  selectedJob,
  applying,
  applyError,
  applySuccess,
  onApply,
}) {
  return (
    <div className="job-detail-panel">
      {!selectedId && (
        <div className="job-detail-panel__empty">
          Selecciona una vacante para ver el detalle.
        </div>
      )}

      {selectedId && loadingDetail && (
        <div className="job-detail-panel__empty">Cargando detalle...</div>
      )}

      {selectedId && !loadingDetail && selectedJob && (
        <>
          {applyError && (
            <div className="alert alert-danger jobs-alert jobs-alert--inside">
              {applyError}
            </div>
          )}

          {applySuccess && (
            <div className="alert alert-success jobs-alert jobs-alert--inside">
              {applySuccess}
            </div>
          )}

          <JobDetailHeader
            selectedJob={selectedJob}
            applying={applying}
            onApply={onApply}
          />

          <div className="job-detail-panel__section">
            <div className="job-detail-panel__section-label">
              DATOS DE LA VACANTE
            </div>
            <JobInfoList selectedJob={selectedJob} />
          </div>

          <div className="job-detail-panel__section">
            <div className="job-detail-panel__section-label">
              DESCRIPCIÓN COMPLETA DEL PUESTO
            </div>

            <div className="job-detail-panel__description">
              {renderDescription(selectedJob.description)}
            </div>
          </div>
        </>
      )}

      {selectedId && !loadingDetail && !selectedJob && (
        <div className="job-detail-panel__empty">
          No se pudo cargar el detalle de la vacante.
        </div>
      )}
    </div>
  );
}