// src/hooks/useProfileForm.js

import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";

import {
  mapProfileFromApi,
  buildProfilePayload,
  cloneFormState,
} from "../utils/profileHelpers";

import { validateRequiredForForm } from "../utils/profileValidation";

export default function useProfileForm() {
  const [form, setForm] = useState(null);
  const [originalForm, setOriginalForm] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);

      const data = await apiFetch("/auth/me");
      const mapped = mapProfileFromApi(data);

      setForm(mapped);
      setOriginalForm(cloneFormState(mapped));
    } catch {
      setError("Error cargando perfil");
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    const validationError = validateRequiredForForm(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = buildProfilePayload(form);

      await apiFetch("/auth/me/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setOriginalForm(cloneFormState(form));
      setMessage("Perfil actualizado correctamente");
    } catch (err) {
      setError(err.message || "Error guardando perfil");
    } finally {
      setSaving(false);
    }
  }

  return {
    form,
    setForm,
    loading,
    saving,
    error,
    message,
    saveProfile,
  };
}