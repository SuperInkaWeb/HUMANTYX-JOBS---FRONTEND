import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const nav = useNavigate();
  const { register } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    try {
      setError("");
      await register(email, password);
      nav("/empleos");
    } catch (e2) {
      setError(e2.message);
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 520 }}>
      <h2 className="fw-bold mb-3">Crear cuenta</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={onSubmit} className="card card-body">
        <label className="form-label">Email</label>
        <input className="form-control mb-3" value={email} onChange={(e) => setEmail(e.target.value)} />

        <label className="form-label">Contraseña</label>
        <input type="password" className="form-control mb-3" value={password} onChange={(e) => setPassword(e.target.value)} />

        <button className="btn btn-dark rounded-pill" type="submit">Crear</button>

        <div className="mt-3 small">
          ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
        </div>
      </form>
    </div>
  );
}
