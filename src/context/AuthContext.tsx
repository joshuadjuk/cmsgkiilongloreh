import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AUTH_URL = 'https://gereja.eternity.my.id/api-gkii/auth.php';

export type UserRole = 'admin' | 'bendahara' | 'sekretaris';

export interface AuthUser {
  id: number;
  username: string;
  nama_lengkap: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [token, setToken]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session dari localStorage saat app pertama load
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser  = localStorage.getItem('auth_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<AuthUser> => {
    const res = await fetch(AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok || data.status !== 'success') {
      throw new Error(data.message || 'Login gagal.');
    }

    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user as AuthUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token && !!user,
      isLoading,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
