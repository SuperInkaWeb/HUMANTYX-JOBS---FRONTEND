// src/hooks/useJobDetail.js

import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";

export default function useJobDetail({ selectedId, onResetMessages }) {
  const [selectedJob, setSelectedJob] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (!selectedId) {
      setSelectedJob(null);
      return;
    }

    loadJobDetail(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  async function loadJobDetail(id) {
    try {
      setLoadingDetail(true);
      onResetMessages?.();

      const data = await apiFetch(`/jobs/${id}`);
      setSelectedJob(data.job || null);
    } catch {
      setSelectedJob(null);
    } finally {
      setLoadingDetail(false);
    }
  }

  return {
    selectedJob,
    setSelectedJob,
    loadingDetail,
    loadJobDetail,
  };
}