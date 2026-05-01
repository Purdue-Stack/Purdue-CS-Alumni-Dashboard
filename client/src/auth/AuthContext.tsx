import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  fetchAuthConfig,
  fetchCurrentUser,
  loginWithPassword,
  logoutCurrentUser,
  type AuthConfigResponse,
  type AuthUser
} from '../api/api';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  authMode: AuthConfigResponse['authMode'];
  localLoginEnabled: boolean;
  samlConfigured: boolean;
  beginSamlLogin: (redirectTo?: string) => void;
  login: (username: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  isLoggedIn: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authConfig, setAuthConfig] = useState<AuthConfigResponse>({
    authMode: 'local',
    localLoginEnabled: true,
    samlConfigured: false,
    samlMetadataConfigured: false,
    samlLoginPath: '/api/auth/saml/login'
  });

  useEffect(() => {
    let isMounted = true;

    Promise.allSettled([fetchAuthConfig(), fetchCurrentUser()])
      .then(([configResult, userResult]) => {
        if (!isMounted) {
          return;
        }

        if (configResult.status === 'fulfilled') {
          setAuthConfig(configResult.value);
        }

        if (userResult.status === 'fulfilled') {
          setUser(userResult.value.user);
          return;
        }

        setUser(null);
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
    authMode: authConfig.authMode,
    localLoginEnabled: authConfig.localLoginEnabled,
    samlConfigured: authConfig.samlConfigured,
    isLoggedIn: Boolean(user),
    isAdmin: user?.role === 'admin',
    beginSamlLogin: (redirectTo?: string) => {
      const nextPath =
        redirectTo ??
        `${window.location.pathname}${window.location.search}${window.location.hash}`;

      const samlLoginUrl = new URL(authConfig.samlLoginPath, window.location.origin);
      samlLoginUrl.searchParams.set('redirect', nextPath);
      window.location.assign(samlLoginUrl.toString());
    },
    login: async (username: string, password: string) => {
      if (!authConfig.localLoginEnabled) {
        throw new Error('Password login is disabled in the current auth mode.');
      }

      const response = await loginWithPassword(username.trim(), password.trim());

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
  }), [authConfig, loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
