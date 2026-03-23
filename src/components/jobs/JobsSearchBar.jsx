export default function JobsSearchBar({
  keyword,
  location,
  loadingList,
  onKeywordChange,
  onLocationChange,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="jobs-searchbar">
      <div className="jobs-searchbar__inner">
        <div className="jobs-searchbar__box">
          <i className="bi bi-search jobs-searchbar__icon"></i>
          <input
            type="text"
            placeholder="Cargo, palabras clave..."
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
          />
        </div>

        <div className="jobs-searchbar__box">
          <i className="bi bi-geo-alt-fill jobs-searchbar__icon"></i>
          <input
            type="text"
            placeholder="Ciudad o región"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="jobs-searchbar__button"
          disabled={loadingList}
        >
          {loadingList ? "Buscando..." : "Buscar"}
        </button>
      </div>
    </form>
  );
}