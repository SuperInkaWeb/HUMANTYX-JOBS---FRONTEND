// src/hooks/useJobsList.js

import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import { sortJobs } from "../utils/jobs";

export default function useJobsList({
  queryKeyword,
  queryLocation,
  querySort,
  selectedJobIdFromUrl,
  onResetMessages,
}) {
  const [jobs, setJobs] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    loadJobs(queryKeyword, queryLocation, querySort, selectedJobIdFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKeyword, queryLocation, querySort, selectedJobIdFromUrl]);

  async function loadJobs(
    qValue = "",
    locationValue = "",
    sortValue = "newest",
    routeJobId = null
  ) {
    try {
      setLoadingList(true);
      setError("");
      onResetMessages?.();

      const params = new URLSearchParams();

      if (qValue.trim()) params.set("q", qValue.trim());
      if (locationValue.trim()) params.set("location", locationValue.trim());

      params.set("limit", "100");

      const data = await apiFetch(`/jobs?${params.toString()}`);

      const rawList = data.jobs || [];
      const sortedList = sortJobs(rawList, sortValue);

      setJobs(sortedList);

      if (sortedList.length > 0) {
        const jobFromUrl = routeJobId
          ? sortedList.find((job) => String(job.id) === String(routeJobId))
          : null;

        setSelectedId(jobFromUrl ? jobFromUrl.id : sortedList[0].id);
      } else {
        setSelectedId(null);
      }
    } catch (err) {
      setError(err.message || "No se pudieron cargar las vacantes");
      setJobs([]);
      setSelectedId(null);
    } finally {
      setLoadingList(false);
    }
  }

  return {
    jobs,
    loadingList,
    error,
    selectedId,
    setSelectedId,
    loadJobs,
  };
}