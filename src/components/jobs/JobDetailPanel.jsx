import JobDetailHeader from "./JobDetailHeader";
import JobInfoList from "./JobInfoList";
import { useAuth } from "../../hooks/useAuth";

function renderDescription(description) {
  if (!description) {
    return (
      <p className="job-detail-panel__paragraph">
        Sin descripción por ahora.
      </p>
    );
  }

  return (
    <div
      className="job-detail-panel__richtext"
      dangerouslySetInnerHTML={{ __html: description }}
    />
  );
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
  const { user } = useAuth();

  const canApply = !user || user?.role === "CANDIDATE";

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
            canApply={canApply}
          />

          <div className="job-detail-panel__section">
            <div className="job-detail-panel__section-label">
              Datos de la vacante
            </div>

            <JobInfoList selectedJob={selectedJob} />
          </div>

          <div className="job-detail-panel__section job-detail-panel__section--description">
            <div className="job-detail-panel__description-title-wrap">
              <span className="job-detail-panel__description-accent"></span>
              <div className="job-detail-panel__description-title">
                Descripción del puesto
              </div>
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