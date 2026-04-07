'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth-store';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoggedIn } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    if (isLoggedIn && useAuthStore.getState().user?.emailVerified) {
      router.replace('/');
    }
  }, [isLoggedIn, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      setRegistered(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4 py-12">
      {/* Decorative background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.03]"
          style={{
            background: 'radial-gradient(circle, var(--gold) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full opacity-[0.04]"
          style={{
            background: 'radial-gradient(circle, var(--maroon) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block group">
            <div className="relative w-14 h-14 mx-auto mb-3">
              <div
                className="absolute inset-0 rounded-full border-2 border-gold group-hover:border-maroon transition-colors duration-300"
                style={{
                  background:
                    'conic-gradient(from 180deg, var(--maroon), var(--gold), var(--maroon))',
                  mask: 'radial-gradient(circle, transparent 55%, black 56%)',
                  WebkitMask:
                    'radial-gradient(circle, transparent 55%, black 56%)',
                }}
              />
              <span className="absolute inset-0 flex items-center justify-center font-display text-xl font-bold text-maroon">
                D
              </span>
            </div>
            <p className="font-display text-xl font-semibold text-bark">
              Dhanunjaiah Handlooms
            </p>
          </Link>
          <div className="gold-divider mt-3" />
        </div>

        {/* Card */}
        <div className="bg-white border border-cream-deep/60 p-8 sm:p-10 shadow-sm">
          {registered ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="font-display text-xl font-bold text-bark mb-2">Check Your Email</h2>
              <p className="font-ui text-sm text-bark-light/70 mb-4">
                We&apos;ve sent a verification link to <strong>{email}</strong>. Please click the link to verify your account.
              </p>
              <p className="font-ui text-xs text-bark-light/50 mb-6">
                The link expires in 24 hours. Check your spam folder if you don&apos;t see it.
              </p>
              <button
                onClick={async () => {
                  try {
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/resend-verification`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email }),
                    });
                    setError('');
                    alert('Verification email resent!');
                  } catch {
                    setError('Failed to resend email');
                  }
                }}
                className="text-maroon font-medium text-sm hover:text-maroon-deep transition-colors"
              >
                Resend verification email
              </button>
              <div className="mt-4">
                <Link href="/login" className="btn-primary inline-block px-6">
                  Go to Login
                </Link>
              </div>
            </div>
          ) : (
          <>
          <h1 className="font-display text-2xl font-bold text-bark text-center mb-1">
            Create Account
          </h1>
          <p className="font-ui text-sm text-bark-light/60 text-center mb-8">
            Sign up to track orders and get updates
          </p>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 font-ui text-sm rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="input-label">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Your full name"
                autoComplete="name"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="reg-email" className="input-label">
                Email Address
              </label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="reg-password" className="input-label">
                Password
              </label>
              <input
                id="reg-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="input-label">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="Re-enter your password"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="font-ui text-sm text-bark-light/60">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-maroon font-medium hover:text-maroon-deep transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
          </>
          )}
        </div>

        {/* Back to store */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="font-ui text-sm text-bark-light/50 hover:text-bark transition-colors inline-flex items-center gap-1.5"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to store
          </Link>
        </div>
      </div>
    </div>
  );
}
