'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

interface Admin {
  id: string;
}

interface SessionContextType {
  admin: Admin | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get('/api/admin/check-session', {
        withCredentials: true,
      });
      setAdmin(response.data.user.id);
    } catch (error) {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await axios.post(
      '/api/admin/auth/login',
      { email, password },
      { withCredentials: true }
    );
    setAdmin(response.data);
  };

  const logout = async () => {
    await axios.post('/api/admin/auth/logout', {}, { withCredentials: true });
    setAdmin(null);
  };

  return (
    <SessionContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
} 