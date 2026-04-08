import { useEffect, useRef, useState } from "react";
import { uploadCv, getCvInfo, downloadCv } from "../services/api";
import "./cv-manager.css";

export default function CvManager() {
  const [cvInfo, setCvInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    loadCv();
  }, []);

  async function loadCv() {
    try {
      setLoading(true);
      const data = await getCvInfo();
      setCvInfo(data?.cv || null);

    } catch {
      setCvInfo(null);
    } finally {
      setLoading(false);
    }
  }

   

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

  async function handleDownload() {
    try {
      await downloadCv();
    } catch (err) {
      setError(err.message);
    }
  }

  

  return (
    <div className="hx-cv-manager">
      <h3 className="hx-profile-box-title">Gestión de CV</h3>

      {loading ? (
        <p className="hx-cv-text">Cargando información...</p>
      ) : (
        <>
          {cvInfo ? (
            <div className="hx-cv-box">
              <div className="hx-cv-box__top">
                <div className="hx-cv-file">
                  <div className="hx-cv-file__icon">
                    <i className="bi bi-file-earmark-pdf-fill"></i>
                  </div>

                  <div>
                    <div className="hx-cv-file__title-row">
                      <span className="hx-cv-file__title"> {cvInfo?.original_name || "CV.pdf"}</span>

                      <span className="">
                        <i className="bi bi-check-circle-fill"></i>
                      </span>
                    </div>

                    <p className="hx-cv-text mb-0">
                      Tu CV está listo para postular
                    </p>
                  </div>
                </div>

                <div className="hx-cv-actions">
                  <button
                    type="button"
                    className="hx-btn-secondary"
                    onClick={handleDownload}
                    disabled={uploading}
                  >
                    <i className="bi bi-download me-2"></i>
                    Descargar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="hx-cv-text mb-4">Aún no has subido tu CV.</p>
          )}

          <div className="hx-cv-upload-block">
            <label className="hx-label">Subir nuevo CV </label>

            <input
              id="cv-upload-input"
              type="file"
              accept="application/pdf"
              className="hx-file-hidden"
              onChange={handleFileChange}
              disabled={uploading}
              ref={fileInputRef}
            />

            <div className="hx-file-row">
              <label htmlFor="cv-upload-input" className="hx-file-trigger">
                <i className="bi bi-upload me-2"></i>
                Seleccionar PDF
              </label>

              
            </div>
          </div>

          {selectedFile && (
            <div className="hx-cv-box mt-4">
              <div className="hx-cv-box__top">
                <div className="hx-cv-file">
                  <div className="hx-cv-file__icon">
                    <i className="bi bi-file-earmark-pdf-fill"></i>
                  </div>

                  <div>
                    <div className="hx-cv-file__title">{selectedFile.name}</div>
                    <p className="hx-cv-text mb-0">
                      {(selectedFile.size / 1024).toFixed(1)} KB • PDF
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="hx-btn-secondary hx-btn-small"
                  onClick={handleRemoveFile}
                  disabled={uploading}
                >
                  Quitar
                </button>
              </div>

              <div className="hx-cv-upload-action">
                <button
                  type="button"
                  className="hx-btn-dark-soft"
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