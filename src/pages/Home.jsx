import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="container py-5">
      <h1 className="fw-bold">Encuentra tu próximo empleo</h1>
      <p className="text-muted">Busca vacantes publicadas y postula en minutos.</p>
      <Link to="/empleos" className="btn btn-dark rounded-pill px-4">
        Buscar empleos
      </Link>
    </div>
  );
}
