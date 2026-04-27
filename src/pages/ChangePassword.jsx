import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import "./change-password.css";

export default function ChangePassword() {
  const nav = useNavigate();
  const { logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => {
      setError("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [error]);

  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  async function onSubmit(e) {
    e.preventDefault();

    try {
      setError("");
      setSuccessMessage("");

      if (!currentPassword || !newPassword || !confirmPassword) {
        setError("Todos los campos son obligatorios.");
        return;
      }

      if (newPassword.length < 8) {
        setError("La nueva contraseña debe tener al menos 8 caracteres.");
        return;
      }

      if (newPassword !== confirmPassword) {
        setError("La confirmación de contraseña no coincide.");
        return;
      }

      setLoading(true);

      const data = await apiFetch("/auth/change-password", {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      setSuccessMessage(
        data?.message || "Contraseña actualizada correctamente."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        logout();
        nav("/login", {
          replace: true,
          state: {
            flashMessage:
              "Tu contraseña fue actualizada correctamente. Inicia sesión nuevamente.",
          },
        });
      }, 1500);
    } catch (err) {
      setError(err.message || "No se pudo cambiar la contraseña.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="hcp-page">
      <div className="container hcp-container">
        <div className="hcp-shell">
          <div className="hcp-card">
            <div className="hcp-card__header">
              <h1 className="hcp-title">Cambiar contraseña</h1>
              <p className="hcp-subtitle">
                Actualiza tu contraseña para mantener segura tu cuenta.
              </p>
            </div>

            {error && (
              <div className="hcp-alert hcp-alert--error" role="alert">
                <i className="bi bi-exclamation-circle-fill"></i>
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="hcp-alert hcp-alert--success" role="alert">
                <i className="bi bi-check-circle-fill"></i>
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={onSubmit} className="hcp-form">
              <div className="hcp-field">
                <label className="hcp-label">Contraseña actual</label>
                <div className="hcp-inputwrap">
                  <i className="bi bi-lock hcp-icon"></i>

                  <input
                    type={showCurrent ? "text" : "password"}
                    className="hcp-input"
                    placeholder="Ingresa tu contraseña actual"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="hcp-eye"
                    onClick={() => setShowCurrent((v) => !v)}
                  >
                    <i
                      className={`bi ${
                        showCurrent ? "bi-eye-slash" : "bi-eye"
                      }`}
                    ></i>
                  </button>
                </div>
              </div>

              <div className="hcp-field">
                <label className="hcp-label">Nueva contraseña</label>
                <div className="hcp-inputwrap">
                  <i className="bi bi-shield-lock hcp-icon"></i>

                  <input
                    type={showNew ? "text" : "password"}
                    className="hcp-input"
                    placeholder="Ingresa tu nueva contraseña"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="hcp-eye"
                    onClick={() => setShowNew((v) => !v)}
                  >
                    <i
                      className={`bi ${
                        showNew ? "bi-eye-slash" : "bi-eye"
                      }`}
                    ></i>
                  </button>
                </div>
              </div>

              <div className="hcp-field">
                <label className="hcp-label">Confirmar nueva contraseña</label>
                <div className="hcp-inputwrap">
                  <i className="bi bi-shield-check hcp-icon"></i>

                  <input
                    type={showConfirm ? "text" : "password"}
                    className="hcp-input"
                    placeholder="Confirma tu nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="hcp-eye"
                    onClick={() => setShowConfirm((v) => !v)}
                  >
                    <i
                      className={`bi ${
                        showConfirm ? "bi-eye-slash" : "bi-eye"
                      }`}
                    ></i>
                  </button>
                </div>
              </div>

              <button className="hcp-submit" type="submit" disabled={loading}>
                {loading ? "Actualizando..." : "Actualizar contraseña"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}