'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const stored = localStorage.getItem('chat-auth');
    if (stored) {
      const data = JSON.parse(stored);
      setUser(data.user);
      setToken(data.token);
    }
    const savedTheme = localStorage.getItem('chat-theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  useEffect(() => {
    if (user && token) {
      localStorage.setItem('chat-auth', JSON.stringify({ user, token }));
    } else {
      localStorage.removeItem('chat-auth');
    }
  }, [user, token]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('chat-theme', theme);
  }, [theme]);

  const setAuthData = (authData) => {
    setUser(authData.user);
    setToken(authData.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, setAuthData, logout, theme, setTheme }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
