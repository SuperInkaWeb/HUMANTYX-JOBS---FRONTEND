import { useEffect, useMemo, useRef, useState } from "react";
export default function JobsSearchBar({
  keyword,
  location,
  loadingList,
  jobs = [],
  onKeywordChange,
  onLocationChange,
  onSubmit,
}) {
  const [showKeywordSuggestions, setShowKeywordSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const searchBoxRef = useRef(null);

  const keywordSuggestions = useMemo(() => {
    const text = keyword.trim().toLowerCase();

    if (text.length < 2) return [];

    return jobs
      .filter((job) => {
        const title = job.title?.toLowerCase() || "";
        const description = job.description?.toLowerCase() || "";

        return title.includes(text) || description.includes(text);
      })
      .slice(0, 6);
  }, [keyword, jobs]);

  useEffect(() => {
  function handleClickOutside(event) {
    if (
      searchBoxRef.current &&
      !searchBoxRef.current.contains(event.target)
    ) {
      setShowKeywordSuggestions(false);
      setActiveSuggestionIndex(-1);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  const handleSelectKeyword = (jobTitle) => {
    onKeywordChange(jobTitle);
    setShowKeywordSuggestions(false);
    setActiveSuggestionIndex(-1);
  };

  const handleKeywordKeyDown = (e) => {
    if (!showKeywordSuggestions || keywordSuggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) =>
        prev >= keywordSuggestions.length - 1 ? 0 : prev + 1
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) =>
        prev <= 0 ? keywordSuggestions.length - 1 : prev - 1
      );
    }

    if (e.key === "Enter" && activeSuggestionIndex >= 0) {
      e.preventDefault();
      handleSelectKeyword(keywordSuggestions[activeSuggestionIndex].title);
    }

    if (e.key === "Escape") {
      setShowKeywordSuggestions(false);
      setActiveSuggestionIndex(-1);
    }
  };

  return (
    <form onSubmit={onSubmit} className="jobs-searchbar">
      <div className="jobs-searchbar__inner">
        <div ref={searchBoxRef} className="jobs-searchbar__box jobs-searchbar__box--relative">
          <i className="bi bi-search jobs-searchbar__icon"></i>
          <input
            type="text"
            placeholder="Cargo, palabras clave..."
            value={keyword}
            onChange={(e) => {
              onKeywordChange(e.target.value);
              setShowKeywordSuggestions(true);
              setActiveSuggestionIndex(-1);
            }}
            onFocus={() => setShowKeywordSuggestions(true)}
            onKeyDown={handleKeywordKeyDown}
            autoComplete="off"
          />

          {showKeywordSuggestions && keywordSuggestions.length > 0 && (
            <div className="jobs-suggestions">
              {keywordSuggestions.map((job, index) => (
                <button
                  type="button"
                  key={job.id}
                  className={`jobs-suggestions__item ${
                    activeSuggestionIndex === index ? "is-active" : ""
                  }`}
                  onClick={() => handleSelectKeyword(job.title)}
                >
                  <strong>{job.title}</strong>
                  <span>{job.location}</span>
                </button>
              ))}
            </div>
          )}
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