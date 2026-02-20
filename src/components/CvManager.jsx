import { useEffect, useRef, useState } from "react";
import { uploadCv, getCvInfo, downloadCv } from "../services/api";

export default function CvManager() {
  const [cvInfo, setCvInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fileInputRef = useRef(null);

  // =============================
  // CARGAR INFO DEL CV
  // =============================
  useEffect(() => {
    loadCv();
  }, []);

  async function loadCv() {
    try {
      setLoading(true);
      const data = await getCvInfo();
      setCvInfo(data);
    } catch {
      setCvInfo(null);
    } finally {
      setLoading(false);
    }
  }

  // =============================
  // SELECCIONAR ARCHIVO
  // =============================
  function handleFileChange(e) {
    const file = e.target.files?.[0];
    setError("");
    setSuccess("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (file.type !== "application/pdf") {
      setSelectedFile(null);
      setError("Solo se permiten archivos PDF");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSelectedFile(null);
      setError("El archivo no debe superar los 5MB");
      return;
    }

    setSelectedFile(file);
  }

  function handleRemoveFile() {
    setSelectedFile(null);
    setError("");
    setSuccess("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // =============================
  // SUBIR CV (MANUAL)
  // =============================
  async function handleUpload() {
    if (!selectedFile) {
      setError("Selecciona un PDF antes de subir");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      await uploadCv(selectedFile);

      setSuccess("CV subido correctamente ✅");
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await loadCv();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  // =============================
  // DESCARGAR CV
  // =============================
  async function handleDownload() {
    try {
      await downloadCv();
    } catch (err) {
      setError(err.message);
    }
  }

  // =============================
  // UI
  // =============================
  return (
    <div className="card p-4 mt-4 shadow-sm rounded-4">
      <h5 className="mb-4 fw-bold">Gestión de CV</h5>

      {loading ? (
        <p>Cargando información...</p>
      ) : (
        <>
          {/* ============================= */}
          {/* CV ACTUAL */}
          {/* ============================= */}
          {cvInfo ? (
            <div className="mb-4 p-4 bg-white border rounded-4 shadow-sm">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">

                {/* Info */}
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-3"
                    style={{
                      width: 48,
                      height: 48,
                      backgroundColor: "#f8f9fa"
                    }}
                  >
                    <i className="bi bi-file-earmark-pdf-fill fs-4 text-danger"></i>
                  </div>

                  <div>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <div className="fw-semibold text-dark">
                        CV cargado
                      </div>

                      <span
                        className="badge rounded-pill"
                        style={{
                          backgroundColor: "#e8fff3",
                          color: "#0f5132",
                          border: "1px solid #b7f0d2",
                          fontWeight: 600
                        }}
                      >
                        <i className="bi bi-check-circle-fill me-1"></i>
                        Cargado
                      </span>
                    </div>

                    <div className="text-muted small">
                      Tu CV está listo para postular
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="d-flex align-items-center gap-2">
                  <button
                    className="btn btn-outline-dark rounded-pill px-3"
                    onClick={handleDownload}
                    disabled={uploading}
                  >
                    <i className="bi bi-download me-2"></i>
                    Descargar
                  </button>

                  <button
                    className="btn rounded-pill px-3"
                    style={{
                      backgroundColor: "#1f2937",
                      color: "white"
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <i className="bi bi-arrow-repeat me-2"></i>
                    Reemplazar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted mb-4">Aún no has subido tu CV.</p>
          )}

          {/* ============================= */}
          {/* INPUT FILE */}
          {/* ============================= */}
          <div className="mb-2">
            <label className="form-label fw-semibold">
              Subir nuevo CV (PDF)
            </label>

            <input
              type="file"
              accept="application/pdf"
              className="form-control"
              onChange={handleFileChange}
              disabled={uploading}
              ref={fileInputRef}
            />
          </div>

          {/* ============================= */}
          {/* ARCHIVO SELECCIONADO */}
          {/* ============================= */}
          {selectedFile && (
            <div className="mt-4 p-4 bg-white border rounded-4 shadow-sm">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

                <div className="d-flex align-items-center gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-3"
                    style={{
                      width: 48,
                      height: 48,
                      backgroundColor: "#f8f9fa"
                    }}
                  >
                    <i className="bi bi-file-earmark-pdf-fill fs-4 text-danger"></i>
                  </div>

                  <div>
                    <div className="fw-semibold text-dark">
                      {selectedFile.name}
                    </div>
                    <div className="text-muted small">
                      {(selectedFile.size / 1024).toFixed(1)} KB • PDF
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                  onClick={handleRemoveFile}
                  disabled={uploading}
                >
                  Quitar
                </button>
              </div>

              <div className="mt-4 text-end">
                <button
                  className="btn rounded-pill px-4"
                  style={{
                    backgroundColor: "#1f2937",
                    color: "white"
                  }}
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? "Subiendo..." : "Subir CV"}
                </button>
              </div>
            </div>
          )}

          {error && <div className="alert alert-danger mt-3">{error}</div>}
          {success && <div className="alert alert-success mt-3">{success}</div>}
        </>
      )}
    </div>
  );
}
