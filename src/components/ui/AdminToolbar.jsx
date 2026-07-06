import "./admin-toolbar.css";

export default function AdminToolbar({
  searchValue,
  onSearchChange,
  filters = [],
  activeFilter,
  onFilterChange,
}) {
  return (
    <div className="hx-toolbar">

      <div className="hx-toolbar__search">
        <i className="bi bi-search"></i>

        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar vacante..."
        />

        {searchValue && (
          <button
            className="hx-toolbar__clear"
            type="button"
            onClick={() => onSearchChange("")}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        )}
      </div>

      <div className="hx-toolbar__filters">
        {filters.map((filter) => (
          <button
            key={filter.key}
            type="button"
            className={`hx-toolbar__filter ${
              activeFilter === filter.key ? "is-active" : ""
            }`}
            onClick={() => onFilterChange(filter.key)}
          >
            <span>{filter.label}</span>

            <strong>{filter.count}</strong>
          </button>
        ))}
      </div>

    </div>
  );
}