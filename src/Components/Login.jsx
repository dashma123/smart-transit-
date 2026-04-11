import React, { useState, useEffect } from "react";
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

  // Load saved email on page open
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRemember(true);
    }
  }, []);

  const handleForgotPassword = () => {
    const phone = prompt("Enter your registered phone number:");
    if (phone) {
      alert(`If ${phone} is registered, please call our support at 9800000000 to reset your password.`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!role) {
      alert("Please select a role first!");
      return;
    }

    try {
      const result = await login(email, password);

      if (result.success) {
        // Save or remove email based on remember me
        if (remember) {
          localStorage.setItem("rememberedEmail", email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        if (result.user.role !== role) {
          alert(`This account is registered as ${result.user.role}, not ${role}`);
          return;
        }

        if (role === "passenger") {
          navigate("/passenger-dashboard", { replace: true });
        } else if (role === "driver") {
          navigate("/driver-dashboard", { replace: true });
        } else if (role === "admin") {
          navigate("/admin-dashboard", { replace: true });
        }
      } else {
        alert(result.message || "Invalid email or password");
      }
    } catch (error) {
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

  return (
    <div className="login-page">
      <button className="home-button" onClick={() => navigate("/")}>
        <FaHome /> Home
      </button>

      <div className="login-card">
        <h1>Welcome Back!</h1>
        <p className="subtitle">Login to your account</p>

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

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            disabled={isLoading}
          />
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
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
            <span
              className="forgot"
              onClick={handleForgotPassword}
              style={{ cursor: "pointer" }}
            >
              forgot password?
            </span>
          </div>
          <button type="submit" className="signin-btn" disabled={isLoading}>
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

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