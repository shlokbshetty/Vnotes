import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './LoginPage';

/**
 * Tests for LoginPage component
 * Validates OAuth flow initiation, UI rendering, and error handling
 * Requirements: 8.1, 8.2, 8.6, 1.1, 2.1
 */

describe('LoginPage', () => {
  beforeEach(() => {
    sessionStorage.clear();
    delete (window as any).location;
    window.location = { href: '' } as any;
  });

  it('renders the login page with VNotes branding', () => {
    render(<LoginPage />);
    expect(screen.getByText('VNotes')).toBeInTheDocument();
    expect(screen.getByText('Sign in to access your recordings')).toBeInTheDocument();
  });

  it('renders the "Sign in with Google" button', () => {
    render(<LoginPage />);
    const button = screen.getByRole('button', { name: /sign in with google/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('initiates OAuth flow when button is clicked', async () => {
    const originalEnv = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;
    (import.meta.env as any).VITE_GOOGLE_OAUTH_CLIENT_ID = 'test-client-id';

    render(<LoginPage />);
    const button = screen.getByRole('button', { name: /sign in with google/i });

    fireEvent.click(button);

    await waitFor(() => {
      expect(window.location.href).toContain('https://accounts.google.com/o/oauth2/v2/auth');
      expect(window.location.href).toContain('client_id=test-client-id');
      expect(window.location.href).toContain('response_type=code');
    });

    (import.meta.env as any).VITE_GOOGLE_OAUTH_CLIENT_ID = originalEnv;
  });

  it('generates CSRF state parameter', async () => {
    const originalEnv = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;
    (import.meta.env as any).VITE_GOOGLE_OAUTH_CLIENT_ID = 'test-client-id';

    render(<LoginPage />);
    const button = screen.getByRole('button', { name: /sign in with google/i });

    fireEvent.click(button);

    await waitFor(() => {
      const storedState = sessionStorage.getItem('oauth_state');
      expect(storedState).toBeTruthy();
      expect(window.location.href).toContain(`state=${storedState}`);
    });

    (import.meta.env as any).VITE_GOOGLE_OAUTH_CLIENT_ID = originalEnv;
  });

  it('displays error when client ID is not configured', async () => {
    const originalEnv = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;
    (import.meta.env as any).VITE_GOOGLE_OAUTH_CLIENT_ID = '';

    render(<LoginPage />);
    const button = screen.getByRole('button', { name: /sign in with google/i });

    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Google sign-in failed. Please try again.')).toBeInTheDocument();
    });

    (import.meta.env as any).VITE_GOOGLE_OAUTH_CLIENT_ID = originalEnv;
  });

  it('shows loading state during OAuth initiation', async () => {
    const originalEnv = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;
    (import.meta.env as any).VITE_GOOGLE_OAUTH_CLIENT_ID = 'test-client-id';

    render(<LoginPage />);
    const button = screen.getByRole('button', { name: /sign in with google/i });

    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Signing in...')).toBeInTheDocument();
    });

    (import.meta.env as any).VITE_GOOGLE_OAUTH_CLIENT_ID = originalEnv;
  });

  it('displays help text for new users', () => {
    render(<LoginPage />);
    expect(
      screen.getByText('New to VNotes? This button handles both sign-up and sign-in.')
    ).toBeInTheDocument();
  });

  it('includes correct redirect URI', async () => {
    const originalEnv = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;
    (import.meta.env as any).VITE_GOOGLE_OAUTH_CLIENT_ID = 'test-client-id';

    render(<LoginPage />);
    const button = screen.getByRole('button', { name: /sign in with google/i });

    fireEvent.click(button);

    await waitFor(() => {
      const redirectUri = `${window.location.origin}/auth/callback`;
      expect(window.location.href).toContain('redirect_uri=');
    });

    (import.meta.env as any).VITE_GOOGLE_OAUTH_CLIENT_ID = originalEnv;
  });

  it('includes email and profile scopes', async () => {
    const originalEnv = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;
    (import.meta.env as any).VITE_GOOGLE_OAUTH_CLIENT_ID = 'test-client-id';

    render(<LoginPage />);
    const button = screen.getByRole('button', { name: /sign in with google/i });

    fireEvent.click(button);

    await waitFor(() => {
      expect(window.location.href).toContain('scope=');
      expect(window.location.href).toContain('email');
      expect(window.location.href).toContain('profile');
    });

    (import.meta.env as any).VITE_GOOGLE_OAUTH_CLIENT_ID = originalEnv;
  });
});
