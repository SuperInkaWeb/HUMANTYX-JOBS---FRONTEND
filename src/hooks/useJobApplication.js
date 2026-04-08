// src/hooks/useJobApplication.js

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";
import { useAuth } from "../hooks/useAuth";

export default function useJobApplication() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [applySuccess, setApplySuccess] = useState("");

  function resetApplyMessages() {
    setApplyError("");
    setApplySuccess("");
  }

  async function handleApply(selectedJob) {
    if (!selectedJob) return;

    resetApplyMessages();

    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "CANDIDATE") {
      setApplyError("Solo los candidatos pueden postular a una vacante.");
      return;
    }

    if (user.profile_complete === false) {
      navigate("/mi-perfil");
      return;
    }

    try {
      setApplying(true);

      await apiFetch("/candidate/applications", {
        method: "POST",
        body: JSON.stringify({
          job_id: selectedJob.id,
        }),
      });

      setApplySuccess("Postulación enviada correctamente.");
    } catch (err) {
      const msg = err.message || "No se pudo completar la postulación.";

      if (msg.includes("Ya postulaste")) {
        setApplyError("Ya postulaste a esta vacante.");
        return;
      }

      if (msg.includes("Perfil incompleto")) {
        navigate("/mi-perfil");
        return;
      }

      if (msg.includes("No se puede postular a una vacante cerrada")) {
        setApplyError("No se puede postular a una vacante cerrada.");
        return;
      }

      setApplyError(msg);
    } finally {
      setApplying(false);
    }
  }

  return {
    applying,
    applyError,
    applySuccess,
    handleApply,
    resetApplyMessages,
  };
}