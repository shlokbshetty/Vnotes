import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import GoogleAuthCallback from './GoogleAuthCallback';
import { AuthProvider } from '../contexts/AuthContext';

/**
 * Tests for GoogleAuthCallback component
 * Validates OAuth callback handling, code exchange, token storage, and state verification
 * Requirements: 1.2, 1.9, 1.10, 8.5, 8.6, 9.8
 */

describe('GoogleAuthCallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (initialRoute: string = '/auth/callback?code=test&state=test') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <AuthProvider>
          <Routes>
            <Route path="/auth/callback" element={<GoogleAuthCallback />} />
            <Route path="/library" element={<div>Library Page</div>} />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
  };

  it('displays loading state while processing callback', () => {
    sessionStorage.setItem('oauth_state', 'test');
    (globalThis.fetch as any).mockImplementation(() => new Promise(() => {}));

    renderWithRouter();
    expect(screen.getByText('Signing you in...')).toBeInTheDocument();
  });

  it('handles missing authorization code gracefully', async () => {
    sessionStorage.setItem('oauth_state', 'test');
    renderWithRouter('/auth/callback?state=test');

    await waitFor(() => {
      expect(screen.getByText('Google sign-in failed. Please try again.')).toBeInTheDocument();
    });
  });

  it('redirects to login when user cancels OAuth flow', async () => {
    renderWithRouter('/auth/callback?error=access_denied');

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  it('handles OAuth error parameter', async () => {
    sessionStorage.setItem('oauth_state', 'test');
    renderWithRouter('/auth/callback?error=invalid_scope');

    await waitFor(() => {
      expect(screen.getByText('Google sign-in failed. Please try again.')).toBeInTheDocument();
    });
  });

  it('rejects request with mismatched CSRF state', async () => {
    sessionStorage.setItem('oauth_state', 'valid-state');
    renderWithRouter('/auth/callback?code=test-code&state=invalid-state');

    await waitFor(() => {
      expect(screen.getByText('Google sign-in failed. Please try again.')).toBeInTheDocument();
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });
  });

  it('exchanges authorization code for session token', async () => {
    sessionStorage.setItem('oauth_state', 'test');
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        sessionToken: 'test-token',
        user: {
          user_id: 'test-user',
          email: 'test@example.com',
          name: 'Test User',
        },
      }),
    });

    renderWithRouter();

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/oauth'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ code: 'test' }),
        })
      );
    });
  });

  it('stores session token on successful exchange', async () => {
    sessionStorage.setItem('oauth_state', 'test');
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        sessionToken: 'test-token',
        user: { user_id: 'test-user', email: 'test@example.com', name: 'Test User' },
      }),
    });

    renderWithRouter();

    await waitFor(() => {
      expect(localStorage.getItem('vnotes_session_token')).toBe('test-token');
    });
  });

  it('redirects to library page on success', async () => {
    sessionStorage.setItem('oauth_state', 'test');
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        sessionToken: 'test-token',
        user: { user_id: 'test-user', email: 'test@example.com', name: 'Test User' },
      }),
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Library Page')).toBeInTheDocument();
    });
  });

  it('handles failed token exchange', async () => {
    sessionStorage.setItem('oauth_state', 'test');
    (globalThis.fetch as any).mockResolvedValueOnce({ ok: false });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Google sign-in failed. Please try again.')).toBeInTheDocument();
    });
  });

  it('handles network errors', async () => {
    sessionStorage.setItem('oauth_state', 'test');
    (globalThis.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Google sign-in failed. Please try again.')).toBeInTheDocument();
    });
  });
});
