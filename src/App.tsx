import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

import LandingPage from "./components/LandingPage";
import DoctorView from "./components/doctor/DoctorView";
import AdminView from "./components/admin/AdminView";
import PatientWorkspace from "./components/doctor/PatientWorkspace";
import PatientView from "./components/patient/PatientView";
import AnalysisPanel from "./components/doctor/analyses/AnalysisPanel";
import AnalysisDetailPage from "./components/doctor/analyses/AnalysisDetailPage";

function AppRoutes() {
  const { isAuthenticated, isDoctor, isPatient, isAdmin } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route
        path="/doctor"
        element={
          <ProtectedRoute isAllowed={isAuthenticated && isDoctor}>
            <DoctorView />
          </ProtectedRoute>
        }
      />

      <Route path="/doctor/patients/:id" element={
        <ProtectedRoute isAllowed={isDoctor}>
          <PatientWorkspace />
        </ProtectedRoute>}
      />

      <Route path="/doctor/patients/:patientId/analyses/:analysisId" element={
        <ProtectedRoute isAllowed={isDoctor}>
          <AnalysisDetailPage />
        </ProtectedRoute>}
      />


      <Route
        path="/patient"
        element={
          <ProtectedRoute isAllowed={isAuthenticated && isPatient}>
            <PatientView />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute isAllowed={isAuthenticated && isAdmin}>
            <AdminView />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
