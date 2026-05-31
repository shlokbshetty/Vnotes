import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { AuthContext } from '../contexts/AuthContext';
import { AuthContextType, AuthUser } from '../types';

/**
 * Tests for ProtectedRoute component
 * Validates authentication enforcement and redirection behavior
 * Requirements: 3.10
 */

describe('ProtectedRoute', () => {
  const mockUser: AuthUser = {
    user_id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockAuthenticatedContext: AuthContextType = {
    user: mockUser,
    sessionToken: 'test-token',
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
  };

  const mockUnauthenticatedContext: AuthContextType = {
    user: null,
    sessionToken: null,
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
  };

  const renderWithRoute = (authContext: AuthContextType) => {
    return render(
      <MemoryRouter initialEntries={['/protected']}>
        <AuthContext.Provider value={authContext}>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route path="/protected" element={<ProtectedRoute />}>
              <Route index element={<div>Protected Content</div>} />
            </Route>
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };

  it('renders protected content when user is authenticated', () => {
    renderWithRoute(mockAuthenticatedContext);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    renderWithRoute(mockUnauthenticatedContext);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('prevents access without authentication', () => {
    renderWithRoute(mockUnauthenticatedContext);
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('respects isAuthenticated flag from context', () => {
    const explicitlyUnauthenticated: AuthContextType = {
      user: mockUser,
      sessionToken: 'test-token',
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
    };

    renderWithRoute(explicitlyUnauthenticated);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});
