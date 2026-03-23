// src/utils/jobs.js

export function sortJobs(list, sortBy = "newest") {
  const jobsCopy = [...list];

  if (sortBy === "oldest") {
    return jobsCopy.sort(
      (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0)
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
    (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
  );
}

export function getSortLabel(value) {
  if (value === "oldest") return "Más antiguos";
  if (value === "title_asc") return "Título A-Z";
  return "Más recientes";
}