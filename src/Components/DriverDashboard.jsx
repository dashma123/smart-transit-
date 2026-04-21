import React, { useState, useEffect } from "react";
import { driverAPI } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { FiUser, FiLogOut, FiMapPin } from "react-icons/fi";
import "../style.css";

function DriverDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user || user.role !== "driver") {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const [stops, setStops] = useState([]);
  const [stats, setStats] = useState({
    totalStops: 0,
    todayStops: 0,
    thisWeekStops: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchDriverData = async () => {
    try {
      setLoading(true);
      const [stopsRes, statsRes] = await Promise.all([
        driverAPI.getStops(),
        driverAPI.getStats()
      ]);
      setStops(stopsRes.data.stops || []);
      setStats(statsRes.data || {
        totalStops: 0,
        todayStops: 0,
        thisWeekStops: 0
      });
    } catch (error) {
      console.error('Error fetching driver data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDriverData();
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <div className="top-bar">
        <div className="user-info">
          <FiUser /> {user.name}
        </div>
        <button onClick={handleLogout} className="logout-btn">
          <FiLogOut /> Logout
        </button>
      </div>

      <div className="balance-section">
        <h3>Driver Profile</h3>
        <p>{user.name}</p>
        <p>Email: {user.email}</p>
        <p>Phone: {user.phone}</p>
        {user.licenseNumber && <p>License: {user.licenseNumber}</p>}
      </div>

      <div className="stats-section">
        <div>Total Stops: {stats.totalStops}</div>
        <div>Today: {stats.todayStops}</div>
        <div>This Week: {stats.thisWeekStops}</div>
      </div>

      <div className="trip-history">
        <h3>Recent Stops</h3>
        {loading ? (
          <p>Loading...</p>
        ) : stops.length === 0 ? (
          <p>No stops recorded yet!</p>
        ) : (
          stops.map((stop) => (
            <div key={stop._id} className="trip-card">
              <FiMapPin />
              {stop.stopNumber} |
              {stop.route} |
              {new Date(stop.timestamp).toLocaleDateString()} {new Date(stop.timestamp).toLocaleTimeString()}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default DriverDashboard;