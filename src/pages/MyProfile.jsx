import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";
import { useAuth } from "../context/AuthContext";
import CvManager from "../components/CvManager";

const DOC_TYPES = [
  { value: "", label: "Seleccionar..." },
  { value: "DNI", label: "DNI" },
  { value: "PASSPORT", label: "Pasaporte" },
  { value: "CE", label: "Carné de extranjería" },
];

const GENDERS = [
  { value: "", label: "Seleccionar..." },
  { value: "MALE", label: "Masculino" },
  { value: "FEMALE", label: "Femenino" },
  { value: "OTHER", label: "Otro" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefiero no decirlo" },
];

const MARITAL = [
  { value: "", label: "Seleccionar..." },
  { value: "SINGLE", label: "Soltero/a" },
  { value: "MARRIED", label: "Casado/a" },
  { value: "DIVORCED", label: "Divorciado/a" },
  { value: "WIDOWED", label: "Viudo/a" },
];

const EDUCATION = [
  { value: "", label: "Seleccionar..." },
  { value: "SECONDARY", label: "Secundaria" },
  { value: "TECHNICAL", label: "Técnico" },
  { value: "UNIVERSITY", label: "Universitario" },
  { value: "POSTGRAD", label: "Postgrado" },
];

const AVAILABILITY = [
  { value: "", label: "Seleccionar..." },
  { value: "IMMEDIATE", label: "Inmediata" },
  { value: "TWO_WEEKS", label: "En 2 semanas" },
  { value: "ONE_MONTH", label: "En 1 mes" },
];

export default function MyProfile() {
  const { user, refreshMe } = useAuth(); // 👈 usamos refreshMe
  const location = useLocation();
  const nav = useNavigate();

  const [form, setForm] = useState({
    // obligatorios (según tu backend)
    first_name: "",
    last_name: "",
    phone: "",
    document_type: "",
    document_number: "",
    country: "",
    department: "",
    city: "",

    // opcionales
    birth_date: "",
    gender: "",
    marital_status: "",
    headline: "",
    about: "",
    education_level: "",
    experience_years: "",
    availability: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const bannerMsg = useMemo(() => location.state?.message || "", [location.state]);
  const redirectBackTo = useMemo(() => location.state?.from || "", [location.state]);

  const requiredKeys = useMemo(
    () => [
      "first_name",
      "last_name",
      "phone",
      "document_type",
      "document_number",
      "country",
      "department",
      "city",
    ],
    []
  );

  const requiredProgress = useMemo(() => {
    const filled = requiredKeys.filter((k) => {
      const v = form[k];
      return typeof v === "string" ? v.trim() : !!v;
    }).length;

    const total = requiredKeys.length;
    const pct = Math.round((filled / total) * 100);

    return { filled, total, pct };
  }, [form, requiredKeys]);

  const profileCompleteUI = requiredProgress.filled === requiredProgress.total;

  // Cargar datos actuales
  useEffect(() => {
    (async () => {
      try {
        setError("");
        setMsg("");
        setLoading(true);

        const me = await apiFetch("/auth/me");
        const u = me?.user || {};

        setForm({
          first_name: u.first_name || "",
          last_name: u.last_name || "",
          phone: u.phone || "",
          document_type: u.document_type || "",
          document_number: u.document_number || "",
          country: u.country || "",
          department: u.department || "",
          city: u.city || "",

          birth_date: u.birth_date ? String(u.birth_date).slice(0, 10) : "",
          gender: u.gender || "",
          marital_status: u.marital_status || "",
          headline: u.headline || "",
          about: u.about || "",
          education_level: u.education_level || "",
          experience_years: u.experience_years ?? "",
          availability: u.availability || "",
        });
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function onChange(e) {
    const { name, value } = e.target;

    // Solo dígitos para teléfono
    if (name === "phone") {
      const onlyDigits = value.replace(/\D/g, "");
      setForm((prev) => ({ ...prev, [name]: onlyDigits }));
      return;
    }

    // document_number: si es DNI, solo dígitos (para pasaporte/CE permitimos alfanumérico)
    if (name === "document_number") {
      if (form.document_type === "DNI") {
        const onlyDigits = value.replace(/\D/g, "");
        setForm((prev) => ({ ...prev, [name]: onlyDigits }));
        return;
      }
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validateRequired() {
    if (!form.first_name.trim()) throw new Error("Nombres es obligatorio.");
    if (!form.last_name.trim()) throw new Error("Apellidos es obligatorio.");

    if (!form.phone || form.phone.length !== 9) {
      throw new Error("El teléfono debe tener 9 dígitos.");
    }

    if (!form.document_type) throw new Error("Tipo de documento es obligatorio.");
    if (!form.document_number.trim()) throw new Error("Número de documento es obligatorio.");

    if (form.document_type === "DNI" && form.document_number.length !== 8) {
      throw new Error("El DNI debe tener 8 dígitos.");
    }

    if (!form.country.trim()) throw new Error("País es obligatorio.");
    if (!form.department.trim()) throw new Error("Departamento/Estado es obligatorio.");
    if (!form.city.trim()) throw new Error("Ciudad es obligatorio.");
  }

  async function onSave(e) {
    e.preventDefault();

    try {
      setError("");
      setMsg("");
      setSaving(true);

      validateRequired();

      const payload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone,

        document_type: form.document_type,
        document_number: form.document_number.trim(),

        country: form.country.trim(),
        department: form.department.trim(),
        city: form.city.trim(),

        // opcionales
        birth_date: form.birth_date || null,
        gender: form.gender || null,
        marital_status: form.marital_status || null,
        headline: form.headline?.trim() || null,
        about: form.about?.trim() || null,
        education_level: form.education_level || null,
        experience_years: form.experience_years === "" ? null : Number(form.experience_years),
        availability: form.availability || null,
      };

      const data = await apiFetch("/auth/me/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const p = data?.profile || data || {};

      setForm((prev) => ({
        ...prev,
        first_name: p.first_name ?? prev.first_name,
        last_name: p.last_name ?? prev.last_name,
        phone: p.phone ?? prev.phone,
        document_type: p.document_type ?? prev.document_type,
        document_number: p.document_number ?? prev.document_number,
        country: p.country ?? prev.country,
        department: p.department ?? prev.department,
        city: p.city ?? prev.city,

        birth_date: p.birth_date ? String(p.birth_date).slice(0, 10) : prev.birth_date,
        gender: p.gender ?? prev.gender,
        marital_status: p.marital_status ?? prev.marital_status,
        headline: p.headline ?? prev.headline,
        about: p.about ?? prev.about,
        education_level: p.education_level ?? prev.education_level,
        experience_years: p.experience_years ?? prev.experience_years,
        availability: p.availability ?? prev.availability,
      }));

      // ✅ CLAVE: refrescar /auth/me para actualizar user.profile_complete en el AuthContext
      await refreshMe();

      setMsg("✅ Perfil guardado correctamente.");

      if (redirectBackTo) {
        nav(redirectBackTo, { replace: true });
      }
    } catch (e2) {
      setError(e2.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container py-4" style={{ maxWidth: 920 }}>
      <div className="d-flex align-items-end justify-content-between flex-wrap gap-2 mb-3">
        <div>
          <h2 className="fw-bold mb-1">Mi perfil</h2>
          <div className="text-muted small">{user?.email}</div>
        </div>

        <div className="small">
          {profileCompleteUI ? (
            <span className="badge text-bg-success">Perfil completo</span>
          ) : (
            <span className="badge text-bg-warning">Perfil incompleto</span>
          )}
        </div>
      </div>

      {bannerMsg && <div className="alert alert-warning">{bannerMsg}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {msg && <div className="alert alert-success">{msg}</div>}

      <div className="card mb-3">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="fw-semibold">
              Progreso del perfil: {requiredProgress.filled}/{requiredProgress.total}
            </div>
            <div className="text-muted small">{requiredProgress.pct}%</div>
          </div>

          <div className="progress mt-2" style={{ height: 10 }}>
            <div
              className="progress-bar"
              role="progressbar"
              style={{ width: `${requiredProgress.pct}%` }}
              aria-valuenow={requiredProgress.pct}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>

          {!profileCompleteUI && (
            <div className="text-muted small mt-2">
              Completa los campos obligatorios para poder postular y usar CV.
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div>Cargando...</div>
      ) : (
        <form onSubmit={onSave}>
          <div className="card mb-3">
            <div className="card-header bg-white fw-bold">Datos obligatorios</div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Nombres *</label>
                  <input
                    className="form-control"
                    name="first_name"
                    value={form.first_name}
                    onChange={onChange}
                    placeholder="Ej: Héctor"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Apellidos *</label>
                  <input
                    className="form-control"
                    name="last_name"
                    value={form.last_name}
                    onChange={onChange}
                    placeholder="Ej: Prada"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Teléfono *</label>
                  <input
                    className="form-control"
                    name="phone"
                    value={form.phone}
                    onChange={onChange}
                    placeholder="9 dígitos"
                    maxLength={9}
                    inputMode="numeric"
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Tipo de documento *</label>
                  <select
                    className="form-select"
                    name="document_type"
                    value={form.document_type}
                    onChange={(e) => {
                      const v = e.target.value;
                      setForm((prev) => ({
                        ...prev,
                        document_type: v,
                        document_number:
                          v === "DNI"
                            ? prev.document_number.replace(/\D/g, "")
                            : prev.document_number,
                      }));
                    }}
                  >
                    {DOC_TYPES.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label">N° documento *</label>
                  <input
                    className="form-control"
                    name="document_number"
                    value={form.document_number}
                    onChange={onChange}
                    placeholder={form.document_type === "DNI" ? "8 dígitos" : "Ej: A1234567"}
                    maxLength={20}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">País *</label>
                  <input
                    className="form-control"
                    name="country"
                    value={form.country}
                    onChange={onChange}
                    placeholder="Ej: Perú"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Departamento/Estado *</label>
                  <input
                    className="form-control"
                    name="department"
                    value={form.department}
                    onChange={onChange}
                    placeholder="Ej: Lima"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Ciudad *</label>
                  <input
                    className="form-control"
                    name="city"
                    value={form.city}
                    onChange={onChange}
                    placeholder="Ej: La Victoria"
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end mt-4">
                <button className="btn btn-dark rounded-pill px-4" disabled={saving}>
                  {saving ? "Guardando..." : "Guardar perfil"}
                </button>
              </div>
            </div>
          </div>

          <div className="accordion mb-3" id="profileOptionalAcc">
            <div className="accordion-item">
              <h2 className="accordion-header" id="optHead">
                <button
                  className="accordion-button collapsed fw-bold"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#optCollapse"
                  aria-expanded="false"
                  aria-controls="optCollapse"
                >
                  Datos opcionales (puedes completarlos después)
                </button>
              </h2>
              <div
                id="optCollapse"
                className="accordion-collapse collapse"
                aria-labelledby="optHead"
                data-bs-parent="#profileOptionalAcc"
              >
                <div className="accordion-body">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">Fecha de nacimiento</label>
                      <input
                        type="date"
                        className="form-control"
                        name="birth_date"
                        value={form.birth_date}
                        onChange={onChange}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">Género</label>
                      <select
                        className="form-select"
                        name="gender"
                        value={form.gender}
                        onChange={onChange}
                      >
                        {GENDERS.map((g) => (
                          <option key={g.value} value={g.value}>
                            {g.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">Estado civil</label>
                      <select
                        className="form-select"
                        name="marital_status"
                        value={form.marital_status}
                        onChange={onChange}
                      >
                        {MARITAL.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Titular / Headline</label>
                      <input
                        className="form-control"
                        name="headline"
                        value={form.headline}
                        onChange={onChange}
                        placeholder="Ej: Practicante de Backend Node.js"
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Nivel de estudios</label>
                      <select
                        className="form-select"
                        name="education_level"
                        value={form.education_level}
                        onChange={onChange}
                      >
                        {EDUCATION.map((ed) => (
                          <option key={ed.value} value={ed.value}>
                            {ed.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Años de experiencia</label>
                      <input
                        className="form-control"
                        name="experience_years"
                        value={form.experience_years}
                        onChange={onChange}
                        inputMode="numeric"
                        placeholder="Ej: 0, 1, 2..."
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Disponibilidad</label>
                      <select
                        className="form-select"
                        name="availability"
                        value={form.availability}
                        onChange={onChange}
                      >
                        {AVAILABILITY.map((a) => (
                          <option key={a.value} value={a.value}>
                            {a.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label">Acerca de mí</label>
                      <textarea
                        className="form-control"
                        name="about"
                        value={form.about}
                        onChange={onChange}
                        rows={4}
                        placeholder="Cuéntanos un poco sobre ti..."
                      />
                    </div>

                    <div className="d-flex justify-content-end mt-2">
                      <button className="btn btn-outline-dark rounded-pill px-4" disabled={saving}>
                        {saving ? "Guardando..." : "Guardar opcionales"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      <CvManager />
    </div>
  );
}