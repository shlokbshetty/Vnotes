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
    <div className="relative min-h-screen w-full flex flex-col justify-center items-center overflow-hidden bg-background text-on-background selection:bg-primary/30 font-body-md antialiased p-4">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50 dark:opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary rounded-full blur-[120px] opacity-10"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-tertiary rounded-full blur-[100px] opacity-10"></div>
      </div>

      {/* Main Content */}
      <main className="w-full max-w-[420px] px-gutter relative z-10">
        <div className="text-center mb-10">
          <h1 className="font-headline-lg text-headline-lg tracking-tight mb-2 flex items-center justify-center gap-3">
            <span className="material-symbols-outlined text-primary text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>graphic_eq</span>
            VNotes
          </h1>
          <p className="text-on-surface-variant font-body-lg text-body-lg">Precision intelligence for your voice.</p>
          <p className="text-xs text-on-surface-variant/80 mt-1 font-label-mono uppercase tracking-wider">Sign in to access your recordings</p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-surface-container-low rounded-xl p-8 glass-edge shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none space-y-6">
          {/* Error Message */}
          {error && (
            <div
              role="alert"
              className="flex items-center gap-3 rounded border border-error/30 bg-error/10 p-3 text-sm text-error"
            >
              <span className="material-symbols-outlined shrink-0 text-base" aria-hidden="true">
                error_outline
              </span>
              <span>{error}</span>
            </div>
          )}

          {/* Social Auth */}
          <div className="grid grid-cols-2 gap-stack-md">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-surface-container-high glass-edge rounded-lg hover:bg-surface-variant transition-all font-body-md text-body-md text-on-surface"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <img
                    alt="Google"
                    className="w-5 h-5"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTUwaFpcN7Mn48o1v6LX11QnlAp87hpxnpz3eNWW8NR2o7JZg2VoQIdLVdtfgfrNdlXxXm86rmgGvZV-QSFEoGzPpPvyCeQuqQNaW92RnY_pHQj71ABQBhshkhJw9AcpbpLCKHrHe7ynA2_Y7X5CJGaCMJD84EYjtuL2U8g7YtzUSHbOsrofd4oIh_ZSeJHSQme2JeZQ9EZ9cfy0gu9h9i5l8JPOY_ozzx8ywS3uwu_FnyBLh2W9Tegl8SqhJw2kukOjMJ1yVe0Is"
                  />
                  Google
                </>
              )}
            </button>
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-surface-container-high glass-edge rounded-lg hover:bg-surface-variant transition-all font-body-md text-body-md text-on-surface"
            >
              <span className="material-symbols-outlined text-[20px]">ios</span>
              Apple
            </button>
          </div>

          <p className="sr-only">
            New to VNotes? This button handles both sign-up and sign-in.
          </p>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-outline-variant/30"></div>
            <span className="flex-shrink mx-4 text-on-surface-variant font-label-mono text-label-mono uppercase tracking-widest">Or Email</span>
            <div className="flex-grow border-t border-outline-variant/30"></div>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="font-label-mono text-label-mono text-on-surface-variant ml-1 uppercase">Work Email</label>
              <input
                className="w-full px-4 py-3 bg-transparent border-b-2 border-outline-variant focus:border-primary transition-all outline-none text-body-lg font-body-lg placeholder:text-outline-variant/50 text-on-surface"
                placeholder="name@company.com"
                type="email"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="font-label-mono text-label-mono text-on-surface-variant ml-1 uppercase">Password</label>
                <a className="text-label-mono font-label-mono text-primary hover:underline" href="#">FORGOT?</a>
              </div>
              <input
                className="w-full px-4 py-3 bg-transparent border-b-2 border-outline-variant focus:border-primary transition-all outline-none text-body-lg font-body-lg placeholder:text-outline-variant/50 text-on-surface"
                placeholder="••••••••"
                type="password"
              />
            </div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-4 bg-primary-container text-on-primary-container rounded-lg font-headline-sm text-headline-sm hover:brightness-110 active:scale-[0.98] transition-all mt-4 shadow-lg shadow-primary/20"
            >
              Sign In with Google
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-on-surface-variant font-body-md text-body-md">
              Don't have a workspace?{" "}
              <a className="text-primary font-bold hover:underline" href="#" onClick={handleGoogleSignIn}>
                Create Account
              </a>
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 flex flex-col items-center gap-6 opacity-60">
          <div className="flex items-center gap-8 font-label-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
            <a className="hover:text-primary transition-colors text-xs" href="#">Privacy</a>
            <a className="hover:text-primary transition-colors text-xs" href="#">Terms</a>
            <a className="hover:text-primary transition-colors text-xs" href="#">Security</a>
          </div>

          {/* Minimal Waveform Decoration */}
          <div className="flex items-end gap-[3px] h-8 opacity-40">
            <div className="w-[2px] bg-primary opacity-20" style={{ height: "12px" }}></div>
            <div className="w-[2px] bg-primary opacity-40" style={{ height: "24px" }}></div>
            <div className="w-[2px] bg-primary opacity-60" style={{ height: "16px" }}></div>
            <div className="w-[2px] bg-primary opacity-30" style={{ height: "20px" }}></div>
            <div className="w-[2px] bg-primary opacity-80" style={{ height: "32px" }}></div>
            <div className="w-[2px] bg-primary opacity-50" style={{ height: "14px" }}></div>
            <div className="w-[2px] bg-primary opacity-90" style={{ height: "28px" }}></div>
            <div className="w-[2px] bg-primary opacity-40" style={{ height: "18px" }}></div>
            <div className="w-[2px] bg-primary opacity-20" style={{ height: "10px" }}></div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;

