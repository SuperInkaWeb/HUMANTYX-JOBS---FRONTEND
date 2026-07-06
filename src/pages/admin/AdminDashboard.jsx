import { useEffect, useState } from "react";

import { useAuth } from "../../hooks/useAuth";
import { getDashboardSummary } from "../../services/api";

import DashboardWelcome from "../../components/dashboard/DashboardWelcome";
import DashboardKpiCard from "../../components/dashboard/DashboardKpiCard";
import DashboardActivity from "../../components/dashboard/DashboardActivity";
import DashboardRecentJobs from "../../components/dashboard/DashboardRecentJobs";
import DashboardQuickActions from "../../components/dashboard/DashboardQuickActions";

export default function AdminDashboard() {
  const { user } = useAuth();

  const [summary, setSummary] = useState({
    active_jobs: 0,
    candidates: 0,
    applications: 0,
    invites: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  async function loadSummary() {
    try {
      setLoading(true);

      const data = await getDashboardSummary();

      setSummary(
        data?.summary || {
          active_jobs: 0,
          candidates: 0,
          applications: 0,
          invites: 0,
        }
      );
    } catch (err) {
      console.error("Dashboard:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="hx-admin-dashboard">
      <DashboardWelcome user={user} />

      <div className="hx-dashboard-kpis">
        <DashboardKpiCard
          icon="bi-briefcase"
          label="Vacantes activas"
          value={loading ? "..." : summary.active_jobs}
          subtitle="Publicadas actualmente"
        />

        <DashboardKpiCard
          icon="bi-people"
          label="Candidatos"
          value={loading ? "..." : summary.candidates}
          subtitle="Registrados en la plataforma"
        />

        <DashboardKpiCard
          icon="bi-file-earmark-text"
          label="Postulaciones"
          value={loading ? "..." : summary.applications}
          subtitle="Procesos recibidos"
        />

        <DashboardKpiCard
          icon="bi-envelope-paper"
          label="Invitaciones"
          value={loading ? "..." : summary.invites}
          subtitle="Enviadas por RRHH"
        />
      </div>

      <div className="hx-dashboard-grid">
        <DashboardActivity />
        <DashboardRecentJobs />
      </div>

      <DashboardQuickActions />
    </section>
  );
}