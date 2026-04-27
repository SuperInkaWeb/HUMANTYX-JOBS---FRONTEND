import { useEffect, useState } from "react";
import { apiFetch, getCvInfo } from "../services/api";
import { mapProfileFromApi, buildProfilePayload } from "../utils/profileHelpers";
import {
  validateAcademicItemComplete,
  validateWorkItemComplete,
  validateRequiredForForm,
} from "../utils/profileValidation";

export default function useProfilePersistence({
  refreshMe,
  isAcademicItemEmpty,
  isWorkItemEmpty,
  resetAllProfileModals,
  setAcademicDraft,
  setWorkDraft,
  setSectionDraft,
  isCandidate = false,
}) {
  const [form, setForm] = useState(null);
  const [cvInfo, setCvInfo] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCandidate]);

  async function loadInitialData() {
    try {
      setError("");
      setMsg("");
      setLoading(true);

      const mePromise = apiFetch("/auth/me");
      const cvPromise = isCandidate ? getCvInfo().catch(() => null) : Promise.resolve(null);

      const [me, cv] = await Promise.all([mePromise, cvPromise]);

      const u = me?.user || me || {};
      setForm(mapProfileFromApi(u));
      setCvInfo(cv || null);
    } catch (e) {
      setError(e.message || "No se pudo cargar el perfil.");
    } finally {
      setLoading(false);
    }
  }

  async function reloadCvInfo() {
    if (!isCandidate) {
      setCvInfo(null);
      return;
    }

    const latestCv = await getCvInfo().catch(() => null);
    setCvInfo(latestCv || null);
  }

  function validateFormForSaveByRole(sourceForm) {
    if (!isCandidate) return;

    validateRequiredForForm(sourceForm, {
      isAcademicItemEmpty,
      isWorkItemEmpty,
      validateAcademicItemComplete,
      validateWorkItemComplete,
    });
  }

  async function persistProfile(nextForm, successMessage) {
    setSaving(true);
    setError("");
    setMsg("");

    try {
      validateFormForSaveByRole(nextForm);

      const payload = buildProfilePayload(nextForm);

      const data = await apiFetch("/auth/me/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const p = data?.profile || data || {};
      setForm(mapProfileFromApi(p));

      await refreshMe();

      if (isCandidate) {
        await reloadCvInfo();
      }

      setMsg(successMessage);
    } catch (e) {
      setError(e.message || "No se pudo guardar en la base de datos.");
      throw e;
    } finally {
      setSaving(false);
    }
  }

  async function saveProfileNow(sourceForm) {
    setSaving(true);
    setError("");
    setMsg("");

    try {
      validateFormForSaveByRole(sourceForm);

      const payload = buildProfilePayload(sourceForm);

      const data = await apiFetch("/auth/me/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const p = data?.profile || data || {};
      setForm(mapProfileFromApi(p));

      await refreshMe();

      if (isCandidate) {
        await reloadCvInfo();
      }

      setMsg("✅ Perfil guardado correctamente.");

      setSectionDraft(null);
      resetAllProfileModals();
      setAcademicDraft(null);
      setWorkDraft(null);
    } catch (e) {
      setError(e.message || "No se pudo guardar el perfil.");
      throw e;
    } finally {
      setSaving(false);
    }
  }

  return {
    form,
    setForm,
    cvInfo,
    setCvInfo,
    loading,
    saving,
    error,
    setError,
    msg,
    setMsg,
    persistProfile,
    saveProfileNow,
    validateFormForSave: validateFormForSaveByRole,
    reloadCvInfo,
  };
}