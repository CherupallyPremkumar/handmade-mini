'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import Link from 'next/link';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { isLoggedIn, isAdmin } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-cream-warm flex items-center justify-center">
        <div className="flex items-center gap-3">
          <svg
            className="w-6 h-6 text-bark-light/40 animate-spin"
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
          <span className="font-ui text-sm text-bark-light/60">Loading...</span>
        </div>
      </div>
    );
  }

  // Not logged in — show login popup
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-cream-warm">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-bark/50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white border border-cream-deep/60 shadow-xl max-w-sm w-full p-8 animate-fade-in-up">
            {/* Lock icon */}
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-cream-warm border-2 border-gold/30 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-maroon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>

            <h2 className="font-display text-xl font-bold text-bark text-center mb-2">
              Admin Login Required
            </h2>
            <p className="font-ui text-sm text-bark-light/60 text-center mb-6">
              Please sign in with your admin account to access the dashboard.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push('/login?redirect=/admin')}
                className="btn-primary w-full"
              >
                Sign In
              </button>
              <Link
                href="/"
                className="btn-outline w-full text-center"
              >
                Back to Store
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Logged in but not admin — access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-cream-warm">
        <div className="fixed inset-0 bg-bark/50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white border border-cream-deep/60 shadow-xl max-w-sm w-full p-8 animate-fade-in-up">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
            </div>

            <h2 className="font-display text-xl font-bold text-bark text-center mb-2">
              Access Denied
            </h2>
            <p className="font-ui text-sm text-bark-light/60 text-center mb-6">
              You don&apos;t have admin permissions. Only administrators can access this area.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  useAuthStore.getState().logout();
                  router.push('/login?redirect=/admin');
                }}
                className="btn-primary w-full"
              >
                Sign in as Admin
              </button>
              <Link
                href="/"
                className="btn-outline w-full text-center"
              >
                Back to Store
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
