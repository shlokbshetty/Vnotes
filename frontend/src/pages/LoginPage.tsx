/**
 * Login Page - Editorial Design
 * Clean, minimal authentication interface with Google OAuth
 */

import { useState } from 'react';

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = () => {
    setError(null);
    setIsLoading(true);

    try {
      const clientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;

      if (!clientId) {
        setError('Google sign-in failed. Please try again.');
        setIsLoading(false);
        return;
      }

      const state = crypto.randomUUID();
      sessionStorage.setItem('oauth_state', state);

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: window.location.origin + '/auth/callback',
        response_type: 'code',
        scope: 'openid email profile',
        state,
      });

      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    } catch {
      setError('Google sign-in failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen bg-neutral-950 flex items-center justify-center px-md">
      <div className="w-full max-w-sm card card-elevated p-xl space-y-lg">
        {/* Header */}
        <div className="text-center space-y-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-accent-600 mb-md">
            <span className="material-symbols-outlined text-neutral-50 text-4xl">mic</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-neutral-50">VNotes</h1>
          <p className="text-sm text-neutral-400">Sign in to access your recordings</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-md p-md bg-error bg-opacity-10 border border-error border-opacity-30 rounded-lg text-error text-sm">
            <span className="material-symbols-outlined text-base flex-shrink-0">error_outline</span>
            <span>{error}</span>
          </div>
        )}

        {/* Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-md px-lg py-md bg-accent-600 text-neutral-50 rounded-lg font-semibold text-sm hover-lift hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-neutral-50 border-t-transparent rounded-full animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </>
          )}
        </button>

        {/* Help Text */}
        <p className="text-center text-xs text-neutral-400">
          New to VNotes? This button handles both sign-up and sign-in.
        </p>
      </div>

      {/* Subtle Background Element */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent-600 opacity-5 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default LoginPage;
