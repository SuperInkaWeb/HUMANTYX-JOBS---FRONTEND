import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../services/api";
import "./admin-candidates-list.css";

function formatDate(dateString) {
  if (!dateString) return "—";

  const date = new Date(dateString);

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getInitials(firstName, lastName, email) {
  const name = `${firstName || ""} ${lastName || ""}`.trim();

  if (name) {
    return name
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("");
  }

  if (email) return email.slice(0, 2).toUpperCase();

  return "—";
}

export default function AdminCandidatesList() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function loadCandidates() {
    try {
      setLoading(true);
      setError("");

      const data = await apiFetch("/admin/candidates");

      const normalized = Array.isArray(data)
        ? data
        : Array.isArray(data?.candidates)
        ? data.candidates
        : [];

      setCandidates(normalized);
    } catch (err) {
      setError(err.message || "Error listando candidatos");
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCandidates();
  }, []);

  const filteredCandidates = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return candidates;

    return candidates.filter((candidate) => {
      const fullName =
        `${candidate.first_name || ""} ${candidate.last_name || ""}`.toLowerCase();

      return (
        fullName.includes(term) ||
        (candidate.email || "").toLowerCase().includes(term) ||
        (candidate.phone || "").toLowerCase().includes(term) ||
        (candidate.document_number || "").toLowerCase().includes(term) ||
        (candidate.document_type || "").toLowerCase().includes(term)
      );
    });
  }, [candidates, search]);

  return (
    <div className="acl-page">
      <div className="acl-header">
        <div className="acl-header__left">
          <h1>Candidatos</h1>
          <p>
            Total de candidatos registrados:{" "}
            <span>{candidates.length.toLocaleString("es-PE")}</span>
          </p>
        </div>
      </div>

      <div className="acl-toolbar">
        <div className="acl-search">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>

          <input
            type="text"
            placeholder="Buscar candidatos por nombre, email, teléfono o documento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="acl-toolbar__count">
          Mostrando {filteredCandidates.length} de {candidates.length}
        </div>
      </div>

      {error && <div className="acl-alert acl-alert--error">{error}</div>}

      <div className="acl-table-card">
        <div className="acl-table-wrap">
          <table className="acl-table">
            <thead>
              <tr>
                <th>Nombre / Candidato</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Documento</th>
                <th>Fecha de registro</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="acl-empty">
                    Cargando candidatos...
                  </td>
                </tr>
              ) : filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan="6" className="acl-empty">
                    No hay candidatos para mostrar.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((candidate) => {
                  const fullName =
                    `${candidate.first_name || ""} ${candidate.last_name || ""}`.trim() ||
                    "Sin nombre";

                  const documentLabel =
                    candidate.document_type || candidate.document_number
                      ? `${candidate.document_type || "Doc"} · ${
                          candidate.document_number || "—"
                        }`
                      : "—";

                  return (
                    <tr key={candidate.id}>
                      <td>
                        <div className="acl-candidate">
                          <div className="acl-candidate__avatar">
                            {getInitials(
                              candidate.first_name,
                              candidate.last_name,
                              candidate.email
                            )}
                          </div>

                          <div className="acl-candidate__info">
                            <strong>{fullName}</strong>
                            <span>
                              {candidate.headline ||
                                candidate.city ||
                                candidate.country
                                }
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="acl-cell-muted">
                        {candidate.email || "—"}
                      </td>

                      <td className="acl-cell-muted">
                        {candidate.phone || "—"}
                      </td>

                      <td className="acl-cell-muted">{documentLabel}</td>

                      <td className="acl-cell-muted">
                        {formatDate(candidate.created_at)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="acl-footer">
          <span>
            Mostrando {filteredCandidates.length}{" "}
            {filteredCandidates.length === 1 ? "resultado" : "resultados"}
          </span>
        </div>
      </div>
    </div>
  );
}