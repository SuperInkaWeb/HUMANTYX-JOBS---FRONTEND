import JobsSortDropdown from "./JobsSortDropdown";

export default function JobsResultsBar({
  loadingList,
  jobsCount,
  queryKeyword,
  queryLocation,
  sortBy,
  openSort,
  onToggleSort,
  onChangeSort,
}) {
  return (
    <div className="jobs-results-bar">
      <div className="jobs-results-bar__content">
        <h3 className="jobs-results-bar__title">
          {loadingList
            ? "Cargando vacantes..."
            : `${jobsCount} vacante(s) encontrada(s)`}
        </h3>

        <p className="jobs-results-bar__subtitle">
          {queryKeyword || queryLocation ? (
            <>
              {queryKeyword ? (
                <>
                  Palabra clave: <strong>{queryKeyword}</strong>.{" "}
                </>
              ) : null}
              {queryLocation ? (
                <>
                  Ubicación: <strong>{queryLocation}</strong>.
                </>
              ) : null}
            </>
          ) : (
            <>Explora las oportunidades disponibles.</>
          )}
        </p>
      </div>

      <JobsSortDropdown
        sortBy={sortBy}
        openSort={openSort}
        onToggle={onToggleSort}
        onChangeSort={onChangeSort}
      />
    </div>
  );
}