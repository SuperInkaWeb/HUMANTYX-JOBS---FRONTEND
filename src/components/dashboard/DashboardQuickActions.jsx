import { Link } from "react-router-dom";

export default function DashboardQuickActions() {
  return (
    <section className="hx-dashboard-panel">
      <div className="hx-dashboard-panel__header">
        <div>
          <h2>Accesos rápidos</h2>
          <p>Acciones frecuentes del equipo RRHH.</p>
        </div>
      </div>

      <div className="hx-dashboard-quick-actions">
        <Link to="/rrhh/vacantes" className="hx-dashboard-quick-action">
          <i className="bi bi-briefcase"></i>
          <span>Gestionar vacantes</span>
        </Link>

        <Link to="/rrhh/vacantes/nueva" className="hx-dashboard-quick-action">
          <i className="bi bi-plus-circle"></i>
          <span>Nueva vacante</span>
        </Link>

        <Link to="/rrhh/candidatos" className="hx-dashboard-quick-action">
          <i className="bi bi-people"></i>
          <span>Ver candidatos</span>
        </Link>

        <Link to="/rrhh/invitar" className="hx-dashboard-quick-action">
          <i className="bi bi-person-plus"></i>
          <span>Invitar usuario</span>
        </Link>
      </div>
    </section>
  );
}