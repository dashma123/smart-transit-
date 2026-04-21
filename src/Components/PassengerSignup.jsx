import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom"; // if not already imported
import "../style.css";

const PassengerSignup = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

   const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };


// INSIDE YOUR COMPONENT
const { register } = useAuth(); // ADD THIS LINE
const navigate = useNavigate(); // ADD THIS LINE if not already there

// REPLACE handleSubmit WITH THIS:
const handleSubmit = async (e) => {
  e.preventDefault();
  if (formData.password !== formData.confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  // Call backend API instead of localStorage
  const result = await register({
    name: formData.fullName,
    email: formData.email,
    phone: formData.phone,
    password: formData.password,
    role: "passenger"
  });
  
  if (result.success) {
    alert("Passenger account created successfully!");
    navigate("/passenger-dashboard");
  } else {
    alert(result.message || "Registration failed");
  }
};

  return (
    <div className="signup-page">
      <div className="signup-card">
        <h1 className="signup-title">Passenger Signup</h1>
        <p className="signup-subtitle">Create your passenger account</p>

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
          </div>

          <div className="checkbox-group">
            <input type="checkbox" name="agree" checked={formData.agree} onChange={handleChange} required />
            <span>I agree to the Terms of Service and Privacy Policy</span>
          </div>

          <button type="submit" className="signup-btn">Create Account</button>
        </form>

        <p className="login-link">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default PassengerSignup;
