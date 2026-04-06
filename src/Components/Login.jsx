import React, { useState } from "react";
import { authAPI } from "../services/api";
import { FaUser, FaTruck, FaShieldAlt, FaHome } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "../style.css";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!role) {
      alert("Please select a role first!");
      return;
    }
    
    console.log("=== LOGIN START ===");
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Selected role:", role);
    
    try {
      const result = await login(email, password);
      
      console.log("=== LOGIN RESULT ===");
      console.log("Full result object:", result);
      console.log("Success:", result.success);
      console.log("User:", result.user);
      
      if (result.success) {
        console.log("Login successful!");
        console.log("User role from server:", result.user.role);
        console.log("Selected role:", role);
        
        if (result.user.role !== role) {
          alert(`This account is registered as ${result.user.role}, not ${role}`);
          return;
        }
        
        console.log("=== NAVIGATING TO DASHBOARD ===");
        
        // Direct navigation
        if (role === "passenger") {
          console.log("Going to passenger dashboard");
          navigate("/passenger-dashboard", { replace: true });
        } else if (role === "driver") {
          console.log("Going to driver dashboard");
          navigate("/driver-dashboard", { replace: true });
        } else if (role === "admin") {
          console.log("Going to admin dashboard");
          navigate("/admin-dashboard", { replace: true });
        }
      } else {
        console.log("Login failed:", result.message);
        alert(result.message || "Invalid email or password");
      }
    } catch (error) {
      console.error("=== LOGIN ERROR ===");
      console.error("Error object:", error);
      console.error("Error response:", error.response);
      alert("An error occurred during login");
    }
  };

  const handleSignupClick = () => {
    if (role === "passenger") {
      navigate("/passenger-signup");
    } else if (role === "driver") {
      navigate("/driver-signup");
    } else {
      alert("Please select a role (Passenger or Driver) first!");
    }
  };

  const goToHome = () => {
    navigate("/");
  };

  return (
    <div className="login-page">
      {/* Home Button */}
      <button className="home-button" onClick={goToHome}>
        <FaHome /> Home
      </button>

      <div className="login-card">
        <h1>Welcome Back!</h1>
        <p className="subtitle">Login to your account</p>
        
        {/* Role selection icons */}
        <div className="icon-row">
          <div
            className={`icon-box ${role === "passenger" ? "selected" : ""}`}
            onClick={() => setRole("passenger")}
          >
            <FaUser />
          </div>
          <div
            className={`icon-box ${role === "driver" ? "selected" : ""}`}
            onClick={() => setRole("driver")}
          >
            <FaTruck />
          </div>
          <div
            className={`icon-box ${role === "admin" ? "selected" : ""}`}
            onClick={() => setRole("admin")}
          >
            <FaShieldAlt />
          </div>
        </div>
        
        {/* Login form */}
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          <div className="options">
            <label>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={isLoading}
              />
              Remember Me
            </label>
            <span className="forgot">forgot password?</span>
          </div>
          <button type="submit" className="signin-btn" disabled={isLoading}>
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>
        
        {/* Signup navigation */}
        <p className="signup-text">
          Don't have an account?{" "}
          <span
            onClick={handleSignupClick}
            className="font-bold text-pink-700 cursor-pointer"
          >
            Signup
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;