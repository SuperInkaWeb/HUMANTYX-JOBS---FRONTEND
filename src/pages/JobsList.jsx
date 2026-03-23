import useJobsSearchParams from "../hooks/useJobsSearchParams";
import useJobsList from "../hooks/useJobsList";
import useJobDetail from "../hooks/useJobDetail";
import useJobApplication from "../hooks/useJobApplication";

import JobsSearchBar from "../components/jobs/JobsSearchBar";
import JobsResultsBar from "../components/jobs/JobsResultsBar";
import JobsListPanel from "../components/jobs/JobsListPanel";
import JobDetailPanel from "../components/jobs/JobDetailPanel";

import "./jobs.css";

export default function JobsList() {
  const {
    queryKeyword,
    queryLocation,
    keyword,
    setKeyword,
    location,
    setLocation,
    sortBy,
    openSort,
    onSearch,
    changeSort,
    toggleSortDropdown,
  } = useJobsSearchParams();

  const {
    applying,
    applyError,
    applySuccess,
    handleApply,
    resetApplyMessages,
  } = useJobApplication();

  const {
    jobs,
    loadingList,
    error,
    selectedId,
    setSelectedId,
  } = useJobsList({
    queryKeyword,
    queryLocation,
    querySort: sortBy,
    onResetMessages: resetApplyMessages,
  });

  const {
    selectedJob,
    loadingDetail,
  } = useJobDetail({
    selectedId,
    onResetMessages: resetApplyMessages,
  });

  return (
    <div className="jobs-page">
      <div className="jobs-shell">
        <JobsSearchBar
          keyword={keyword}
          location={location}
          loadingList={loadingList}
          onKeywordChange={setKeyword}
          onLocationChange={setLocation}
          onSubmit={onSearch}
        />

        <JobsResultsBar
          loadingList={loadingList}
          jobsCount={jobs.length}
          queryKeyword={queryKeyword}
          queryLocation={queryLocation}
          sortBy={sortBy}
          openSort={openSort}
          onToggleSort={toggleSortDropdown}
          onChangeSort={changeSort}
        />

        <div className="jobs-board">
          <div className="jobs-board__left">
            <JobsListPanel
              error={error}
              loadingList={loadingList}
              jobs={jobs}
              selectedId={selectedId}
              onSelectJob={setSelectedId}
            />
          </div>

          <div className="jobs-board__right">
            <JobDetailPanel
              selectedId={selectedId}
              loadingDetail={loadingDetail}
              selectedJob={selectedJob}
              applying={applying}
              applyError={applyError}
              applySuccess={applySuccess}
              onApply={() => handleApply(selectedJob)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}