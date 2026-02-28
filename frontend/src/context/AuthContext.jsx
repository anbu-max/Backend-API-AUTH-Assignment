import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role, adminCode) => {
    try {
      const response = await api.post('/auth/login', { email, password, role, adminCode });
      const { data } = response.data;
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      if (error.response) {
        const status = error.response.status;
        if (status === 503) {
          errorMessage = '⚠️ Cannot connect to the database. Please try again in a moment.';
        } else {
          errorMessage = error.response.data?.error?.message || errorMessage;
        }
      } else if (error.request) {
        errorMessage = '🔴 Network error: Cannot reach the server. Is the backend running?';
      }
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { data } = response.data;
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (error) {
      let errorMessage = 'Registration failed. Please try again.';
      if (error.response) {
        const status = error.response.status;
        if (status === 503) {
          errorMessage = '⚠️ Cannot connect to the database. Please try again in a moment.';
        } else {
          errorMessage = error.response.data?.error?.message || errorMessage;
        }
      } else if (error.request) {
        errorMessage = '🔴 Network error: Cannot reach the server. Is the backend running?';
      }
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
