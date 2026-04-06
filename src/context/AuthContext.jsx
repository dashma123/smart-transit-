import React, { createContext, useState, useContext, useEffect } from "react";
import { authAPI } from "../services/api";
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("=== AUTH CONTEXT INIT ===");
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    console.log("Stored token:", storedToken);
    console.log("Stored user:", storedUser);
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      console.log("User restored from localStorage");
    }
    setLoading(false);
  }, []);

  // Add this useEffect to monitor state changes
  useEffect(() => {
    console.log("=== AUTH STATE CHANGED ===");
    console.log("User:", user);
    console.log("Token:", token);
    console.log("Loading:", loading);
  }, [user, token, loading]);

  const login = async (email, password) => {
    try {
      console.log("AuthContext: Calling API login");
      const response = await authAPI.login({ email, password });
      console.log("AuthContext: API response:", response.data);
      
      const { token: newToken, user: newUser } = response.data;
      
      console.log("AuthContext: Setting token and user");
      console.log("Token:", newToken);
      console.log("User:", newUser);
      
      // Set state first
      setToken(newToken);
      setUser(newUser);
      
      // Then save to localStorage
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(newUser));
      
      console.log("AuthContext: Token and user saved");
      console.log("Saved to localStorage - token:", localStorage.getItem("token"));
      console.log("Saved to localStorage - user:", localStorage.getItem("user"));
      
      return { success: true, user: newUser };
    } catch (error) {
      console.error("AuthContext: Login error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

const register = async (userData) => {
  try {
    console.log("=== REGISTER START ===");
    console.log("User data being sent:", userData);
    
    const response = await authAPI.signup(userData);
    
    console.log("=== REGISTER RESPONSE ===");
    console.log("Full response:", response);
    console.log("Response data:", response.data);
    
    const { token: newToken, user: newUser } = response.data;
    
    console.log("Token received:", newToken);
    console.log("User received:", newUser);
    
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    
    console.log("Registration successful!");
    return { success: true, user: newUser };
    
  } catch (error) {
    console.error("=== REGISTER ERROR ===");
    console.error("Error object:", error);
    console.error("Error response:", error.response);
    console.error("Error message:", error.response?.data?.message);
    console.error("Error data:", error.response?.data);
    
    return {
      success: false,
      message: error.response?.data?.message || "Registration failed",
    };
  }
};

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getProfile();
      const updatedUser = response.data.user;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};