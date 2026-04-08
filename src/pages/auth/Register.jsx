import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./auth.css";

export default function Register() {
  const nav = useNavigate();
  const { register } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);

      const u = await register(email, password);

      if (!u) return nav("/empleos");

      if (u.role === "CANDIDATE" && u.profile_complete === false) {
        return nav("/mi-perfil");
      }

      return nav("/empleos");
    } catch (e2) {
      setError(e2.message || "No se pudo crear la cuenta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="hx-auth-page">
      <div className="hx-auth-shell">
        <div className="hx-auth-card">
          <div className="hx-auth-card__header">
            <h1 className="hx-auth-title">Crear cuenta</h1>
          </div>

          {error && (
            <div className="alert alert-danger hx-auth-alert" role="alert">
              {error}
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
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
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
                  placeholder="Crea una contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <button className="hx-auth-submit" type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear cuenta"}
            </button>

            <div className="hx-auth-footertext">
              ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}