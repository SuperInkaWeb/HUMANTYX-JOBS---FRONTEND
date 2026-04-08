import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../../services/api";
import {
  DOC_TYPES,
  GENDERS,
  MARITAL,
  EDUCATION,
  ACADEMIC_STATUS,
  AVAILABILITY,
  mapProfileFromApi,
  isAcademicItemEmpty,
  isWorkItemEmpty,
  formatDate,
  formatYears,
} from "../../utils/profileHelpers";
import "../my-profile.css";
import "./admin-candidate-profile.css";

function getLabel(options, value, fallback = "No especificado") {
  if (value === null || value === undefined || value === "") return fallback;
  return options.find((item) => item.value === value)?.label || value || fallback;
}

function formatMonthYear(dateValue) {
  if (!dateValue) return "Actualidad";

  try {
    return new Intl.DateTimeFormat("es-PE", {
      month: "short",
      year: "numeric",
    }).format(new Date(dateValue));
  } catch {
    return dateValue;
  }
}

function formatYear(dateValue) {
  if (!dateValue) return "Actualidad";

  try {
    return new Intl.DateTimeFormat("es-PE", {
      year: "numeric",
    }).format(new Date(dateValue));
  } catch {
    return dateValue;
  }
}

function getInitials(firstName, lastName, email) {
  const a = firstName?.trim()?.[0] || "";
  const b = lastName?.trim()?.[0] || "";
  const initials = `${a}${b}`.toUpperCase();

  if (initials) return initials;
  return (email?.[0] || "U").toUpperCase();
}

export default function AdminCandidateProfile() {
  const { candidateId, jobId } = useParams();

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [downloadingCv, setDownloadingCv] = useState(false);
  const [cvError, setCvError] = useState("");
  const fileName = candidate?.cv_file_name || "CV.pdf";

  const cvFileName =
  candidate?.cv_original_name ||
  candidate?.cv_filename ||
  candidate?.cv_file_name ||
  "";

const hasCv = Boolean(cvFileName);


  function getSafeFileNameFromHeaders(contentDisposition, fallbackName = "cv.pdf") {
  if (!contentDisposition) return fallbackName;

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]).replace(/["]/g, "");
  }

  const normalMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
  if (normalMatch?.[1]) {
    return normalMatch[1];
  }

  return fallbackName;
}

async function handleDownloadCv() {
  if (!hasCv) {
  setCvError("Este postulante no tiene CV registrado.");
  return;
}
  
    try {
    setCvError("");
    setDownloadingCv(true);

    const token = localStorage.getItem("token") || "";
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000";

    const response = await fetch(`${apiBase}/admin/candidates/${candidateId}/cv`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      let message = "No se pudo descargar el CV.";

      if (contentType.includes("application/json")) {
        const data = await response.json();
        message = data?.message || message;
      } else {
        const text = await response.text();
        if (text) message = text;
      }

      throw new Error(message);
    }

    const blob = await response.blob();
    const fileName = getSafeFileNameFromHeaders(
      response.headers.get("content-disposition"),
      "cv.pdf"
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (e) {
    setCvError(e.message || "No se pudo descargar el CV.");
  } finally {
    setDownloadingCv(false);
  }
}

  useEffect(() => {
    let mounted = true;

    async function loadCandidate() {
      try {
        setLoading(true);
        setError("");

        const data = await apiFetch(`/admin/candidates/${candidateId}`);
        if (!mounted) return;

        setCandidate(data?.candidate || null);
        console.log("candidate detail:", data?.candidate || data);
      } catch (e) {
        if (!mounted) return;
        setError(e.message || "No se pudo cargar el perfil del candidato.");
        setCandidate(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadCandidate();

    return () => {
      mounted = false;
    };
  }, [candidateId]);

  const form = useMemo(() => {
    return candidate ? mapProfileFromApi(candidate) : null;
  }, [candidate]);

  const fullName = useMemo(() => {
    if (!candidate) return "Perfil de candidato";
    const name = `${candidate.first_name || ""} ${candidate.last_name || ""}`.trim();
    return name || "Perfil pendiente";
  }, [candidate]);

  const avatarText = useMemo(() => {
    return getInitials(candidate?.first_name, candidate?.last_name, candidate?.email);
  }, [candidate]);

  const availabilityLabel = useMemo(() => {
    return getLabel(AVAILABILITY, form?.availability);
  }, [form]);

  const documentLabel = useMemo(() => {
    const typeLabel = getLabel(DOC_TYPES, form?.document_type, "");
    const number = form?.document_number?.trim() || "";

    if (!typeLabel && !number) return "No especificado";
    if (!typeLabel) return number;
    if (!number) return typeLabel;

    return `${typeLabel} · ${number}`;
  }, [form]);

  const genderLabel = useMemo(() => {
    return getLabel(GENDERS, form?.gender);
  }, [form]);

  const maritalLabel = useMemo(() => {
    return getLabel(MARITAL, form?.marital_status);
  }, [form]);

  const visibleAcademicItems = useMemo(() => {
    return (form?.academic_items || []).filter((item) => !isAcademicItemEmpty(item));
  }, [form]);

  const visibleWorkItems = useMemo(() => {
    return (form?.work_items || []).filter((item) => !isWorkItemEmpty(item));
  }, [form]);

  const locationText = useMemo(() => {
    return [form?.city, form?.department, form?.country]
      .filter((v) => typeof v === "string" && v.trim())
      .join(", ");
  }, [form]);

  const hasProfessionalInfo = useMemo(() => {
    return !!(
      form?.headline?.trim() ||
      form?.about?.trim() ||
      form?.experience_years !== "" ||
      form?.availability
    );
  }, [form]);

  const checklist = useMemo(() => {
    const personalComplete = !!(
      form?.first_name?.trim() &&
      form?.last_name?.trim() &&
      form?.phone?.trim() &&
      form?.document_type &&
      form?.document_number?.trim() &&
      form?.country?.trim() &&
      form?.department?.trim() &&
      form?.city?.trim()
    );

    const professionalComplete = !!(
      form?.headline?.trim() &&
      form?.about?.trim() &&
      (form?.experience_years !== "" && form?.experience_years !== null) &&
      form?.availability
    );

    const academicComplete = visibleAcademicItems.length > 0;
    const workComplete = visibleWorkItems.length > 0;

    return [
      { label: "Información personal", done: personalComplete },
      { label: "Información profesional", done: professionalComplete },
      { label: "Información académica", done: academicComplete },
      { label: "Experiencia laboral", done: workComplete },
    ];
  }, [form, visibleAcademicItems, visibleWorkItems]);

  const totalProfileProgress = useMemo(() => {
    const done = checklist.filter((item) => item.done).length;
    return Math.round((done / checklist.length) * 100);
  }, [checklist]);

  const backTo = jobId
    ? `/rrhh/vacantes/${jobId}/postulantes`
    : "/rrhh/candidatos";

  const backLabel = jobId ? "Volver" : "Volver a candidatos";

  if (loading) {
    return (
      <div className="hcp-page">
        <div className="hx-profile-shell-card text-center py-5">
          Cargando perfil del candidato...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hcp-page">
        <div className="hcp-topbar">
          <div>
            <p className="hcp-eyebrow">Panel interno</p>
            <h1 className="hcp-title">Perfil del postulante</h1>
          </div>

          <div className="hcp-actions">
            <Link to={backTo} className="hja-btn hja-btn--ghost">
              <i className="bi bi-arrow-left"></i>
              <span>{backLabel}</span>
            </Link>
          </div>
        </div>

        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!candidate || !form) {
    return (
      <div className="hcp-page">
        <div className="hcp-topbar">
          <div>
            <p className="hcp-eyebrow">Panel interno</p>
            <h1 className="hcp-title">Perfil del postulante</h1>
          </div>

          <div className="hcp-actions">
            <Link to={backTo} className="hja-btn hja-btn--ghost">
              <i className="bi bi-arrow-left"></i>
              <span>{backLabel}</span>
            </Link>
          </div>
        </div>

        <div className="hx-profile-shell-card text-center py-5">
          No se encontró información del candidato.
        </div>
      </div>
    );
  }

  function formatBytes(bytes) {
  if (!bytes) return "";

  const kb = bytes / 1024;

  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

  return (
    <div className="hcp-page hx-profile-v2">
      <div className="hcp-topbar">

        <div className="hcp-actions">
          <Link to={backTo} className="hja-btn hja-btn--ghost">
            <i className="bi bi-arrow-left"></i>
            <span>{backLabel}</span>
          </Link>
        </div>
      </div>

      <div className="hx-profile-layout">
        <div className="hx-profile-main">
          <section className="hx-profile-topbar">
            <div className="hx-profile-hero-copy">
              <h1 className="hx-profile-v2-name">{fullName}</h1>
              <p className="hx-headline">
                {form.headline?.trim() ? form.headline : "Titular profesional no especificado"}
              </p>
            </div>
          </section>

          <section className="hx-section-shell">
            <div className="hx-section-top-row">
              <h2 className="hx-section-main-title">Información Personal</h2>
            </div>

            <div className="hx-profile-shell-card">
              <div className="hx-profile-contact-grid">
                <div className="hx-profile-contact-item">
                  <div className="hx-profile-contact-icon">
                    <i className="bi bi-person-fill"></i>
                  </div>
                  <div>
                    <strong>NOMBRE COMPLETO</strong>
                    <span>{fullName}</span>
                  </div>
                </div>

                <div className="hx-profile-contact-item">
                  <div className="hx-profile-contact-icon">
                    <i className="bi bi-envelope-fill"></i>
                  </div>
                  <div>
                    <strong>EMAIL</strong>
                    <span>{candidate.email || "No especificado"}</span>
                  </div>
                </div>

                <div className="hx-profile-contact-item">
                  <div className="hx-profile-contact-icon">
                    <i className="bi bi-telephone-fill"></i>
                  </div>
                  <div>
                    <strong>TELÉFONO</strong>
                    <span>{form.phone || "No especificado"}</span>
                  </div>
                </div>

                <div className="hx-profile-contact-item">
                  <div className="hx-profile-contact-icon">
                    <i className="bi bi-card-text"></i>
                  </div>
                  <div>
                    <strong>DOCUMENTO</strong>
                    <span>{documentLabel}</span>
                  </div>
                </div>

                <div className="hx-profile-contact-item">
                  <div className="hx-profile-contact-icon">
                    <i className="bi bi-geo-alt-fill"></i>
                  </div>
                  <div>
                    <strong>UBICACIÓN</strong>
                    <span>{locationText || "No especificada"}</span>
                  </div>
                </div>

                <div className="hx-profile-contact-item">
                  <div className="hx-profile-contact-icon">
                    <i className="bi bi-calendar-event-fill"></i>
                  </div>
                  <div>
                    <strong>FECHA DE NACIMIENTO</strong>
                    <span>{form.birth_date ? formatDate(form.birth_date) : "No especificada"}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="hx-section-shell">
            <div className="hx-section-top-row">
              <h2 className="hx-section-main-title">Información Profesional</h2>
            </div>

            {!hasProfessionalInfo ? (
              <div className="hx-section-empty-state">
                <p className="hx-section-empty-text">
                  El candidato aún no ha agregado información profesional.
                </p>
              </div>
            ) : (
              <article className="hx-section-record-wrap">
                <div className="hx-section-record-head">
                  <div className="hx-section-record-main">
                    <div className="hx-section-record-icon">
                      <i className="bi bi-briefcase-fill"></i>
                    </div>

                    <div>
                      <h3 className="hx-section-record-title">
                        {form.headline || "Titular profesional"}
                      </h3>

                      <p className="hx-section-record-subtitle">
                        {form.experience_years !== "" && form.experience_years !== null
                          ? formatYears(form.experience_years)
                          : "Experiencia no especificada"}
                      </p>

                      <div className="hx-section-record-meta">
                        <span>
                          <i className="bi bi-clock-fill"></i>
                          {availabilityLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="hx-section-record-description">
                  {form.about?.trim()
                    ? form.about
                    : "El candidato aún no ha agregado una descripción profesional."}
                </p>
              </article>
            )}
          </section>

          <section className="hx-section-shell">
            <div className="hx-section-top-row">
              <h2 className="hx-section-main-title">Información Académica</h2>
            </div>

            {visibleAcademicItems.length === 0 ? (
              <div className="hx-section-empty-state">
                <p className="hx-section-empty-text">
                  El candidato aún no ha agregado información académica.
                </p>
              </div>
            ) : (
              <div className="hx-section-record-list">
                {visibleAcademicItems.map((item) => (
                  <article key={item.id} className="hx-section-record-wrap">
                    <div className="hx-section-record-head">
                      <div className="hx-section-record-main">
                        <div className="hx-section-record-icon">
                          <i className="bi bi-mortarboard-fill"></i>
                        </div>

                        <div>
                          <h3 className="hx-section-record-title">
                            {item.institution || "Institución educativa"}
                          </h3>

                          <p className="hx-section-record-subtitle">
                            {item.career || "Carrera o especialidad"}
                          </p>

                          <div className="hx-section-record-meta">
                            <span>
                              <i className="bi bi-book-fill"></i>
                              {getLabel(EDUCATION, item.education_level)}
                            </span>

                            <span>
                              <i className="bi bi-patch-check-fill"></i>
                              {getLabel(ACADEMIC_STATUS, item.academic_status)}
                            </span>

                            <span>
                              <i className="bi bi-calendar3"></i>
                              {formatYear(item.start_date)} - {formatYear(item.end_date)}
                            </span>

                            <span>
                              <i className="bi bi-geo-alt-fill"></i>
                              {item.location || "Ubicación no especificada"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="hx-section-shell">
            <div className="hx-section-top-row">
              <h2 className="hx-section-main-title">Experiencia Laboral</h2>
            </div>

            {visibleWorkItems.length === 0 ? (
              <div className="hx-section-empty-state">
                <p className="hx-section-empty-text">
                  El candidato aún no ha agregado experiencia laboral.
                </p>
              </div>
            ) : (
              <div className="hx-section-record-list">
                {visibleWorkItems.map((item) => (
                  <article key={item.id} className="hx-section-record-wrap">
                    <div className="hx-section-record-head">
                      <div className="hx-section-record-main">
                        <div className="hx-section-record-icon">
                          <i className="bi bi-briefcase-fill"></i>
                        </div>

                        <div>
                          <h3 className="hx-section-record-title">
                            {item.position || "Cargo"}
                          </h3>

                          <p className="hx-section-record-subtitle">
                            {item.company || "Empresa"}
                          </p>

                          <div className="hx-section-record-meta">
                            <span>
                              <i className="bi bi-geo-alt-fill"></i>
                              {item.location || "Ubicación no especificada"}
                            </span>

                            <span>
                              <i className="bi bi-calendar3"></i>
                              {formatMonthYear(item.start_date)} - {formatMonthYear(item.end_date)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="hx-section-record-description">
                      {item.description || "Sin descripción"}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="hx-profile-side">
          <section className="hx-profile-shell-card hx-profile-side-top">
            <div className="hx-profile-avatar-lg">{avatarText}</div>

            <h3 className="hx-profile-side-name">{fullName}</h3>
            <p className="hx-profile-side-headline">
              {form.headline?.trim() || "Titular pendiente"}
            </p>

            <div className="hx-profile-side-progress-row">
              <span className="hx-profile-side-progress-label">Perfil visible</span>
              <strong className="hx-profile-side-progress-value">{totalProfileProgress}%</strong>
            </div>

            <div className="hx-progress-track hx-progress-track--small">
              <div
                className="hx-progress-bar"
                style={{
                  width: `${totalProfileProgress}%`,
                }}
              />
            </div>

            <div className="hx-profile-checklist">
              {checklist.map((item) => (
                <div key={item.label} className="hx-profile-check-item">
                  <i
                    className={`bi ${
                      item.done ? "bi-check-circle-fill is-done" : "bi-circle"
                    }`}
                  ></i>
                  <span className={item.done ? "is-complete" : "is-pending"}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </section>

         <section className="hx-profile-shell-card hcp-side-card hcp-cv-card">
            {hasCv ? (
                <div className="hcp-cv-card__content">
                <div className="hcp-cv-card__left">
                    <div className="hcp-cv-card__icon">
                    <i className="bi bi-file-earmark-text"></i>
                    <span className="hcp-cv-card__badge">PDF</span>
                    </div>
                </div>

                <div className="hcp-cv-card__right">
                    <h4 className="hcp-cv-card__filename">{cvFileName}</h4>
                    
                    <button
                    type="button"
                    className="hcp-cv-card__btn"
                    onClick={handleDownloadCv}
                    disabled={downloadingCv}
                    >
                    <i className={`bi ${downloadingCv ? "bi-hourglass-split" : "bi-download"}`}></i>
                    <span>{downloadingCv ? "Descargando..." : "Descargar CV"}</span>
                    </button>

                    {candidate.cv_size_bytes && (
                      <small className="hcp-cv-card__size">
                        Size: {formatBytes(candidate.cv_size_bytes)}
                      </small>
                    )}

                    {cvError && <small className="hcp-cv-card__error">{cvError}</small>}
                </div>
                </div>
            ) : (
                <div className="hcp-cv-card__empty">
                <div className="hcp-cv-card__icon hcp-cv-card__icon--empty">
                    <i className="bi bi-file-earmark-x"></i>
                </div>

                <div className="hcp-cv-card__right">
                    <h4 className="hcp-cv-card__filename hcp-cv-card__filename--empty">
                    Sin CV registrado
                    </h4>

                    <p className="hcp-cv-card__empty-text">
                    Este postulante aún no ha subido su currículum.
                    </p>
                </div>
                </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}