import { useEffect, useState } from "react";

import JobCard from "./JobCard";
import JobsEmptyState from "./JobsEmptyState";
import JobsSkeletonList from "./JobsSkeletonList";

const FAVORITES_STORAGE_KEY = "humantyx_job_favorites";

export default function JobsListPanel({
  error,
  loadingList,
  jobs,
  selectedId,
  onSelectJob,
  getJobUrl,
}) {
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    const savedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);

    if (savedFavorites) {
      try {
        setFavoriteIds(JSON.parse(savedFavorites));
      } catch {
        setFavoriteIds([]);
      }
    }
  }, []);

  const toggleFavorite = (jobId) => {
    setFavoriteIds((prev) => {
      const exists = prev.includes(jobId);

      const nextFavorites = exists
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId];

      localStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify(nextFavorites)
      );

      return nextFavorites;
    });
  };

  const displayedJobs = showFavoritesOnly
    ? jobs.filter((job) => favoriteIds.includes(job.id))
    : jobs;

  return (
    <div className="jobs-list-panel">
      {error && <div className="alert alert-danger jobs-alert">{error}</div>}

      <div className="jobs-list-filter">
        <button
          type="button"
          className={!showFavoritesOnly ? "active" : ""}
          onClick={() => setShowFavoritesOnly(false)}
        >
          Todas ({jobs.length})
        </button>

        <button
          type="button"
          className={showFavoritesOnly ? "active" : ""}
          onClick={() => setShowFavoritesOnly(true)}
        >
          ❤️ Favoritos ({favoriteIds.length})
        </button>
      </div>

      {loadingList && <JobsSkeletonList />}

      {!loadingList && displayedJobs.length === 0 && (
        showFavoritesOnly ? (
          <div className="jobs-favorites-empty">
            <div className="jobs-favorites-empty__icon">❤️</div>
            <h3>Aún no tienes vacantes favoritas</h3>
            <p>
              Explora las ofertas y marca con el corazón las vacantes que
              quieras guardar para revisarlas más tarde.
            </p>
            <button type="button" onClick={() => setShowFavoritesOnly(false)}>
              Ver todas las vacantes
            </button>
          </div>
        ) : (
          <JobsEmptyState />
        )
      )}

      {!loadingList &&
        displayedJobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            active={job.id === selectedId}
            onSelect={onSelectJob}
            isFavorite={favoriteIds.includes(job.id)}
            onToggleFavorite={toggleFavorite}
            jobUrl={getJobUrl ? getJobUrl(job.id) : `/empleos/${job.id}`}
          />
        ))}
    </div>
  );
}