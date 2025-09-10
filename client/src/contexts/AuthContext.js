import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
          // Verify token is still valid
          try {
            const response = await authAPI.getProfile();
            setUser(response.data);
          } catch (error) {
            // Token invalid, clear storage
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { user: userData, token } = response.data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { user: newUser, token } = response.data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      
      return { success: true, user: newUser };
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = async (userData) => {
    try {
      const response = await authAPI.updateProfile(userData);
      const updatedUser = response.data.user;
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { success: true, user: updatedUser };
    } catch (error) {
      const message = error.response?.data?.error || 'Profile update failed';
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isProducer: user?.role === 'producer' || user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};