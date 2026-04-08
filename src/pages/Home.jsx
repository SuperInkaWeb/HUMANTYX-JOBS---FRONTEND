import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

    const queryString = params.toString();
    nav(queryString ? `/empleos?${queryString}` : "/empleos");
  }

  function goJobs() {
    nav("/empleos");
  }

  return (
    <section className="hx-home">
      <div className="hx-home__shell">
        <div className="hx-home__hero">
          <div className="hx-home__copy">
            <h1 className="hx-home__title">
              Encuentra tu próximo empleo
              <br />
              con una experiencia{" "}
              <span className="hx-home__title-accent">simple y profesional</span>.
            </h1>

            <p className="hx-home__subtitle">
              Busca las mejores oportunidades y postula en minutos. Un portal
              moderno, claro y centrado en el talento.
            </p>
          </div>

          <form className="hx-home__search" onSubmit={onSearch}>
            <div className="hx-home__search-field">
              <i className="bi bi-search hx-home__search-icon"></i>
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cargo, palabras clave..."
                aria-label="Cargo o palabras clave"
              />
            </div>

            <div className="hx-home__search-divider" />

            <div className="hx-home__search-field">
              <i className="bi bi-geo-alt hx-home__search-icon"></i>
              <input
                type="text"
                value={loc}
                onChange={(e) => setLoc(e.target.value)}
                placeholder="Ciudad o región"
                aria-label="Ciudad o región"
              />
            </div>

            <button type="submit" className="hx-home__search-button">
              Buscar
            </button>
          </form>

          <div className="hx-home__actions">
            <button type="button" className="hx-home__jobs-button" onClick={goJobs}>
              <span>Empleos</span>
              <i className="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}