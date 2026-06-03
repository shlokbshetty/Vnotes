/**
 * ProtectedRoute component
 * Redirects unauthenticated users to /login.
 * Renders child routes (via Outlet) or explicit children when authenticated.
 * Requirements: 3.10
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Support both <Outlet /> (nested route) and explicit children patterns
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
