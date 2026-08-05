import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("nexusai_user");

      if (!saved || saved === "undefined" || saved === "null") {
        return null;
      }

      return JSON.parse(saved);
    } catch (error) {
      console.error("Invalid user in localStorage:", error);
      localStorage.removeItem("nexusai_user");
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem("nexusai_token");

    if (!stored || stored === "undefined") {
      return null;
    }

    return stored;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            const user = res.data.data.user;

            setUser(user);
            localStorage.setItem(
              "nexusai_user",
              JSON.stringify(user)
            );
          }
        } catch (err) {
          console.error('Session restoration failed:', err);
          logout();
        }
      }
      setLoading(false);
    };
    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token, user } = res.data.data;

      setToken(token);
      setUser(user);

      localStorage.setItem("nexusai_token", token);
      localStorage.setItem("nexusai_user", JSON.stringify(user));
    }
    return res.data;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      const { token, user } = res.data.data;

      setToken(token);
      setUser(user);

      localStorage.setItem("nexusai_token", token);
      localStorage.setItem("nexusai_user", JSON.stringify(user));
    }
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('nexusai_token');
    localStorage.removeItem('nexusai_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
