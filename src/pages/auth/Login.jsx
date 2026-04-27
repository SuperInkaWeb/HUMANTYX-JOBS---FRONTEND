import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./auth.css";

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();
  const { login } = useAuth();

  const flashMessage = loc.state?.flashMessage || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [errorType, setErrorType] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();

    try {
      setError("");
      setErrorType("");
      setLoading(true);

      const u = await login(email, password);

      if (!u) return nav("/empleos");

      if (u.role === "CANDIDATE" && u.profile_complete === false) {
        return nav("/completar-perfil");
      }

      return nav("/empleos");
    } catch (e2) {
      const errorCode = e2?.code || e2?.data?.code;
      const errorStatus = e2?.status;
      const errorMessage = e2?.message || "";

      if (
        errorCode === "USER_DISABLED" ||
        (errorStatus === 403 &&
          errorMessage.toLowerCase().includes("deshabilitada"))
      ) {
        setErrorType("disabled");
        setError("Tu cuenta está deshabilitada.");
      } else {
        setErrorType("default");
        setError(errorMessage || "No se pudo iniciar sesión");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleEmailChange(e) {
    setEmail(e.target.value);
    if (error) {
      setError("");
      setErrorType("");
    }
  }

  function handlePasswordChange(e) {
    setPassword(e.target.value);
    if (error) {
      setError("");
      setErrorType("");
    }
  }

  return (
    <section className="hx-auth-page">
      <div className="container">
        <div className="hx-auth-shell">
          <div className="hx-auth-card">
            <div className="hx-auth-card__header">
              <h1 className="hx-auth-title">Iniciar sesión</h1>
            </div>

            {flashMessage && (
              <div
                className="hx-auth-alert-custom hx-auth-alert-custom--warning"
                role="alert"
              >
                <i className="bi bi-info-circle-fill"></i>
                <span>{flashMessage}</span>
              </div>
            )}

            {error && (
              <div
                className={`hx-auth-alert-custom ${
                  errorType === "disabled"
                    ? "hx-auth-alert-custom--warning"
                    : "hx-auth-alert-custom--error"
                }`}
                role="alert"
              >
                <i
                  className={`bi ${
                    errorType === "disabled"
                      ? "bi-shield-lock-fill"
                      : "bi-exclamation-circle-fill"
                  }`}
                ></i>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={onSubmit} className="hx-auth-form">
              <div className="hx-auth-field">
                <label className="hx-auth-label">Email</label>
                <div className="hx-auth-inputwrap">
                  <i className="bi bi-envelope hx-auth-icon"></i>
                  <input
                    type="email"
                    className="hx-auth-input"
                    placeholder="Ingresa tu correo"
                    value={email}
                    onChange={handleEmailChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="hx-auth-field">
                <label className="hx-auth-label">Contraseña</label>
                <div className="hx-auth-inputwrap">
                  <i className="bi bi-lock hx-auth-icon"></i>
                  <input
                    type="password"
                    className="hx-auth-input"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={handlePasswordChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="hx-auth-forgot">
                <Link to="/forgot-password" className="hx-auth-forgot__link">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <button className="hx-auth-submit" type="submit" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </button>

              <div className="hx-auth-footertext">
                ¿No tienes cuenta? <Link to="/register">Crear cuenta</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}