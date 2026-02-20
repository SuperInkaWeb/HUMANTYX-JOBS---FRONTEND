import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";
import { useAuth } from "../context/AuthContext";
import CvManager from "../components/CvManager";

export default function MyProfile() {
  const { user } = useAuth();
  const location = useLocation();
  const nav = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    dni: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const bannerMsg = useMemo(() => location.state?.message || "", [location.state]);
  const redirectBackTo = useMemo(() => location.state?.from || "", [location.state]);

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
          dni: u.dni || "",
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

    // UX: forzar solo números para phone/dni
    if (name === "phone" || name === "dni") {
      const onlyDigits = value.replace(/\D/g, "");
      setForm((prev) => ({ ...prev, [name]: onlyDigits }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function isComplete(f) {
    return !!(f.first_name && f.last_name && f.phone && f.dni);
  }

  async function onSave(e) {
    e.preventDefault();

    try {
      setError("");
      setMsg("");
      setSaving(true);

      // validaciones “producto real”
      if (!form.first_name.trim()) throw new Error("Nombres es obligatorio.");
      if (!form.last_name.trim()) throw new Error("Apellidos es obligatorio.");

      if (!form.phone || form.phone.length !== 9) {
        throw new Error("El teléfono debe tener 9 dígitos.");
      }
      if (!form.dni || form.dni.length !== 8) {
        throw new Error("El DNI debe tener 8 dígitos.");
      }

      const data = await apiFetch("/auth/me/profile", {
        method: "PUT",
        body: JSON.stringify({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          phone: form.phone,
          dni: form.dni,
        }),
      });

      const p =
        data?.profile ||
        data?.candidate_profile ||
        data?.candidateProfile ||
        data ||
        null;

      const updated = {
        first_name: p?.first_name ?? form.first_name,
        last_name: p?.last_name ?? form.last_name,
        phone: p?.phone ?? form.phone,
        dni: p?.dni ?? form.dni,
      };

      setForm(updated);

      if (isComplete(updated)) {
        setMsg("✅ Perfil guardado correctamente.");

        // Si venías desde /empleos/:id para postular, vuelve automáticamente
        if (redirectBackTo) {
          nav(redirectBackTo, { replace: true });
        }
      } else {
        setMsg("Perfil guardado, pero aún faltan datos para completar.");
      }
    } catch (e2) {
      setError(e2.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container py-4" style={{ maxWidth: 760 }}>
      <div className="d-flex align-items-end justify-content-between flex-wrap gap-2 mb-3">
        <div>
          <h2 className="fw-bold mb-1">Mi perfil</h2>
          <div className="text-muted small">{user?.email}</div>
        </div>

        <div className="small">
          {isComplete(form) ? (
            <span className="badge text-bg-success">Perfil completo</span>
          ) : (
            <span className="badge text-bg-warning">Perfil incompleto</span>
          )}
        </div>
      </div>

      {bannerMsg && <div className="alert alert-warning">{bannerMsg}</div>}

      {loading && <div>Cargando...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {msg && <div className="alert alert-success">{msg}</div>}

      {!loading && (
        <form onSubmit={onSave} className="card">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Nombres</label>
                <input
                  className="form-control"
                  name="first_name"
                  value={form.first_name}
                  onChange={onChange}
                  placeholder="Ej: Héctor"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Apellidos</label>
                <input
                  className="form-control"
                  name="last_name"
                  value={form.last_name}
                  onChange={onChange}
                  placeholder="Ej: Prada"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Teléfono</label>
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

              <div className="col-md-6">
                <label className="form-label">DNI</label>
                <input
                  className="form-control"
                  name="dni"
                  value={form.dni}
                  onChange={onChange}
                  placeholder="8 dígitos"
                  maxLength={8}
                  inputMode="numeric"
                />
              </div>
            </div>

            <div className="d-flex justify-content-end mt-4">
              <button className="btn btn-dark rounded-pill px-4" disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* CV opcional */}
      <CvManager />
    </div>
  );
}
