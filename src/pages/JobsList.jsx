import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import useJobsSearchParams from "../hooks/useJobsSearchParams";
import useJobsList from "../hooks/useJobsList";
import useJobDetail from "../hooks/useJobDetail";
import useJobApplication from "../hooks/useJobApplication";

import JobsSearchBar from "../components/jobs/JobsSearchBar";
import JobsResultsBar from "../components/jobs/JobsResultsBar";
import JobsListPanel from "../components/jobs/JobsListPanel";
import JobDetailPanel from "../components/jobs/JobDetailPanel";

import "./jobs.css";

const JOBS_PER_PAGE = 10;

export default function JobsList() {
  const { id } = useParams();
  const locationHook = useLocation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

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
  selectedJobIdFromUrl: id,
  onResetMessages: resetApplyMessages,
});

  const getJobUrl = (jobId) => {
    return `/empleos/${jobId}${locationHook.search || ""}`;
  };

  const handleSelectJob = (jobId) => {
  setSelectedId(jobId);
  navigate(getJobUrl(jobId));
};

  const totalJobs = jobs.length;
  const totalPages = Math.ceil(totalJobs / JOBS_PER_PAGE);

  useEffect(() => {
    if (!id || loadingList || jobs.length === 0) return;

    const jobIndex = jobs.findIndex((job) => String(job.id) === String(id));

    if (jobIndex >= 0) {
      setSelectedId(jobs[jobIndex].id);
      setCurrentPage(Math.floor(jobIndex / JOBS_PER_PAGE) + 1);
    }
  }, [id, jobs, loadingList, setSelectedId]);

  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
    const endIndex = startIndex + JOBS_PER_PAGE;

    return jobs.slice(startIndex, endIndex);
  }, [jobs, currentPage]);

  const startIndex = totalJobs === 0 ? 0 : (currentPage - 1) * JOBS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * JOBS_PER_PAGE, totalJobs);

  useEffect(() => {
    if (!id) {
      setCurrentPage(1);
    }
  }, [queryKeyword, queryLocation, sortBy, id]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const { selectedJob, loadingDetail } = useJobDetail({
    selectedId,
    onResetMessages: resetApplyMessages,
  });

  return (
    <section className="jobs-page">
      <div className="jobs-shell">
        <JobsSearchBar
          keyword={keyword}
          location={location}
          loadingList={loadingList}
          jobs={jobs}
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
          <aside className="jobs-board__left">
            <JobsListPanel
              error={error}
              loadingList={loadingList}
              jobs={paginatedJobs}
              selectedId={selectedId}
              onSelectJob={handleSelectJob}
              getJobUrl={getJobUrl}
            />

            {!loadingList && !error && totalJobs > 0 && (
              <p className="jobs-results-summary">
                Mostrando {startIndex}–{endIndex} de {totalJobs} vacantes
              </p>
            )}

            {!loadingList && !error && totalPages > 1 && (
              <div className="jobs-pagination">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => page - 1)}
                >
                  Anterior
                </button>

                {Array.from({ length: totalPages }, (_, index) => {
                  const page = index + 1;

                  return (
                    <button
                      type="button"
                      key={page}
                      className={currentPage === page ? "active" : ""}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((page) => page + 1)}
                >
                  Siguiente
                </button>
              </div>
            )}
          </aside>

          <section className="jobs-board__right">
            <JobDetailPanel
              selectedId={selectedId}
              loadingDetail={loadingDetail}
              selectedJob={selectedJob}
              applying={applying}
              applyError={applyError}
              applySuccess={applySuccess}
              onApply={() => handleApply(selectedJob)}
            />
          </section>
        </div>
      </div>
    </section>
  );
}