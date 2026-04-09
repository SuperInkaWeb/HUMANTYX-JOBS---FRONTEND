import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import RequireCompleteProfile from "./components/RequireCompleteProfile";

import PublicLayout from "./components/PublicLayout";
import AdminLayout from "./components/AdminLayout";
import AuthLayout from "./components/AuthLayout";

import Home from "./pages/Home";
import JobsList from "./pages/JobsList";
import JobDetail from "./pages/JobDetail";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import SetPassword from "./pages/auth/SetPassword";

import MyApplications from "./pages/MyApplications";
import MyProfile from "./pages/MyProfile";

// RRHH
import AdminJobsList from "./pages/admin/AdminJobsList";
import AdminJobForm from "./pages/admin/AdminJobForm";
import AdminJobApplications from "./pages/admin/AdminJobApplications";
import AdminCandidatesList from "./pages/admin/AdminCandidatesList";
import AdminInviteUser from "./pages/admin/AdminInviteUser";
import AdminCandidateProfile from "./pages/admin/AdminCandidateProfile";

import CompleteProfile from "./pages/CompleteProfile";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RequireCompleteProfile>
          <Routes>
            {/* AUTH LAYOUT (SIN NAVBAR NI FOOTER) */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/set-password" element={<SetPassword />} />
            </Route>

            {/* LAYOUT PUBLICO */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/empleos" element={<JobsList />} />
              <Route path="/empleos/:id" element={<JobDetail />} />

              <Route
                path="/completar-perfil"
                element={
                  <ProtectedRoute>
                    <CompleteProfile />
                  </ProtectedRoute>
                }
              />

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
            </Route>

            {/* LAYOUT ADMIN / RRHH */}
            <Route
              element={
                <RoleProtectedRoute allow={["ADMIN", "RRHH"]}>
                  <AdminLayout />
                </RoleProtectedRoute>
              }
            >
              <Route path="/rrhh/vacantes" element={<AdminJobsList />} />
              <Route path="/rrhh/vacantes/nueva" element={<AdminJobForm />} />
              <Route path="/rrhh/vacantes/:id/editar" element={<AdminJobForm />} />

              <Route
                path="/rrhh/vacantes/:id/postulantes"
                element={<AdminJobApplications />}
              />

              <Route
                path="/rrhh/vacantes/:jobId/postulantes/:candidateId/perfil"
                element={<AdminCandidateProfile />}
              />

              <Route
                path="/rrhh/candidatos"
                element={
                  <RoleProtectedRoute allow={["ADMIN"]}>
                    <AdminCandidatesList />
                  </RoleProtectedRoute>
                }
              />

              <Route
                path="/rrhh/invitar"
                element={
                  <RoleProtectedRoute allow={["ADMIN"]}>
                    <AdminInviteUser />
                  </RoleProtectedRoute>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </RequireCompleteProfile>
      </AuthProvider>
    </BrowserRouter>
  );
}