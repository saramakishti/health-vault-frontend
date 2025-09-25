import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

import LandingPage from "./components/LandingPage";
import DoctorView from "./components/doctor/DoctorView";
import PatientView from "./components/PatientView";
import AdminView from "./components/admin/AdminView";

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
