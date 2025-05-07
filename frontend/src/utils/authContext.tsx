"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Update API_URL to use the environment variable with proper fallback value
// Add a new development flag to easily switch between remote and local endpoints
const isDevelopmentMode = process.env.NEXT_PUBLIC_USE_LOCAL_API === 'true';
const API_URL = isDevelopmentMode 
  ? 'http://localhost:3001/api'
  : `${process.env.NEXT_PUBLIC_API_URL || "https://omvad-group-assignment-backend.onrender.com"}/api`;

type User = {
  id: number;
  email: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for token in localStorage
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      fetchCurrentUser(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps
  // The dependency is intentionally empty as we only want to run this on mount

  const fetchCurrentUser = async (authToken: string) => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setUser(response.data.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      setUser(response.data.user);
      setToken(response.data.token);
      localStorage.setItem("token", response.data.token);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("Attempting to register with:", API_URL);
      const response = await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
      }, {
        // Setting a timeout and adding additional config
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      console.log("Registration successful:", response.data);
      setUser(response.data.user);
      setToken(response.data.token);
      localStorage.setItem("token", response.data.token);
    } catch (error: unknown) {
      // Enhanced error logging
      if (axios.isAxiosError(error)) {
        console.error("Registration error details:", {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
            timeout: error.config?.timeout
          }
        });
      } else {
        console.error("Non-Axios error during registration:", error);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
