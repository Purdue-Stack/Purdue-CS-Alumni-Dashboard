import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  fetchCurrentUser,
  loginWithPassword,
  logoutCurrentUser,
  type AuthUser
} from '../api/api';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  isLoggedIn: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetchCurrentUser()
      .then((response) => {
        if (isMounted) {
          setUser(response.user);
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    isLoggedIn: Boolean(user),
    isAdmin: user?.role === 'admin',
    login: async (username: string, password: string) => {
      const response = await loginWithPassword(username, password);

      if (!response.user) {
        throw new Error('Login failed');
      }

      setUser(response.user);
      return response.user;
    },
    logout: async () => {
      await logoutCurrentUser();
      setUser(null);
    }
  }), [loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
