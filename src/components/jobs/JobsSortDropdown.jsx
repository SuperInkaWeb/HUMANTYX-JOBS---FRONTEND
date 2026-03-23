import { getSortLabel } from "../../utils/jobs";

export default function JobsSortDropdown({
  sortBy,
  openSort,
  onToggle,
  onChangeSort,
}) {
  return (
    <div className="jobs-sort">
      <span className="jobs-sort__label">Ordenar por:</span>

      <div
        className="jobs-sort__dropdown"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="jobs-sort__button"
          onClick={onToggle}
        >
          <span>{getSortLabel(sortBy)}</span>
          <i className="bi bi-chevron-down"></i>
        </button>

        {openSort && (
          <div className="jobs-sort__menu">
            <button type="button" onClick={() => onChangeSort("newest")}>
              Más recientes
            </button>
            <button type="button" onClick={() => onChangeSort("oldest")}>
              Más antiguos
            </button>
            <button type="button" onClick={() => onChangeSort("title_asc")}>
              Título A-Z
            </button>
          </div>
        )}
      </div>
    </div>
  );
}