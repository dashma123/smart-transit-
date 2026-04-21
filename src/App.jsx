import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import LandingPage from "./Components/LandingPage";
import Login from "./Components/Login";
import PassengerSignup from "./Components/PassengerSignup";
import DriverSignup from "./Components/DriverSignup";
import PassengerDashboard from "./Components/PassengerDashboard";
import DriverDashboard from "./Components/DriverDashboard";
import AdminDashboard from "./Components/adminDashboard";
import ProtectedRoute from "./Components/ProtectedRoute";
import PaymentSuccess from './pages/PaymentSuccess';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/passenger-signup" element={<PassengerSignup />} />
          <Route path="/driver-signup" element={<DriverSignup />} />

          {/* Dashboards with protection */}
          <Route
            path="/passenger-dashboard"
            element={
              <ProtectedRoute role="passenger">
                <PassengerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver-dashboard"
            element={
              <ProtectedRoute role="driver">
                <DriverDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback for unknown routes */}
          <Route path="*" element={<LandingPage />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;