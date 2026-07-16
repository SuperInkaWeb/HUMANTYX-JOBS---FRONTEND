export default function JobDetailHeader({
  selectedJob,
  applying,
  onApply,
  canApply = true,
}) {
  return (
    <div className="job-detail-header">
      <div className="job-detail-header__top">
        <h1 className="job-detail-header__title">
          {selectedJob.title}
        </h1>

        {canApply && (
          <button
            className="job-detail-header__apply"
            onClick={onApply}
            disabled={applying}
          >
            {applying ? "Postulando..." : "Postular ahora"}
          </button>
        )}
      </div>
    </div>
  );
}