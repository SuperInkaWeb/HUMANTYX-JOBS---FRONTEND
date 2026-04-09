import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { apiFetch } from "../services/api";
import { DOC_TYPES, GENDERS, MARITAL } from "../utils/profileHelpers";
import { mapProfileFromApi, buildProfilePayload } from "../utils/profileHelpers";
import "./complete-profile.css";

const INITIAL_FORM = {
  first_name: "",
  last_name: "",
  phone: "",
  document_type: "",
  document_number: "",
  country: "",
  department: "",
  city: "",
  birth_date: "",
  gender: "",
  marital_status: "",
  headline: "",
  about: "",
  experience_years: "",
  availability: "",
  academic_items: [],
  work_items: [],
};

export default function CompleteProfile() {
  const nav = useNavigate();
  const { user, refreshMe } = useAuth();

  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isCandidate = (user?.role || "").toUpperCase() === "CANDIDATE";

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setError("");
      setLoading(true);

      const me = await apiFetch("/auth/me");
      const u = me?.user || {};
      const mapped = mapProfileFromApi(u);

      setForm((prev) => ({
        ...prev,
        ...mapped,
        academic_items: [],
        work_items: [],
      }));
    } catch (e) {
      setError(e.message || "No se pudo cargar el perfil.");
    } finally {
      setLoading(false);
    }
  }

  const progress = useMemo(() => {
    const required = [
      "first_name",
      "last_name",
      "phone",
      "document_type",
      "document_number",
      "country",
      "department",
      "city",
      "birth_date",
      "gender",
      "marital_status",
    ];

    const filled = required.filter((key) => {
      const v = form[key];
      return typeof v === "string" ? v.trim() : !!v;
    }).length;

    return Math.round((filled / required.length) * 100);
  }, [form]);

  function onDocumentTypeChange(value) {
    setForm((prev) => ({
      ...prev,
      document_type: value,
      document_number:
        value === "DNI"
          ? String(prev.document_number || "").replace(/\D/g, "")
          : prev.document_number,
    }));
  }

  function onChange(e) {
    const { name, value } = e.target;

    if (name === "phone") {
      return setForm((prev) => ({
        ...prev,
        phone: value.replace(/\D/g, ""),
      }));
    }

    if (name === "document_number" && form.document_type === "DNI") {
      return setForm((prev) => ({
        ...prev,
        document_number: value.replace(/\D/g, ""),
      }));
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validateForm() {
    if (!form.first_name.trim()) throw new Error("Nombres es obligatorio.");
    if (!form.last_name.trim()) throw new Error("Apellidos es obligatorio.");

    if (!form.phone || form.phone.length !== 9) {
      throw new Error("El teléfono debe tener 9 dígitos.");
    }

    if (!form.document_type) {
      throw new Error("Tipo de documento es obligatorio.");
    }

    if (!form.document_number.trim()) {
      throw new Error("Número de documento es obligatorio.");
    }

    if (form.document_type === "DNI" && form.document_number.length !== 8) {
      throw new Error("El DNI debe tener 8 dígitos.");
    }

    if (!form.country.trim()) throw new Error("País es obligatorio.");
    if (!form.department.trim()) {
      throw new Error("Departamento/Estado es obligatorio.");
    }
    if (!form.city.trim()) throw new Error("Ciudad es obligatorio.");
    if (!form.birth_date) throw new Error("Fecha de nacimiento es obligatoria.");
    if (!form.gender) throw new Error("Género es obligatorio.");
    if (!form.marital_status) throw new Error("Estado civil es obligatorio.");
  }

  async function onSubmit(e) {
    e.preventDefault();

    try {
      setError("");
      setSaving(true);

      validateForm();

      const payload = buildProfilePayload({
        ...form,
        academic_items: [],
        work_items: [],
      });

      await apiFetch("/auth/me/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const updatedUser = await refreshMe();

      if (updatedUser?.role === "CANDIDATE" && updatedUser?.profile_complete === true) {
        nav("/mi-perfil", { replace: true });
        return;
      }

      nav("/mi-perfil", { replace: true });
    } catch (e2) {
      setError(e2.message || "No se pudo guardar el perfil.");
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  if (!isCandidate) {
    nav("/empleos", { replace: true });
    return null;
  }

  if (loading) {
    return (
      <div className="hx-complete-page">
        <div className="hx-complete-shell">
          <div className="hx-complete-card text-center py-5">Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <section className="hx-complete-page">
      <div className="hx-complete-shell">
        <div className="hx-complete-card">
          <div className="hx-complete-header">
            <div>
              <p className="hx-complete-step">Paso 1 de 1</p>
              <h1 className="hx-complete-title">Completa tu perfil para empezar</h1>
              <p className="hx-complete-subtitle">
                Ingresa tus datos personales obligatorios para continuar en la plataforma.
              </p>
            </div>

            <div className="hx-complete-progressbox">
              <span>{progress}% completado</span>
              <div className="hx-complete-progressbar">
                <div
                  className="hx-complete-progressvalue"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger rounded-4 mb-4" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit}>
            <div className="hx-personal-grid">
              <div className="hx-personal-field hx-col-6">
                <label className="hx-personal-label">Nombres *</label>
                <input
                  className="hx-personal-input"
                  name="first_name"
                  value={form.first_name || ""}
                  onChange={onChange}
                />
              </div>

              <div className="hx-personal-field hx-col-6">
                <label className="hx-personal-label">Apellidos *</label>
                <input
                  className="hx-personal-input"
                  name="last_name"
                  value={form.last_name || ""}
                  onChange={onChange}
                />
              </div>

              <div className="hx-personal-field hx-col-6">
                <label className="hx-personal-label">Teléfono *</label>
                <input
                  className="hx-personal-input"
                  name="phone"
                  value={form.phone || ""}
                  onChange={onChange}
                  maxLength={9}
                  inputMode="numeric"
                />
              </div>

              <div className="hx-personal-field hx-col-3">
                <label className="hx-personal-label">Tipo documento *</label>
                <select
                  className="hx-personal-input hx-personal-select"
                  name="document_type"
                  value={form.document_type || ""}
                  onChange={(e) => onDocumentTypeChange(e.target.value)}
                >
                  {DOC_TYPES.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="hx-personal-field hx-col-3">
                <label className="hx-personal-label">N° documento *</label>
                <input
                  className="hx-personal-input"
                  name="document_number"
                  value={form.document_number || ""}
                  onChange={onChange}
                  maxLength={20}
                />
              </div>

              <div className="hx-personal-field hx-col-6">
                <label className="hx-personal-label">País *</label>
                <input
                  className="hx-personal-input"
                  name="country"
                  value={form.country || ""}
                  onChange={onChange}
                />
              </div>

              <div className="hx-personal-field hx-col-6">
                <label className="hx-personal-label">Departamento/Estado *</label>
                <input
                  className="hx-personal-input"
                  name="department"
                  value={form.department || ""}
                  onChange={onChange}
                />
              </div>

              <div className="hx-personal-field hx-col-6">
                <label className="hx-personal-label">Ciudad *</label>
                <input
                  className="hx-personal-input"
                  name="city"
                  value={form.city || ""}
                  onChange={onChange}
                />
              </div>

              <div className="hx-personal-field hx-col-6">
                <label className="hx-personal-label">Fecha de nacimiento *</label>
                <input
                  type="date"
                  className="hx-personal-input hx-personal-date"
                  name="birth_date"
                  value={form.birth_date || ""}
                  onChange={onChange}
                />
              </div>

              <div className="hx-personal-field hx-col-6">
                <label className="hx-personal-label">Género *</label>
                <select
                  className="hx-personal-input hx-personal-select"
                  name="gender"
                  value={form.gender || ""}
                  onChange={onChange}
                >
                  {GENDERS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="hx-personal-field hx-col-6">
                <label className="hx-personal-label">Estado civil *</label>
                <select
                  className="hx-personal-input hx-personal-select"
                  name="marital_status"
                  value={form.marital_status || ""}
                  onChange={onChange}
                >
                  {MARITAL.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="hx-complete-footer">
              <button
                type="submit"
                className="hx-personal-btn-save"
                disabled={saving}
              >
                {saving ? "Guardando..." : "Continuar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}