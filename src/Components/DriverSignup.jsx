import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import "../style.css";

const DriverSignup = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    licenseNumber: "",
    confirmLicenseNumber: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.licenseNumber !== formData.confirmLicenseNumber) {
      alert("License numbers do not match");
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const result = await register({
      name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: "driver"
    });

    if (result.success) {
      alert("Driver account created successfully!");
      navigate("/driver-dashboard");
    } else {
      alert(result.message || "Registration failed");
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card">
        <h1>Driver Signup</h1>
        
        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input 
            name="fullName" 
            type="text"
            placeholder="Full Name" 
            value={formData.fullName}
            onChange={handleChange} 
            required 
          />
          
          <label>Email</label>
          <input 
            name="email" 
            type="email" 
            placeholder="Email" 
            value={formData.email}
            onChange={handleChange} 
            required 
          />
          
          <label>Phone</label>
          <input 
            name="phone" 
            type="tel"
            placeholder="Phone" 
            value={formData.phone}
            onChange={handleChange} 
            required 
          />
          
          <label>License Number</label>
          <input 
            name="licenseNumber" 
            type="text"
            placeholder="License Number" 
            value={formData.licenseNumber}
            onChange={handleChange} 
            required 
          />
          
          <label>Confirm License</label>
          <input 
            name="confirmLicenseNumber" 
            type="text"
            placeholder="Confirm License" 
            value={formData.confirmLicenseNumber}
            onChange={handleChange} 
            required 
          />
          
          <label>Password</label>
          <input 
            name="password" 
            type="password" 
            placeholder="Password" 
            value={formData.password}
            onChange={handleChange} 
            required 
          />
          
          <label>Confirm Password</label>
          <input 
            name="confirmPassword" 
            type="password" 
            placeholder="Confirm Password" 
            value={formData.confirmPassword}
            onChange={handleChange} 
            required 
          />
          
          <div className="terms">
            <input 
              type="checkbox" 
              name="agree" 
              checked={formData.agree}
              onChange={handleChange} 
              required 
            />
            <span>I agree to the Terms of Service and Privacy Policy</span>
          </div>
          
          <button type="submit" className="signup-btn">Create Account</button>
        </form>
        
        <p className="footer-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default DriverSignup;