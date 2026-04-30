import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { isLoggedIn, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ padding: 24 }}>Checking access...</div>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/" replace state={{ loginRequired: true, from: `${location.pathname}${location.search}` }} />;
  }

  return <>{children}</>;
};

export const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const { isAdmin, isLoggedIn, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ padding: 24 }}>Checking access...</div>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/" replace state={{ loginRequired: true, from: `${location.pathname}${location.search}` }} />;
  }

  if (!isAdmin) {
    return <div style={{ padding: 24 }}>You do not have permission to view this page.</div>;
  }

  return <>{children}</>;
};
