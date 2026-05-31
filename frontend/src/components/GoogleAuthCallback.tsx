/**
 * GoogleAuthCallback Component
 * Handles the OAuth redirect callback from Google.
 * Extracts the authorization code, verifies CSRF state,
 * exchanges the code for a session token, and redirects the user.
 *
 * Requirements: 1.2, 1.9, 1.10, 8.5, 8.6, 9.8
 */

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { OAuthResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const GoogleAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'processing' | 'error'>('processing');

  useEffect(() => {
    const handleCallback = async () => {
      // Requirement 8.5: Handle user cancellation gracefully
      // Google returns an "error" param when the user cancels or an error occurs
      const errorParam = searchParams.get('error');
      if (errorParam) {
        // If the user cancelled, redirect to login without showing an error message
        if (errorParam === 'access_denied') {
          navigate('/login', { replace: true });
          return;
        }
        // Other OAuth errors
        setError('Google sign-in failed. Please try again.');
        setStatus('error');
        return;
      }

      // Extract authorization code from URL (Requirement 1.2)
      const code = searchParams.get('code');
      if (!code) {
        setError('Google sign-in failed. Please try again.');
        setStatus('error');
        return;
      }

      // Extract and verify CSRF state parameter (Requirement 10.2 / 8.6 CSRF protection)
      const stateParam = searchParams.get('state');
      const storedState = sessionStorage.getItem('oauth_state');

      // Clean up state from sessionStorage regardless of outcome
      sessionStorage.removeItem('oauth_state');

      if (!stateParam || !storedState || stateParam !== storedState) {
        setError('Google sign-in failed. Please try again.');
        setStatus('error');
        return;
      }

      try {
        // Send authorization code to backend (Requirement 1.2, 1.9)
        const response = await fetch(`${API_BASE_URL.replace('/api', '')}/auth/oauth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('OAuth exchange failed:', errorData);
          setError('Google sign-in failed. Please try again.');
          setStatus('error');
          return;
        }

        const data: OAuthResponse = await response.json();

        if (!data.success || !data.sessionToken || !data.user) {
          setError('Google sign-in failed. Please try again.');
          setStatus('error');
          return;
        }

        // Store token and update auth context (Requirements 1.10, 8.4)
        login(data.sessionToken, data.user);

        // Redirect to main application on success (Requirement 2.7)
        navigate('/library', { replace: true });
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError('Google sign-in failed. Please try again.');
        setStatus('error');
      }
    };

    handleCallback();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redirect to login on error after a short delay so the user sees the message
  useEffect(() => {
    if (status === 'error') {
      const timer = setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  if (status === 'error') {
    return (
      <div className="bg-background text-on-surface font-body-md flex h-screen items-center justify-center">
        <div className="bg-surface p-8 rounded-xl border border-outline-variant note-card-shadow text-center max-w-sm w-full mx-4">
          <span className="material-symbols-outlined text-5xl text-error mb-4 block">error_outline</span>
          <p className="text-on-surface mb-2">
            {error}
          </p>
          <p className="text-on-surface-variant text-sm">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface font-body-md flex h-screen items-center justify-center">
      <div className="bg-surface p-8 rounded-xl border border-outline-variant note-card-shadow text-center max-w-sm w-full mx-4">
        <div className="inline-block w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-on-surface">Signing you in...</p>
      </div>
    </div>
  );
};

export default GoogleAuthCallback;
