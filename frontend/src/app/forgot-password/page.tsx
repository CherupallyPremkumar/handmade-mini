'use client';

import { useState } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || '';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/api/auth/forgot-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) { setSent(true); }
      else { const err = await res.json().catch(() => null); setError(err?.error || 'Failed to send reset email'); }
    } catch { setError('Network error'); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-xl font-semibold text-bark">Dhanunjaiah Handlooms</Link>
        </div>
        <div className="bg-white border border-cream-deep/60 p-8 shadow-sm">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="font-display text-xl font-bold text-bark mb-2">Check Your Email</h2>
              <p className="font-ui text-sm text-bark-light/70">We sent a password reset link to <strong>{email}</strong>. The link expires in 1 hour.</p>
              <Link href="/login" className="btn-primary inline-block mt-6 px-6">Back to Login</Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold text-bark text-center mb-2">Forgot Password</h1>
              <p className="font-ui text-sm text-bark-light/60 text-center mb-6">Enter your email and we'll send you a reset link.</p>
              {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 font-ui text-sm rounded">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="input-label">Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" autoFocus />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
              <div className="mt-4 text-center">
                <Link href="/login" className="font-ui text-sm text-maroon hover:text-maroon-deep">Back to Login</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
