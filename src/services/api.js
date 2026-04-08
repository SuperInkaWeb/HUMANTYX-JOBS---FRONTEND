const BASE_URL = import.meta.env.VITE_API_URL;

/* =========================
   CORE FETCH
========================= */
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await res.text();
  const data = text
    ? (() => {
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      })()
    : null;

  if (!res.ok) {
  const err = new Error(
    data && data.message ? data.message : `Error HTTP ${res.status}`
  );
  err.status = res.status;
  err.code = data?.code;
  err.data = data;
  throw err;
}

  return data;
}

/* =========================
   CV - GESTIÓN
========================= */

/**
 * Subir CV (multipart/form-data)
 */
export async function uploadCv(file) {
  const form = new FormData();
  form.append("cv", file);

  return apiFetch("/candidate/files/cv", {
    method: "POST",
    body: form,
  });
}

/**
 * Obtener info del CV actual
 */
export async function getCvInfo() {
  return apiFetch("/candidate/files/cv");
}

/**
 * Descargar CV
 */
export async function downloadCv() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/candidate/files/cv/download`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    const msg =
      data && data.message ? data.message : `Error HTTP ${res.status}`;
    throw new Error(msg);
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;

  // Intentar obtener nombre real del backend
  const contentDisposition = res.headers.get("Content-Disposition");
  if (contentDisposition && contentDisposition.includes("filename=")) {
    const fileName = contentDisposition
      .split("filename=")[1]
      .replace(/"/g, "");
    a.download = fileName;
  } else {
    a.download = "cv.pdf";
  } 

  document.body.appendChild(a);
  a.click();
  a.remove();

  window.URL.revokeObjectURL(url);
}

export async function validateInvite(token, email) {
  const res = await fetch(
    `${BASE_URL}/auth/invites/validate?token=${token}&email=${encodeURIComponent(email)}`
  );

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}

/* =========================
   MENSAJERIA ENTRE RECLUTADOR Y CANDIDATO
========================= */

export async function getAdminApplicationMessages(applicationId) {
  return apiFetch(`/admin/applications/${applicationId}/messages`);
}

export async function sendAdminApplicationMessage(applicationId, messageText) {
  return apiFetch(`/admin/applications/${applicationId}/messages`, {
    method: "POST",
    body: JSON.stringify({
      message_text: messageText,
    }),
  });
}

export async function getCandidateApplicationMessages(applicationId) {
  return apiFetch(`/candidate/applications/${applicationId}/messages`);
}

export async function replyCandidateApplicationMessage(applicationId, messageText) {
  return apiFetch(`/candidate/applications/${applicationId}/messages/reply`, {
    method: "POST",
    body: JSON.stringify({
      message_text: messageText,
    }),
  });
}