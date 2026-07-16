import { useCallback, useMemo, useState } from "react";
import { apiFetch } from "../services/api";

export function useJobApplications({
  jobId,
  statusMeta,
  statusOrder,
  getApplicationDate,
}) {
  const [job, setJob] = useState(null);
  const [rows, setRows] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [activeStatusFilter, setActiveStatusFilter] = useState("ALL");

  const [updatingId, setUpdatingId] = useState(null);
  const [pendingStatusByApp, setPendingStatusByApp] = useState({});

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  const statusCounts = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        const status = row.application_status || "APPLIED";
        acc.ALL += 1;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {
        ALL: 0,
        APPLIED: 0,
        IN_REVIEW: 0,
        INTERVIEW: 0,
        REJECTED: 0,
        HIRED: 0,
      }
    );
  }, [rows]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm);

    return rows
      .filter((row) => {
        const status = row.application_status || "APPLIED";

        const matchesStatus =
          activeStatusFilter === "ALL" || status === activeStatusFilter;

        if (!matchesStatus) return false;
        if (!normalizedSearch) return true;

        const fullName = `${row.first_name ?? ""} ${row.last_name ?? ""}`;
        const statusLabel = statusMeta[status]?.label || status;

        const searchableText = normalizeText(
          [
            fullName,
            row.email,
            row.phone,
            row.document_type,
            row.document_number,
            row.candidate_id,
            row.application_id,
            status,
            statusLabel,
          ].join(" ")
        );

        return searchableText.includes(normalizedSearch);
      })
      .sort((a, b) => {
        const dateA = new Date(getApplicationDate(a) || 0).getTime();
        const dateB = new Date(getApplicationDate(b) || 0).getTime();

        return dateB - dateA;
      });
  }, [
    rows,
    searchTerm,
    activeStatusFilter,
    statusMeta,
    getApplicationDate,
  ]);

  const groupedRows = useMemo(() => {
    return statusOrder.reduce((acc, status) => {
      acc[status] = filteredRows.filter(
        (row) => (row.application_status || "APPLIED") === status
      );

      return acc;
    }, {});
  }, [filteredRows, statusOrder]);

  const loadAll = useCallback(
    async (silent = false) => {
      try {
        if (!silent) {
          setError("");
          setMsg("");
          setLoading(true);
        }

        const apps = await apiFetch(`/admin/jobs/${jobId}/applications`);
        const list = apps?.applications ?? apps ?? [];

        setRows(Array.isArray(list) ? list : []);

        if (!silent) {
          setPendingStatusByApp({});
        }

        try {
          const j = await apiFetch(`/admin/jobs/${jobId}`);
          setJob(j?.job ?? j ?? null);
        } catch {
          setJob(null);
        }
      } catch (e) {
        if (!silent) {
          setError(e.message || "No se pudieron cargar los postulantes");
          setRows([]);
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [jobId]
  );

  async function updateStatus(applicationId, status) {
    try {
      setError("");
      setMsg("");
      setUpdatingId(applicationId);

      await apiFetch(`/admin/applications/${applicationId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      setMsg("✅ Estado de postulación actualizado.");

      setRows((prev) =>
        prev.map((r) =>
          r.application_id === applicationId
            ? { ...r, application_status: status }
            : r
        )
      );

      return true;
    } catch (e) {
      setError(e.message || "No se pudo actualizar el estado");
      return false;
    } finally {
      setUpdatingId(null);
    }
  }

  function getPendingStatus(applicationId, currentStatus) {
    const draft = pendingStatusByApp[applicationId];
    if (!draft || draft === currentStatus) return null;
    return draft;
  }

  function handleDraftStatusChange(applicationId, nextStatus, currentStatus) {
    setError("");
    setMsg("");

    setPendingStatusByApp((prev) => {
      const copy = { ...prev };

      if (!nextStatus || nextStatus === currentStatus) {
        delete copy[applicationId];
        return copy;
      }

      copy[applicationId] = nextStatus;
      return copy;
    });
  }

  function cancelDraftStatus(applicationId) {
    setPendingStatusByApp((prev) => {
      const copy = { ...prev };
      delete copy[applicationId];
      return copy;
    });
  }

  async function saveDraftStatus(applicationId) {
    const nextStatus = pendingStatusByApp[applicationId];
    if (!nextStatus) return;

    const ok = await updateStatus(applicationId, nextStatus);
    if (!ok) return;

    setPendingStatusByApp((prev) => {
      const copy = { ...prev };
      delete copy[applicationId];
      return copy;
    });
  }

  return {
  job,
  rows,
  loading,
  error,
  msg,
  searchTerm,
  setSearchTerm,
  activeStatusFilter,
  setActiveStatusFilter,
  updatingId,
  statusCounts,
  filteredRows,
  groupedRows,
  total: rows.length,
  visibleTotal: filteredRows.length,
  loadAll,
  updateStatus,
  getPendingStatus,
  handleDraftStatusChange,
  saveDraftStatus,
  cancelDraftStatus,
};
}