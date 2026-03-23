import CvManager from "../CvManager";

export default function ProfileSidebar({
  avatarText,
  fullName,
  headline,
  totalProfileProgress,
  checklist,
}) {
  const pct = totalProfileProgress?.pct ?? 0;

  function getProgressColor() {
    if (pct <= 40) return "#ef4444";
    if (pct <= 80) return "#f59e0b";
    return "#10b981";
  }

  return (
    <aside className="hx-profile-side">
      <section className="hx-profile-shell-card hx-profile-side-top">
        <div className="hx-profile-avatar-lg">{avatarText}</div>

        <h3 className="hx-profile-side-name">{fullName}</h3>
        <p className="hx-profile-side-headline">
          {headline?.trim() || "Titular pendiente"}
        </p>

        <div className="hx-profile-side-progress-row">
          <span className="hx-profile-side-progress-label">Perfil completo</span>
          <strong className="hx-profile-side-progress-value">{pct}%</strong>
        </div>

        <div className="hx-progress-track hx-progress-track--small">
          <div
            className="hx-progress-bar"
            style={{
              width: `${pct}%`,
              backgroundColor: getProgressColor(),
              transition: "width 0.45s ease, background-color 0.35s ease",
            }}
          />
        </div>

        <div className="hx-profile-checklist">
          {checklist.map((item) => (
            <div key={item.label} className="hx-profile-check-item">
              <i
                className={`bi ${
                  item.done ? "bi-check-circle-fill is-done" : "bi-circle"
                }`}
              ></i>
              <span className={item.done ? "is-complete" : "is-pending"}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="hx-profile-shell-card hx-cv-shell">
        <CvManager />
      </section>
    </aside>
  );
}