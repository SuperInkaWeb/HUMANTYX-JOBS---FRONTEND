export default function DashboardRecentJobs() {
  const jobs = [
    {
      title: "Vacantes recientes",
      description: "Aquí aparecerán las últimas vacantes creadas.",
      status: "Pendiente de conectar",
    },
    {
      title: "Procesos activos",
      description: "Resumen rápido de procesos publicados.",
      status: "Próximamente",
    },
  ];

  return (
    <section className="hx-dashboard-panel">
      <div className="hx-dashboard-panel__header">
        <div>
          <h2>Vacantes recientes</h2>
          <p>Últimos procesos creados por el equipo RRHH.</p>
        </div>
      </div>

      <div className="hx-dashboard-recent-jobs">
        {jobs.map((job, index) => (
          <div key={index} className="hx-dashboard-recent-job">
            <div>
              <strong>{job.title}</strong>
              <p>{job.description}</p>
            </div>

            <span>{job.status}</span>
          </div>
        ))}
      </div>
    </section>
  );
}