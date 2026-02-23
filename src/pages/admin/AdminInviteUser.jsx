import { useState } from "react";
import { apiFetch } from "../../services/api";

export default function AdminInviteUser() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("RRHH");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setMsg("");
    setInviteUrl("");

    if (!email.trim()) return setError("Email requerido.");

    try {
      setLoading(true);

      const data = await apiFetch("/admin/users/invite", {
        method: "POST",
        body: JSON.stringify({ email, role }),
      });

      setMsg("✅ Invitación creada.");
      setInviteUrl(data.invite_url || "");
    } catch (e2) {
      setError(e2.message);
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setMsg("✅ Link copiado al portapapeles.");
  }

  return (
    <div className="container py-4" style={{ maxWidth: 720 }}>
      <div className="mb-3">
        <h2 className="fw-bold mb-1">Invitar usuario</h2>
       
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {msg && <div className="alert alert-success">{msg}</div>}

      <form onSubmit={onSubmit} className="card">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-8">
              <label className="form-label">Email</label>
              <input
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rrhh@empresa.com"
                disabled={loading}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Rol</label>
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
              >
                <option value="RRHH">RRHH</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
          </div>

          <div className="mt-4 d-flex gap-2">
            <button className="btn btn-dark rounded-pill px-4" disabled={loading}>
              {loading ? "Creando..." : "Crear invitación"}
            </button>
          </div>

          {inviteUrl && (
            <div className="mt-4 p-3 border rounded-3 bg-light">
              <div className="fw-semibold mb-2">Link de activación</div>
              <div className="small text-muted mb-2" style={{ wordBreak: "break-all" }}>
                {inviteUrl}
              </div>
              <button type="button" className="btn btn-outline-primary btn-sm rounded-pill px-3" onClick={copyLink}>
                Copiar link
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
