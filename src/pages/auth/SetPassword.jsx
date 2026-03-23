import { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch, validateInvite } from "../../services/api";
import "./auth.css";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function SetPassword() {
  const q = useQuery();
  const nav = useNavigate();

  const token = q.get("token") || "";
  const email = q.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingInvite, setLoadingInvite] = useState(true);

  const [inviteError, setInviteError] = useState(null);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function checkInvite() {
      if (!token || !email) {
        setInviteError("INVITE_INVALID");
        setLoadingInvite(false);
        return;
      }

      try {
        await validateInvite(token, email);
        setInviteError(null);
      } catch (err) {
        setInviteError(err.error || "INVITE_INVALID");
      } finally {
        setLoadingInvite(false);
      }
    }

    checkInvite();
  }, [token, email]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setMsg("");

    if (!token || !email) {
      setError("Link inválido. Falta token o email.");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener mínimo 8 caracteres.");
      return;
    }

    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setLoading(true);

      await apiFetch("/auth/set-password", {
        method: "POST",
        body: JSON.stringify({ token, email, password }),
      });

      setMsg("Cuenta activada. Ya puedes iniciar sesión.");
      setTimeout(() => nav("/login"), 1000);
    } catch (e2) {
      setError(e2.message || "Error activando cuenta");
    } finally {
      setLoading(false);
    }
  }

  const inviteErrorText =
    inviteError === "INVITE_USED"
      ? "Esta invitación ya fue usada."
      : inviteError === "INVITE_EXPIRED"
      ? "Esta invitación ha expirado."
      : "La invitación no es válida.";

  return (
    <section className="hx-auth-page">
      <div className="container">
        <div className="hx-auth-shell">
          <div className="hx-auth-card">
            <div className="hx-auth-card__header">
              <h1 className="hx-auth-title">Activar cuenta</h1>
            </div>

            {loadingInvite && (
              <div className="alert alert-info hx-auth-alert" role="alert">
                Validando invitación...
              </div>
            )}

            {!loadingInvite && inviteError && (
              <div className="alert alert-danger hx-auth-alert" role="alert">
                {inviteErrorText}
                <div className="mt-3">
                  <button
                    type="button"
                    className="hx-auth-submit"
                    onClick={() => nav("/login")}
                  >
                    Ir a iniciar sesión
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="alert alert-danger hx-auth-alert" role="alert">
                {error}
              </div>
            )}

            {msg && (
              <div className="alert alert-success hx-auth-alert" role="alert">
                {msg}
              </div>
            )}

            {!inviteError && !loadingInvite && (
              <form onSubmit={onSubmit} className="hx-auth-form">
                <div className="hx-auth-field">
                  <label className="hx-auth-label">Email</label>
                  <div className="hx-auth-inputwrap">
                    <i className="bi bi-envelope hx-auth-icon"></i>
                    <input
                      type="email"
                      className="hx-auth-input"
                      value={email}
                      disabled
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
                      placeholder="Mínimo 8 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="hx-auth-field">
                  <label className="hx-auth-label">Confirmar contraseña</label>
                  <div className="hx-auth-inputwrap">
                    <i className="bi bi-shield-lock hx-auth-icon"></i>
                    <input
                      type="password"
                      className="hx-auth-input"
                      placeholder="Repite tu contraseña"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  className="hx-auth-submit"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Activando..." : "Activar cuenta"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}