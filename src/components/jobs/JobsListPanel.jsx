import JobCard from "./JobCard";
import JobsEmptyState from "./JobsEmptyState";
import JobsSkeletonList from "./JobsSkeletonList";

export default function JobsListPanel({
  error,
  loadingList,
  jobs,
  selectedId,
  onSelectJob,
}) {
  return (
    <div className="jobs-list-panel">
      {error && <div className="alert alert-danger jobs-alert">{error}</div>}

      {loadingList && <JobsSkeletonList />}

      {!loadingList && jobs.length === 0 && <JobsEmptyState />}

      {!loadingList &&
        jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            active={job.id === selectedId}
            onSelect={onSelectJob}
          />
        ))}
    </div>
  );
}