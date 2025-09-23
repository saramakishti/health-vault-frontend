import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import DoctorView from "./components/DoctorView";
import PatientView from "./components/PatientView";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

function AppRoutes() {
  const { isAuthenticated, isDoctor, isPatient } = useAuth();

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
