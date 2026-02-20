import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import JobsList from "./pages/JobsList";
import JobDetail from "./pages/JobDetail";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import MyApplications from "./pages/MyApplications";
import MyProfile from "./pages/MyProfile";

// RRHH
import AdminJobsList from "./pages/admin/AdminJobsList";
import AdminJobForm from "./pages/admin/AdminJobForm";
import AdminJobApplications from "./pages/admin/AdminJobApplications";
import AdminCandidatesList from "./pages/admin/AdminCandidatesList";


export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />

        <Routes>
          {/* Público */}
          <Route path="/" element={<Home />} />
          <Route path="/empleos" element={<JobsList />} />
          <Route path="/empleos/:id" element={<JobDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Candidato (logueado) */}
          <Route
            path="/mi-perfil"
            element={
              <ProtectedRoute>
                <MyProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mis-postulaciones"
            element={
              <ProtectedRoute>
                <MyApplications />
              </ProtectedRoute>
            }
          />

          {/* RRHH/Admin */}
          <Route
            path="/rrhh/vacantes"
            element={
              <RoleProtectedRoute allow={["ADMIN", "RRHH"]}>
                <AdminJobsList />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/rrhh/vacantes/nueva"
            element={
              <RoleProtectedRoute allow={["ADMIN", "RRHH"]}>
                <AdminJobForm />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/rrhh/vacantes/:id/editar"
            element={
              <RoleProtectedRoute allow={["ADMIN", "RRHH"]}>
                <AdminJobForm />
              </RoleProtectedRoute>
            }
          />

          {/* Ver postulantes por vacante */}
          <Route
            path="/rrhh/vacantes/:id/postulantes"
            element={
              <RoleProtectedRoute allow={["ADMIN", "RRHH"]}>
                <AdminJobApplications />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/rrhh/candidatos"
            element={
              <RoleProtectedRoute allow={["ADMIN", "RRHH"]}>
                <AdminCandidatesList />
              </RoleProtectedRoute>
            }
          />


          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Footer />
      </AuthProvider>
    </BrowserRouter>
  );
}
