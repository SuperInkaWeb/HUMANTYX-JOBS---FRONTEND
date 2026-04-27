// src/utils/jobs.js

function getJobSortDate(job) {
  return new Date(job?.published_at || job?.created_at || 0);
}

export function sortJobs(list, sortBy = "newest") {
  const jobsCopy = [...list];

  if (sortBy === "oldest") {
    return jobsCopy.sort(
      (a, b) => getJobSortDate(a) - getJobSortDate(b)
    );
  }

  if (sortBy === "title_asc") {
    return jobsCopy.sort((a, b) =>
      (a.title || "").localeCompare(b.title || "", "es", {
        sensitivity: "base",
      })
    );
  }

  return jobsCopy.sort(
    (a, b) => getJobSortDate(b) - getJobSortDate(a)
  );
}

export function getSortLabel(value) {
  if (value === "oldest") return "Más antiguos";
  if (value === "title_asc") return "Título A-Z";
  return "Más recientes";
}

export function formatEmploymentType(value) {
  if (!value) return "No especificado";

  const map = {
    internship: "Prácticas",
    full_time: "Tiempo completo",
    "full-time": "Tiempo completo",
    part_time: "Medio tiempo",
    "part-time": "Medio tiempo",
    contract: "Contrato",
  };

  return map[value] || value;
}