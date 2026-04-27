import { formatEmploymentType } from "../../utils/jobs";

export default function JobInfoList({ selectedJob }) {
  const cards = [
    {
      key: "salary",
      label: "Sueldo",
      value: selectedJob.salary_range,
      icon: "bi-cash-stack",
    },
    {
      key: "employment",
      label: "Tipo de puesto",
      value: formatEmploymentType(selectedJob.employment_type),
      icon: "bi-briefcase-fill",
    },
    {
      key: "location",
      label: "Ubicación",
      value: selectedJob.location,
      icon: "bi-geo-alt-fill",
    },
  ].filter((item) => item.value);

  if (!cards.length) return null;

  return (
    <div className="job-info-grid">
      {cards.map((item) => (
        <div key={item.key} className="job-info-card">
          <div className="job-info-card__icon">
            <i className={`bi ${item.icon}`}></i>
          </div>

          <div className="job-info-card__text">
            <div className="job-info-card__label">{item.label}</div>
            <div className="job-info-card__value">{item.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}