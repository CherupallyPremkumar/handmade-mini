'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || '';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      if (res.ok) { setSuccess(true); }
      else { const err = await res.json().catch(() => null); setError(err?.error || 'Reset failed'); }
    } catch { setError('Network error'); }
    finally { setLoading(false); }
  }

  if (!token) {
    return (
      <div className="text-center py-8">
        <p className="font-ui text-bark-light">Invalid reset link. No token provided.</p>
        <Link href="/forgot-password" className="btn-primary inline-block mt-4">Request New Link</Link>
      </div>
    );
  }

  return success ? (
    <div className="text-center py-4">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="font-display text-xl font-bold text-bark mb-2">Password Reset!</h2>
      <p className="font-ui text-sm text-bark-light/70 mb-4">Your password has been updated successfully.</p>
      <Link href="/login" className="btn-primary inline-block px-8">Login</Link>
    </div>
  ) : (
    <>
      <h1 className="font-display text-2xl font-bold text-bark text-center mb-6">Set New Password</h1>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 font-ui text-sm rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="input-label">New Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="At least 6 characters" autoFocus />
        </div>
        <div>
          <label className="input-label">Confirm Password</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className="input-field" placeholder="Re-enter password" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-xl font-semibold text-bark">Dhanunjaiah Handlooms</Link>
        </div>
        <div className="bg-white border border-cream-deep/60 p-8 shadow-sm">
          <Suspense fallback={<div className="w-12 h-12 mx-auto border-4 border-gold/30 border-t-gold rounded-full animate-spin" />}>
            <ResetPasswordContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
