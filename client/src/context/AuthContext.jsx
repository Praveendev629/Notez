import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);
const USER_KEY = 'notez.user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Session persistence: re-validate the (cookie-based) session on mount.
  const bootstrap = useCallback(async () => {
    // Only try to validate session if we have a user in localStorage
    const storedUser = localStorage.getItem(USER_KEY);
    if (!storedUser) {
      setLoading(false);
      return;
    }

    try {
      const { user: me } = await Promise.race([
        api.me(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      ]);
      setUser(me);
      localStorage.setItem(USER_KEY, JSON.stringify(me));
    } catch {
      setUser(null);
      localStorage.removeItem(USER_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = async (data) => {
    const { user: u } = await api.login(data);
    setUser(u);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    return u;
  };

  const register = async (data) => {
    const { user: u } = await api.register(data);
    setUser(u);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    return u;
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
      localStorage.removeItem(USER_KEY);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}