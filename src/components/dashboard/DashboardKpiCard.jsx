export default function DashboardKpiCard({ icon, label, value, subtitle }) {
  return (
    <article className="hx-dashboard-kpi">
      <div className="hx-dashboard-kpi__icon">
        <i className={`bi ${icon}`}></i>
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <p>{subtitle}</p>
      </div>
    </article>
  );
}