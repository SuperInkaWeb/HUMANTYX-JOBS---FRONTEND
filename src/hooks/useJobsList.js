// src/hooks/useJobsList.js

import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import { sortJobs } from "../utils/jobs";

export default function useJobsList({
  queryKeyword,
  queryLocation,
  querySort,
  onResetMessages,
}) {
  const [jobs, setJobs] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    loadJobs(queryKeyword, queryLocation, querySort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKeyword, queryLocation, querySort]);

  async function loadJobs(
    qValue = "",
    locationValue = "",
    sortValue = "newest"
  ) {
    try {
      setLoadingList(true);
      setError("");
      onResetMessages?.();

      const params = new URLSearchParams();
      if (qValue.trim()) params.set("q", qValue.trim());
      if (locationValue.trim()) params.set("location", locationValue.trim());

      const data = await apiFetch(
        `/jobs${params.toString() ? `?${params.toString()}` : ""}`
      );

      const rawList = data.jobs || [];
      const sortedList = sortJobs(rawList, sortValue);

      setJobs(sortedList);

      if (sortedList.length > 0) {
        setSelectedId((prev) => {
          const stillExists = sortedList.some((job) => job.id === prev);
          return stillExists ? prev : sortedList[0].id;
        });
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