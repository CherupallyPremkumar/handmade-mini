'use client';

import { useState, useEffect } from 'react';
import { authFetch } from '@/lib/auth-store';

const API = process.env.NEXT_PUBLIC_API_URL || '';

interface Review {
  id: string;
  productId: string;
  reviewerName: string;
  rating: number;
  title: string;
  comment: string;
  isVerified: boolean;
  isApproved: boolean;
  createdTime: string;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={`w-4 h-4 ${i <= rating ? 'text-gold fill-gold' : 'text-bark-light/20'}`} viewBox="0 0 24 24" fill={i <= rating ? 'currentColor' : 'none'} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [pending, setPending] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const res = await authFetch(`${API}/api/admin/reviews/pending`);
    if (res.ok) setPending(await res.json());
    setLoading(false);
  }

  async function approve(id: string) {
    setPending(prev => prev.filter(r => r.id !== id));
    await authFetch(`${API}/api/admin/reviews/${id}/approve`, { method: 'PATCH' });
  }

  async function reject(id: string) {
    if (!confirm('Reject and delete this review?')) return;
    setPending(prev => prev.filter(r => r.id !== id));
    await authFetch(`${API}/api/admin/reviews/${id}`, { method: 'DELETE' });
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-bark mb-1">Reviews</h1>
      <p className="font-ui text-sm text-bark-light/60 mb-6">{pending.length} pending approval</p>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="animate-pulse bg-cream-deep/50 h-24 rounded-xl" />)}</div>
      ) : pending.length === 0 ? (
        <div className="bg-white border border-cream-deep/60 p-12 text-center">
          <svg className="w-12 h-12 mx-auto text-sage/40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-display text-lg font-semibold text-bark mb-1">All caught up!</p>
          <p className="font-body text-bark-light">No reviews waiting for approval.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map(r => (
            <div key={r.id} className="bg-white border border-cream-deep/60 p-5 rounded-lg">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <Stars rating={r.rating} />
                    <span className="font-ui text-sm font-medium text-bark">{r.reviewerName || 'Anonymous'}</span>
                    {r.isVerified && (
                      <span className="font-ui text-[10px] px-1.5 py-0.5 bg-green-50 text-green-700 rounded">Verified Purchase</span>
                    )}
                    <span className="font-ui text-xs text-bark-light/40">
                      {new Date(r.createdTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  {r.title && <p className="font-ui text-sm font-semibold text-bark mb-1">{r.title}</p>}
                  {r.comment && <p className="font-body text-sm text-bark-light leading-relaxed">{r.comment}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => approve(r.id)}
                    className="px-3 py-1.5 bg-sage text-white text-xs font-ui rounded-lg hover:bg-sage/80 transition-colors">
                    Approve
                  </button>
                  <button onClick={() => reject(r.id)}
                    className="px-3 py-1.5 border border-red-200 text-red-500 text-xs font-ui rounded-lg hover:bg-red-50 transition-colors">
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
