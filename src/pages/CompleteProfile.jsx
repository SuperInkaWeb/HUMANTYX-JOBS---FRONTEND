import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { apiFetch } from "../services/api";

import {
  DOC_TYPES,
  COUNTRIES,
  GENDERS,
  MARITAL,
  mapProfileFromApi,
  buildProfilePayload,
} from "../utils/profileHelpers";

import { getCountryRule } from "../utils/countryRules";

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

const NUMERIC_DOCUMENT_TYPES = ["EC_CI", "PE_DNI"];

function normalizeCountryCode(countryValue) {
  if (!countryValue) return "";

  const normalizedValue = String(countryValue).trim();

  const countryByCode = COUNTRIES.find(
    (country) =>
      String(country.value).toUpperCase() === normalizedValue.toUpperCase()
  );

  if (countryByCode) {
    return countryByCode.value;
  }

  const countryByLabel = COUNTRIES.find(
    (country) =>
      country.label?.toLowerCase() === normalizedValue.toLowerCase()
  );

  return countryByLabel?.value || "";
}

function normalizeDocumentType(documentType, countryCode) {
  if (!documentType) {
    return getCountryRule(countryCode).defaultDocumentType || "";
  }

  if (documentType !== "DNI") {
    return documentType;
  }

  if (countryCode === "EC") {
    return "EC_CI";
  }

  if (countryCode === "PE") {
    return "PE_DNI";
  }

  return "OTHER";
}

function getFlagUrl(countryCode) {
  if (!countryCode || countryCode.length !== 2) return "";

  return `https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`;
}

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { user, refreshMe } = useAuth();

  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isCandidate = (user?.role || "").toUpperCase() === "CANDIDATE";

  const selectedCountry = useMemo(() => {
    return (
      COUNTRIES.find((country) => country.value === form.country) || null
    );
  }, [form.country]);

  const countryRule = useMemo(() => {
    return getCountryRule(form.country);
  }, [form.country]);

  const phonePrefix = selectedCountry?.callingCode || "";
  const countryFlagUrl = getFlagUrl(form.country);

  const phoneMinLength = Number(countryRule.phoneMinLength) || 6;
  const phoneMaxLength = Math.min(
    Number(countryRule.phoneMaxLength) || 15,
    15
  );

  const documentMaxLength = useMemo(() => {
    if (form.document_type === "EC_CI") return 10;
    if (form.document_type === "PE_DNI") return 8;
    if (form.document_type === "PASSPORT") return 20;

    return 30;
  }, [form.document_type]);

  const documentHelp = useMemo(() => {
    if (!form.country) {
      return "Selecciona primero el país.";
    }

    if (!form.document_type) {
      return "Selecciona el tipo de documento.";
    }

    if (
      form.document_type === countryRule.defaultDocumentType &&
      countryRule.documentExample
    ) {
      return `Ejemplo: ${countryRule.documentExample}`;
    }

    if (form.document_type === "PASSPORT") {
      return "Ingresa entre 6 y 20 letras o números.";
    }

    if (form.document_type === "CE") {
      return "Ingresa entre 3 y 30 letras o números.";
    }

    return "Ingresa entre 3 y 30 caracteres.";
  }, [form.country, form.document_type, countryRule]);

  const progress = useMemo(() => {
    const requiredFields = [
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

    const completedFields = requiredFields.filter((field) => {
      const value = form[field];

      return typeof value === "string"
        ? Boolean(value.trim())
        : Boolean(value);
    }).length;

    return Math.round(
      (completedFields / requiredFields.length) * 100
    );
  }, [form]);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setError("");
      setLoading(true);

      const response = await apiFetch("/auth/me");
      const apiUser = response?.user || {};
      const mappedProfile = mapProfileFromApi(apiUser);

      const normalizedCountry = normalizeCountryCode(
        mappedProfile.country
      );

      const normalizedDocumentType = normalizeDocumentType(
        mappedProfile.document_type,
        normalizedCountry
      );

      setForm((previousForm) => ({
        ...previousForm,
        ...mappedProfile,
        country: normalizedCountry,
        document_type: normalizedDocumentType,
        phone: String(mappedProfile.phone || "").replace(/\D/g, ""),
        academic_items: [],
        work_items: [],
      }));
    } catch (requestError) {
      setError(
        requestError.message || "No se pudo cargar el perfil."
      );
    } finally {
      setLoading(false);
    }
  }

  function onDocumentTypeChange(value) {
    setError("");

    setForm((previousForm) => {
      const numericDocument =
        NUMERIC_DOCUMENT_TYPES.includes(value);

      let nextDocumentNumber =
        previousForm.document_number || "";

      if (numericDocument) {
        const maximumLength = value === "EC_CI" ? 10 : 8;

        nextDocumentNumber = String(nextDocumentNumber)
          .replace(/\D/g, "")
          .slice(0, maximumLength);
      } else {
        nextDocumentNumber = String(nextDocumentNumber).slice(
          0,
          value === "PASSPORT" ? 20 : 30
        );
      }

      return {
        ...previousForm,
        document_type: value,
        document_number: nextDocumentNumber,
      };
    });
  }

  function onChange(event) {
    const { name, value } = event.target;

    setError("");

    if (name === "country") {
      const nextCountryRule = getCountryRule(value);

      return setForm((previousForm) => ({
        ...previousForm,
        country: value,
        document_type:
          nextCountryRule.defaultDocumentType || "",
        document_number: "",
        phone: "",
      }));
    }

    if (name === "phone") {
      const numericPhone = value
        .replace(/\D/g, "")
        .slice(0, phoneMaxLength);

      return setForm((previousForm) => ({
        ...previousForm,
        phone: numericPhone,
      }));
    }

    if (
      name === "document_number" &&
      NUMERIC_DOCUMENT_TYPES.includes(form.document_type)
    ) {
      const maximumLength =
        form.document_type === "EC_CI" ? 10 : 8;

      return setForm((previousForm) => ({
        ...previousForm,
        document_number: value
          .replace(/\D/g, "")
          .slice(0, maximumLength),
      }));
    }

    if (name === "document_number") {
      return setForm((previousForm) => ({
        ...previousForm,
        document_number: value.slice(
          0,
          documentMaxLength
        ),
      }));
    }

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  }

  function validateDocument() {
    const documentNumber = form.document_number.trim();

    if (
      form.document_type === countryRule.defaultDocumentType &&
      countryRule.documentRegex
    ) {
      if (!countryRule.documentRegex.test(documentNumber)) {
        throw new Error(countryRule.documentMessage);
      }

      return;
    }

    if (form.document_type === "PASSPORT") {
      if (!/^[A-Za-z0-9./-]{6,20}$/.test(documentNumber)) {
        throw new Error(
          "El pasaporte debe tener entre 6 y 20 letras o números."
        );
      }

      return;
    }

    if (!/^[A-Za-z0-9À-ÿ./ -]{3,30}$/.test(documentNumber)) {
      throw new Error(
        "El número de documento debe tener entre 3 y 30 caracteres válidos."
      );
    }
  }

  function validateForm() {
    if (!form.first_name.trim()) {
      throw new Error("Nombres es obligatorio.");
    }

    if (!form.last_name.trim()) {
      throw new Error("Apellidos es obligatorio.");
    }

    if (!form.country.trim()) {
      throw new Error("País es obligatorio.");
    }

    if (
      !/^\d+$/.test(form.phone) ||
      form.phone.length < phoneMinLength ||
      form.phone.length > phoneMaxLength
    ) {
      if (phoneMinLength === phoneMaxLength) {
        throw new Error(
          `El teléfono debe tener ${phoneMinLength} dígitos.`
        );
      }

      throw new Error(
        `El teléfono debe tener entre ${phoneMinLength} y ${phoneMaxLength} dígitos.`
      );
    }

    if (!form.document_type) {
      throw new Error("Tipo de documento es obligatorio.");
    }

    if (!form.document_number.trim()) {
      throw new Error("Número de documento es obligatorio.");
    }

    validateDocument();

    if (!form.department.trim()) {
      throw new Error(
        "Departamento/Estado es obligatorio."
      );
    }

    if (!form.city.trim()) {
      throw new Error("Ciudad es obligatorio.");
    }

    if (!form.birth_date) {
      throw new Error(
        "Fecha de nacimiento es obligatoria."
      );
    }

    if (!form.gender) {
      throw new Error("Género es obligatorio.");
    }

    if (!form.marital_status) {
      throw new Error("Estado civil es obligatorio.");
    }
  }

  async function onSubmit(event) {
    event.preventDefault();

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

      await refreshMe();

      navigate("/mi-perfil", {
        replace: true,
      });
    } catch (submitError) {
      setError(
        submitError.message ||
          "No se pudo guardar el perfil."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return null;
  }

  if (!isCandidate) {
    return <Navigate to="/empleos" replace />;
  }

  if (loading) {
    return (
      <div className="hx-complete-page">
        <div className="hx-complete-shell">
          <div className="hx-complete-card text-center py-5">
            Cargando...
          </div>
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
              <p className="hx-complete-step">
                Paso 1 de 1
              </p>

              <h1 className="hx-complete-title">
                Completa tu perfil para empezar
              </h1>

              <p className="hx-complete-subtitle">
                Ingresa tus datos personales obligatorios
                para continuar en la plataforma.
              </p>
            </div>

            <div className="hx-complete-progressbox">
              <span>{progress}% completado</span>

              <div className="hx-complete-progressbar">
                <div
                  className="hx-complete-progressvalue"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {error && (
            <div
              className="alert alert-danger rounded-4 mb-4"
              role="alert"
            >
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} noValidate>
            <div className="hx-personal-grid">
              <div className="hx-personal-field hx-col-6">
                <label
                  className="hx-personal-label"
                  htmlFor="first_name"
                >
                  Nombres *
                </label>

                <input
                  id="first_name"
                  className="hx-personal-input"
                  name="first_name"
                  value={form.first_name}
                  onChange={onChange}
                  autoComplete="given-name"
                />
              </div>

              <div className="hx-personal-field hx-col-6">
                <label
                  className="hx-personal-label"
                  htmlFor="last_name"
                >
                  Apellidos *
                </label>

                <input
                  id="last_name"
                  className="hx-personal-input"
                  name="last_name"
                  value={form.last_name}
                  onChange={onChange}
                  autoComplete="family-name"
                />
              </div>

              <div className="hx-personal-field hx-col-6">
                <label
                  className="hx-personal-label"
                  htmlFor="country"
                >
                  País *
                </label>

                <div className="hx-country-field">
                  <div
                    className="hx-country-flag"
                    aria-hidden="true"
                  >
                    {countryFlagUrl ? (
                      <img
                        src={countryFlagUrl}
                        alt=""
                        className="hx-country-flag-image"
                      />
                    ) : (
                      <i className="bi bi-globe2"></i>
                    )}
                  </div>

                  <select
                    id="country"
                    className="hx-personal-input hx-personal-select hx-country-select"
                    name="country"
                    value={form.country}
                    onChange={onChange}
                    autoComplete="country"
                  >
                    {COUNTRIES.map((country) => (
                      <option
                        key={country.value}
                        value={country.value}
                      >
                        {country.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>


              <div className="hx-personal-field hx-col-6">
                <label
                  className="hx-personal-label"
                  htmlFor="phone"
                >
                  Teléfono *
                </label>

                <div className="hx-phone-field">
                  <div
                    className="hx-phone-prefix"
                    aria-label={`Prefijo telefónico ${
                      phonePrefix || "sin seleccionar"
                    }`}
                  >
                    {countryFlagUrl ? (
                      <img
                        src={countryFlagUrl}
                        alt=""
                        className="hx-country-flag-image"
                      />
                    ) : (
                      <i className="bi bi-globe2"></i>
                    )}

                    <span>{phonePrefix || "+—"}</span>
                  </div>

                  <input
                    id="phone"
                    className="hx-personal-input hx-phone-input"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={onChange}
                    maxLength={phoneMaxLength}
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="Número telefónico"
                    disabled={!form.country}
                  />
                </div>

                <small className="hx-personal-help">
                  {form.country
                    ? `Número local sin el prefijo ${phonePrefix}.`
                    : "Selecciona primero el país."}
                </small>
              </div>

              <div className="hx-personal-field hx-col-3">
                <label
                  className="hx-personal-label"
                  htmlFor="document_type"
                >
                  Tipo documento *
                </label>

                <select
                  id="document_type"
                  className="hx-personal-input hx-personal-select"
                  name="document_type"
                  value={form.document_type}
                  onChange={(event) =>
                    onDocumentTypeChange(
                      event.target.value
                    )
                  }
                  disabled={!form.country}
                >
                  {DOC_TYPES.map((documentType) => (
                    <option
                      key={documentType.value}
                      value={documentType.value}
                    >
                      {documentType.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="hx-personal-field hx-col-3">
                <label
                  className="hx-personal-label"
                  htmlFor="document_number"
                >
                  N.º documento *
                </label>

                <input
                  id="document_number"
                  className="hx-personal-input"
                  name="document_number"
                  value={form.document_number}
                  onChange={onChange}
                  maxLength={documentMaxLength}
                  inputMode={
                    NUMERIC_DOCUMENT_TYPES.includes(
                      form.document_type
                    )
                      ? "numeric"
                      : "text"
                  }
                  disabled={!form.document_type}
                />

                <small className="hx-personal-help">
                  {documentHelp}
                </small>
              </div>

              <div className="hx-personal-field hx-col-6">
                <label
                  className="hx-personal-label"
                  htmlFor="department"
                >
                  Departamento/Estado *
                </label>

                <input
                  id="department"
                  className="hx-personal-input"
                  name="department"
                  value={form.department}
                  onChange={onChange}
                  autoComplete="address-level1"
                />
              </div>

              <div className="hx-personal-field hx-col-6">
                <label
                  className="hx-personal-label"
                  htmlFor="city"
                >
                  Ciudad *
                </label>

                <input
                  id="city"
                  className="hx-personal-input"
                  name="city"
                  value={form.city}
                  onChange={onChange}
                  autoComplete="address-level2"
                />
              </div>

              <div className="hx-personal-field hx-col-6">
                <label
                  className="hx-personal-label"
                  htmlFor="birth_date"
                >
                  Fecha de nacimiento *
                </label>

                <input
                  id="birth_date"
                  type="date"
                  className="hx-personal-input hx-personal-date"
                  name="birth_date"
                  value={form.birth_date}
                  onChange={onChange}
                />
              </div>

              <div className="hx-personal-field hx-col-6">
                <label
                  className="hx-personal-label"
                  htmlFor="gender"
                >
                  Género *
                </label>

                <select
                  id="gender"
                  className="hx-personal-input hx-personal-select"
                  name="gender"
                  value={form.gender}
                  onChange={onChange}
                >
                  {GENDERS.map((gender) => (
                    <option
                      key={gender.value}
                      value={gender.value}
                    >
                      {gender.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="hx-personal-field hx-col-6">
                <label
                  className="hx-personal-label"
                  htmlFor="marital_status"
                >
                  Estado civil *
                </label>

                <select
                  id="marital_status"
                  className="hx-personal-input hx-personal-select"
                  name="marital_status"
                  value={form.marital_status}
                  onChange={onChange}
                >
                  {MARITAL.map((maritalStatus) => (
                    <option
                      key={maritalStatus.value}
                      value={maritalStatus.value}
                    >
                      {maritalStatus.label}
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
                {saving
                  ? "Guardando..."
                  : "Continuar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}