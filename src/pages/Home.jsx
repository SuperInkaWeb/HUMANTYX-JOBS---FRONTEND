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

  const humantyx = "#6EC6C4";

  return (
    <div
      style={{
        background:
          "radial-gradient(900px 420px at 50% 18%, rgba(110,198,196,0.20), transparent 62%), radial-gradient(900px 420px at 75% 5%, rgba(53,87,212,0.12), transparent 60%)",
      }}
    >
      <div className="container py-5">
        <div
          className="text-center"
          style={{ maxWidth: 900, margin: "0 auto" }}
        >
          <h1
            className="fw-bold"
            style={{
              fontSize: "clamp(2rem,4vw,3.3rem)",
              lineHeight: 1.1,
            }}
          >
            Encuentra tu próximo empleo con una experiencia{" "}
            <span style={{ color: humantyx }}>simple</span>
            {" "}y{" "}
            <span style={{ color: humantyx }}>profesional</span>.
          </h1>

          <p className="text-muted mt-4">
            Busca las mejores oportunidades y postula en minutos.
            Un portal moderno, claro y centrado en el talento.
          </p>

          <form
            onSubmit={onSearch}
            className="mx-auto"
            style={{
              marginTop: "80px",
              maxWidth: 850,
              borderRadius: 999,
              border: "1px solid rgba(0,0,0,0.15)",
              background: "white",
              boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
              overflow: "hidden",
            }}
          >
            <div className="d-flex align-items-stretch">
              <div
                className="d-flex align-items-center flex-grow-1 px-3"
                style={{ gap: 10 }}
              >
                <i
                  className="bi bi-search"
                  style={{ fontSize: 18, color: "#6c757d" }}
                ></i>

                <input
                  className="form-control border-0 shadow-none"
                  placeholder="Cargo, palabras clave..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>

              <div
                style={{
                  width: 1,
                  background: "rgba(0,0,0,0.12)",
                }}
              ></div>

              <div
                className="d-flex align-items-center flex-grow-1 px-3"
                style={{ gap: 10 }}
              >
                <i
                  className="bi bi-geo-alt"
                  style={{ fontSize: 18, color: "#6c757d" }}
                ></i>

                <input
                  className="form-control border-0 shadow-none"
                  placeholder="Ciudad o región"
                  value={loc}
                  onChange={(e) => setLoc(e.target.value)}
                />
              </div>

              <div className="p-2">
                <button
                  type="submit"
                  className="btn fw-semibold"
                  style={{
                    background: humantyx,
                    color: "white",
                    borderRadius: 999,
                    padding: "12px 22px",
                    minWidth: 130,
                  }}
                >
                  Buscar
                </button>
              </div>
            </div>
          </form>

          <div className="mt-5 pt-1">
            <Link
              to="/empleos"
              className="btn fw-semibold"
              style={{
                background: humantyx,
                color: "white",
                borderRadius: 14,
                padding: "12px 28px",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                boxShadow: "0 10px 18px rgba(110,198,196,0.35)",
              }}
            >
              Empleos
              <i
                className="bi bi-arrow-right"
                style={{ fontSize: 18 }}
              ></i>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}