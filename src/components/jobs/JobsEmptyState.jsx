export default function JobsEmptyState() {
  return (
    <div className="jobs-empty">
      <div className="jobs-empty__icon">
        <i className="bi bi-briefcase"></i>
      </div>
      <h5>No encontramos vacantes</h5>
      <p>
        Intenta con otra palabra clave o cambia la ubicación para ver más
        resultados.
      </p>
    </div>
  );
}