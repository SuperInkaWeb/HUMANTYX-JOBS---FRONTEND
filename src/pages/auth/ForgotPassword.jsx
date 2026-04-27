import { useEffect, useState } from "react";
import { apiFetch } from "../../services/api";
import "./forgot-password.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(""), 3000);
    return () => clearTimeout(timer);
  }, [error]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(""), 4000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  async function onSubmit(e) {
    e.preventDefault();

    try {
      setError("");
      setSuccessMessage("");

      const cleanEmail = email.trim();

      if (!cleanEmail) {
        setError("Debes ingresar tu correo.");
        return;
      }

      setLoading(true);

      const data = await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: cleanEmail }),
      });

      setSuccessMessage(
        data?.message ||
          "Si el correo existe, te enviaremos instrucciones para restablecer tu contraseña."
      );
      setEmail("");
    } catch (err) {
      setError(err.message || "No se pudo procesar la solicitud.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="hfp-page">
      <div className="container hfp-container">
        <div className="hfp-shell">
          <div className="hfp-card">
            <div className="hfp-card__header">
              <h1 className="hfp-title">Recuperar contraseña</h1>
              <p className="hfp-subtitle">
                Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
                Revisa tu bandeja de entrada o spam.
              </p>
            </div>

            {error && (
              <div className="hfp-alert hfp-alert--error" role="alert">
                <i className="bi bi-exclamation-circle-fill"></i>
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="hfp-alert hfp-alert--success" role="alert">
                <i className="bi bi-check-circle-fill"></i>
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={onSubmit} className="hfp-form">
              <div className="hfp-field">
                <label className="hfp-label">Email</label>
                <div className="hfp-inputwrap">
                  <i className="bi bi-envelope hfp-icon"></i>
                  <input
                    type="email"
                    className="hfp-input"
                    placeholder="Ingresa tu correo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <button className="hfp-submit" type="submit" disabled={loading}>
                {loading ? "Enviando..." : "Enviar enlace"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}