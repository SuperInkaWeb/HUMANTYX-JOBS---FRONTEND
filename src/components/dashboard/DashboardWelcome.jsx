import "./dashboard.css";

const PANEL_NAMES = {
  ADMIN: "Panel Admin",
  RRHH: "Panel RRHH",
  SUPER_ADMIN: "Panel Plataforma",
};

function getGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Buenos días";
  }

  if (hour >= 12 && hour < 19) {
    return "Buenas tardes";
  }

  return "Buenas noches";
}

export default function DashboardWelcome({ user }) {
  const firstName =
    user?.first_name ||
    user?.firstName ||
    user?.name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "Usuario";

  const panelName = PANEL_NAMES[user?.role] || "Panel";
  const greeting = getGreeting();

  return (
    <section className="hx-dashboard-welcome">
      <div>
        <span className="hx-dashboard-welcome__eyebrow">
          {panelName}
        </span>

        <h1>
          {greeting}, {firstName} 👋
        </h1>

        <p>
          Aquí tienes un resumen de la actividad reciente en Humantyx Jobs.
        </p>
      </div>
    </section>
  );
}