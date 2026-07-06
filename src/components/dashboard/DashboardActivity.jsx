export default function DashboardActivity() {
  const items = [
    {
      icon: "bi-briefcase",
      title: "Nueva vacante creada",
      description: "Aún no hay actividad real conectada.",
      time: "Ahora",
    },
    {
      icon: "bi-people",
      title: "Candidatos registrados",
      description: "Aquí aparecerán los últimos movimientos.",
      time: "Hoy",
    },
    {
      icon: "bi-envelope",
      title: "Invitaciones RRHH",
      description: "Pendiente conectar con datos reales.",
      time: "Reciente",
    },
  ];

  return (
    <section className="hx-dashboard-panel">
      <div className="hx-dashboard-panel__header">
        <div>
          <h2>Actividad reciente</h2>
          <p>Últimos movimientos importantes del panel.</p>
        </div>
      </div>

      <div className="hx-dashboard-activity">
        {items.map((item, index) => (
          <div key={index} className="hx-dashboard-activity__item">
            <div className="hx-dashboard-activity__icon">
              <i className={`bi ${item.icon}`}></i>
            </div>

            <div>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
            </div>

            <span>{item.time}</span>
          </div>
        ))}
      </div>
    </section>
  );
}