import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./home.css";

export default function Home() {
  const nav = useNavigate();

  const [q, setQ] = useState("");
  const [loc, setLoc] = useState("");

  function onSearch(e) {
    e.preventDefault();

    const params = new URLSearchParams();

    if (q.trim()) params.set("q", q.trim());
    if (loc.trim()) params.set("location", loc.trim());

    nav(`/empleos${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <section className="home-hero">
      <div className="container home-hero__container">
        <div className="home-hero__content">
          <h1 className="home-hero__title">
            Encuentra tu próximo empleo con una experiencia{" "}
            <span className="home-accent-2">simple</span> y{" "}
            <span className="home-accent-2">profesional</span>.
          </h1>

          <p className="home-hero__subtitle">
            Busca las mejores oportunidades y postula en minutos. Un portal
            moderno, claro y centrado en el talento.
          </p>

          <form onSubmit={onSearch} className="home-searchbar">
            <div className="home-searchbar-inner">
              <div className="home-field">
                <span className="home-icon" aria-hidden="true">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  type="text"
                  className="home-input"
                  placeholder="Cargo, palabras clave..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>

              <div className="home-divider"></div>

              <div className="home-field">
                <span className="home-icon" aria-hidden="true">
                  <i className="bi bi-geo-alt"></i>
                </span>

                <input
                  type="text"
                  className="home-input"
                  placeholder="Ciudad o región"
                  value={loc}
                  onChange={(e) => setLoc(e.target.value)}
                />
              </div>

              <div className="home-searchbar-action">
                <button type="submit" className="home-cta home-cta--search">
                  Buscar
                </button>
              </div>
            </div>
          </form>

          <div className="home-hero__actions">
            <Link to="/empleos" className="home-cta home-cta--jobs">
              <span>Empleos</span>
              <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}