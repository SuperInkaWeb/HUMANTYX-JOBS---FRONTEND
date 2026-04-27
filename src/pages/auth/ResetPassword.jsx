import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../../services/api";
import "./reset-password.css";

export default function ResetPassword() {
  const nav = useNavigate();
  const loc = useLocation();

  const params = new URLSearchParams(loc.search);
  const token = params.get("token") || "";
  const email = params.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenMessage, setTokenMessage] = useState("");

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(""), 3000);
    return () => clearTimeout(timer);
  }, [error]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    async function validateToken() {
      try {
        setValidatingToken(true);
        setTokenMessage("");

        if (!token) {
          setTokenValid(false);
          setTokenMessage("Este enlace ya no se puede usar.");
          return;
        }

        const data = await apiFetch(
          `/auth/reset-password/validate?token=${encodeURIComponent(token)}`
        );

        if (data?.valid) {
          setTokenValid(true);
          setTokenMessage("");
        } else {
          setTokenValid(false);
          setTokenMessage(data?.message || "Este enlace ya no se puede usar.");
        }
      } catch (err) {
        setTokenValid(false);
        setTokenMessage(err.message || "Este enlace ya no se puede usar.");
      } finally {
        setValidatingToken(false);
      }
    }

    validateToken();
  }, [token]);

  async function onSubmit(e) {
    e.preventDefault();

    try {
      setError("");
      setSuccessMessage("");

      if (!token) {
        setError("El enlace de recuperación no es válido.");
        return;
      }

      if (!password || !confirmPassword) {
        setError("Todos los campos son obligatorios.");
        return;
      }

      if (password.length < 8) {
        setError("La nueva contraseña debe tener al menos 8 caracteres.");
        return;
      }

      if (password !== confirmPassword) {
        setError("La confirmación de contraseña no coincide.");
        return;
      }

      setLoading(true);

      const data = await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          token,
          password,
        }),
      });

      setSuccessMessage(
        data?.message || "Contraseña restablecida correctamente."
      );

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        nav("/login", {
          replace: true,
          state: {
            flashMessage: email
              ? `La contraseña de ${email} fue restablecida correctamente. Inicia sesión.`
              : "Tu contraseña fue restablecida correctamente. Inicia sesión.",
          },
        });
      }, 1500);
    } catch (err) {
      setError(err.message || "No se pudo restablecer la contraseña.");
    } finally {
      setLoading(false);
    }
  }

  if (validatingToken) {
    return (
      <section className="hrp-page">
        <div className="container hrp-container">
          <div className="hrp-shell">
            <div className="hrp-card hrp-card--state">
              <div className="hrp-state">
                <i className="bi bi-hourglass-split hrp-state__icon"></i>
                <h1 className="hrp-title">Validando enlace</h1>
                <p className="hrp-subtitle">
                  Estamos verificando si tu enlace de recuperación sigue disponible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!tokenValid) {
    return (
      <section className="hrp-page">
        <div className="container hrp-container">
          <div className="hrp-shell">
            <div className="hrp-card hrp-card--state">
              <div className="hrp-state">
                <i className="bi bi-x-circle-fill hrp-state__icon hrp-state__icon--error"></i>
                <h1 className="hrp-title">Este enlace ya no se puede usar</h1>
                <p className="hrp-subtitle">
                  {tokenMessage ||
                    "El enlace de recuperación ha expirado o ya fue utilizado."}
                </p>

                <div className="hrp-state__actions">
                  <Link to="/forgot-password" className="hrp-submit hrp-submit--link">
                    Solicitar nuevo enlace
                  </Link>
                  <Link to="/login" className="hrp-secondary-link">
                    Volver al inicio de sesión
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="hrp-page">
      <div className="container hrp-container">
        <div className="hrp-shell">
          <div className="hrp-card">
            <div className="hrp-card__header">
              <h1 className="hrp-title">Restablecer contraseña</h1>
              <p className="hrp-subtitle">
                Ingresa tu nueva contraseña para completar la recuperación.
              </p>
            </div>

            {error && (
              <div className="hrp-alert hrp-alert--error" role="alert">
                <i className="bi bi-exclamation-circle-fill"></i>
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="hrp-alert hrp-alert--success" role="alert">
                <i className="bi bi-check-circle-fill"></i>
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={onSubmit} className="hrp-form">
              <div className="hrp-field">
                <label className="hrp-label">Nueva contraseña</label>
                <div className="hrp-inputwrap">
                  <i className="bi bi-shield-lock hrp-icon"></i>

                  <input
                    type={showPassword ? "text" : "password"}
                    className="hrp-input"
                    placeholder="Ingresa tu nueva contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="hrp-eye"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                  </button>
                </div>
              </div>

              <div className="hrp-field">
                <label className="hrp-label">Confirmar nueva contraseña</label>
                <div className="hrp-inputwrap">
                  <i className="bi bi-shield-check hrp-icon"></i>

                  <input
                    type={showConfirm ? "text" : "password"}
                    className="hrp-input"
                    placeholder="Confirma tu nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="hrp-eye"
                    onClick={() => setShowConfirm((v) => !v)}
                  >
                    <i className={`bi ${showConfirm ? "bi-eye-slash" : "bi-eye"}`}></i>
                  </button>
                </div>
              </div>

              <button className="hrp-submit" type="submit" disabled={loading}>
                {loading ? "Actualizando..." : "Restablecer contraseña"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}