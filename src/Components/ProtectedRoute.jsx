import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log("=== PROTECTED ROUTE CHECK ===");
    console.log("Loading:", loading);
    console.log("User:", user);
    console.log("Required role:", role);
    console.log("User role:", user?.role);
  }, [loading, user, role]);

  if (loading) {
    console.log("Still loading...");
    return <div>Loading...</div>;
  }

  if (!user) {
    console.log("No user found - redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    console.log("Role mismatch!");
    console.log("Expected:", role);
    console.log("Got:", user?.role);
    
    if (user?.role === 'passenger') {
      return <Navigate to="/passenger-dashboard" replace />;
    } else if (user?.role === 'driver') {
      return <Navigate to="/driver-dashboard" replace />;
    } else if (user?.role === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  console.log("Access granted! Rendering dashboard");
  return children;
}

export default ProtectedRoute;