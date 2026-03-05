import { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch, validateInvite } from "../../services/api";

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

  // 🔎 Validar invitación al abrir la página
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

    if (!token || !email) return setError("Link inválido. Falta token o email.");
    if (password.length < 8) return setError("La contraseña debe tener mínimo 8 caracteres.");
    if (password !== confirm) return setError("Las contraseñas no coinciden.");

    try {
      setLoading(true);

      await apiFetch("/auth/set-password", {
        method: "POST",
        body: JSON.stringify({ token, email, password }),
      });

      setMsg("✅ Cuenta activada. Ya puedes iniciar sesión.");
      setTimeout(() => nav("/login"), 1000);

    } catch (e2) {
      setError(e2.message || "Error activando cuenta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 520 }}>
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Activar cuenta</h2>
        <div className="text-muted">Define tu contraseña para acceder al panel.</div>
      </div>

      {/* ⏳ Validando invitación */}
      {loadingInvite && (
        <div className="alert alert-info">Validando invitación...</div>
      )}

      {/* ❌ Invitación inválida/usada/expirada */}
      {!loadingInvite && inviteError && (
        <div className="alert alert-danger">
          {inviteError === "INVITE_USED" && "Esta invitación ya fue usada."}
          {inviteError === "INVITE_EXPIRED" && "Esta invitación ha expirado."}
          {inviteError === "INVITE_INVALID" && "La invitación no es válida."}

          <div className="mt-3">
            <button
              className="btn btn-dark rounded-pill px-4"
              onClick={() => nav("/login")}
            >
              Ir a iniciar sesión
            </button>
          </div>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}
      {msg && <div className="alert alert-success">{msg}</div>}

      {/* 📝 Formulario */}
      {!inviteError && !loadingInvite && (
        <form onSubmit={onSubmit} className="card">
          <div className="card-body">

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input className="form-control" value={email} disabled />
            </div>

            <div className="mb-3">
              <label className="form-label">Contraseña</label>
              <input
                className="form-control"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                disabled={loading}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Confirmar contraseña</label>
              <input
                className="form-control"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={loading}
              />
            </div>

            <button className="btn btn-dark rounded-pill px-4" disabled={loading}>
              {loading ? "Activando..." : "Activar"}
            </button>

          </div>
        </form>
      )}
    </div>
  );
}