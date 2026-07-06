import "./dashboard.css";

export default function DashboardWelcome({ user }) {
  const firstName =
    user?.first_name ||
    user?.firstName ||
    user?.name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "Usuario";

  return (
    <section className="hx-dashboard-welcome">
      <div>
        <span className="hx-dashboard-welcome__eyebrow">
          Panel Admin
        </span>

        <h1>Buenos días, {firstName} 👋</h1>

        <p>
          Aquí tienes un resumen de la actividad reciente en Humantyx Jobs.
        </p>
      </div>
    </section>
  );
}