import { useState } from "react";
import { apiFetch } from "../../services/api";
import "./admin-invite-user.css";

export default function AdminInviteUser() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setInviteUrl("");

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError("Debes ingresar un correo electrónico.");
      return;
    }

    if (!role) {
      setError("Debes seleccionar un rol.");
      return;
    }

    try {
      setLoading(true);

      const data = await apiFetch("/admin/users/invite", {
        method: "POST",
        body: JSON.stringify({
          email: cleanEmail,
          role,
        }),
      });

      if (data?.mail_sent) {
        setSuccess("Invitación enviada correctamente al correo del usuario.");
      } else {
        setSuccess(
          "La invitación fue creada, pero el correo no pudo enviarse automáticamente."
        );
      }

      if (data?.invite_url) {
        setInviteUrl(data.invite_url);
      }

      setEmail("");
      setRole("");
    } catch (err) {
      setError(err.message || "No se pudo enviar la invitación.");
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setEmail("");
    setRole("");
    setError("");
    setSuccess("");
    setInviteUrl("");
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setSuccess("Enlace de invitación copiado al portapapeles.");
    } catch {
      setError("No se pudo copiar el enlace.");
    }
  }

  return (
    <div className="invite-page">
      <div className="invite-page__header">
        <h1>Invitar usuario</h1>
        <p>
          Añade nuevos miembros a tu equipo de reclutamiento para colaborar en
          procesos de selección.
        </p>
      </div>

      <form className="invite-card" onSubmit={handleSubmit}>
        <div className="invite-card__top">
          <div className="invite-card__icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="5" width="18" height="14" rx="2"></rect>
              <polyline points="3 7 12 13 21 7"></polyline>
            </svg>
          </div>

          <div className="invite-card__heading">
            <h2>Detalles de la invitación</h2>
            <p>
              Completa los campos a continuación para enviar una invitación
              formal.
            </p>
          </div>
        </div>

        <div className="invite-card__divider"></div>

        <div className="invite-card__body">
          <div className="invite-form-grid">
            <div className="invite-field">
              <label>Correo electrónico</label>

              <input
                type="email"
                placeholder="ejemplo@humantyx.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />

              <small>
                El usuario recibirá un enlace para activar su cuenta.
              </small>
            </div>

            <div className="invite-field">
              <label>Rol asignado</label>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
              >
                <option value="">Seleccionar rol</option>
                <option value="ADMIN">ADMIN</option>
                <option value="RRHH">RRHH</option>
              </select>

              <small>
                Define qué acciones podrá realizar en la plataforma.
              </small>
            </div>
          </div>

          {error && (
            <div
              style={{
                marginTop: "16px",
                padding: "14px 16px",
                borderRadius: "14px",
                background: "#fff1f2",
                color: "#b42318",
                fontSize: "0.95rem",
                fontWeight: 500,
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                marginTop: "16px",
                padding: "14px 16px",
                borderRadius: "14px",
                background: "#ecfdf3",
                color: "#027a48",
                fontSize: "0.95rem",
                fontWeight: 500,
              }}
            >
              {success}
            </div>
          )}

          {inviteUrl && (
            <div
              style={{
                marginTop: "16px",
                padding: "16px",
                borderRadius: "14px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  fontSize: "0.92rem",
                  fontWeight: 600,
                  marginBottom: "8px",
                }}
              >
                Enlace de activación
              </div>

              <div
                style={{
                  wordBreak: "break-all",
                  fontSize: "0.9rem",
                  color: "#475467",
                  marginBottom: "12px",
                }}
              >
                {inviteUrl}
              </div>

              <button
                type="button"
                onClick={handleCopyLink}
                className="invite-actions__cancel"
              >
                Copiar enlace
              </button>
            </div>
          )}

          <div className="invite-info-box">
            <span className="invite-info-box__icon">i</span>

            <p>
              Como administrador, podrás revocar el acceso o cambiar los
              permisos de este usuario en cualquier momento desde la
              configuración del equipo.
            </p>
          </div>

          <div className="invite-actions">
            <button
              type="button"
              className="invite-actions__cancel"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="invite-actions__submit"
              disabled={loading}
            >
              <span className="invite-btn-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M4 4l16 8-16 8 4-8-4-8z" />
                </svg>
              </span>

              {loading ? "Enviando..." : "Enviar invitación"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}