'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { formatINR } from '@/lib/format';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8090';

interface Product {
  id: string;
  name: string;
  sellingPrice: number;
  mrp: number;
  images: string[];
  videoUrl: string | null;
  color: string;
  fabric: string;
  description: string;
}

export default function NoolPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    fetch(`${API}/api/products`)
      .then((res) => res.json())
      .then((data: Product[]) => {
        setProducts(data.filter((p) => p.videoUrl));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === currentIndex) {
        v.play().catch(() => {});
      } else {
        v.pause();
        v.currentTime = 0;
      }
    });
  }, [currentIndex]);

  function next() {
    if (currentIndex < products.length - 1) setCurrentIndex((i) => i + 1);
  }

  function prev() {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bark flex items-center justify-center">
        <div className="animate-pulse text-cream/40 font-ui text-sm">Loading Nool...</div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-bark flex items-center justify-center">
        <div className="text-center">
          <p className="text-cream/60 font-display text-xl mb-4">No Nool videos yet</p>
          <Link href="/sarees" className="btn-gold">Browse Collection</Link>
        </div>
      </div>
    );
  }

  const current = products[currentIndex];

  return (
    <div className="min-h-screen bg-bark flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/" className="font-ui text-sm text-cream/60 hover:text-cream flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to store
        </Link>
        <h1 className="font-display text-lg font-bold text-cream">Nool</h1>
        <span className="font-ui text-xs text-cream/40">{currentIndex + 1}/{products.length}</span>
      </div>

      {/* Video area */}
      <div className="flex-1 flex items-center justify-center relative px-4">
        <div className="relative w-full max-w-sm mx-auto aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl">
          <video
            ref={(el) => { videoRefs.current[currentIndex] = el; }}
            key={current.id}
            src={current.videoUrl!}
            className="absolute inset-0 w-full h-full object-cover"
            loop
            playsInline
            muted
            autoPlay
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

          {currentIndex > 0 && (
            <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white/80 hover:bg-black/60 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {currentIndex < products.length - 1 && (
            <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white/80 hover:bg-black/60 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Product info */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="font-display text-base font-semibold text-white leading-snug mb-1">
              {current.name}
            </p>
            <p className="font-body text-xs text-white/70 line-clamp-2 mb-3">
              {current.description}
            </p>

            <Link
              href={`/sarees/${current.id}`}
              className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-lg p-3 hover:bg-white/20 transition-colors"
            >
              {current.images?.[0] && (
                <img src={current.images[0]} alt={current.name} className="w-12 h-12 rounded object-cover" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-ui text-sm font-medium text-white truncate">{current.name}</p>
                <div className="flex items-center gap-2">
                  <span className="font-ui text-sm font-bold text-gold">{formatINR(current.sellingPrice)}</span>
                  {current.mrp > current.sellingPrice && (
                    <span className="font-ui text-xs text-white/40 line-through">{formatINR(current.mrp)}</span>
                  )}
                </div>
              </div>
              <span className="px-3 py-1.5 bg-gold text-bark font-ui text-xs font-bold rounded">
                SHOP
              </span>
            </Link>
          </div>

          {/* Progress dots */}
          <div className="absolute top-3 left-3 right-3 flex gap-1">
            {products.map((_, i) => (
              <div
                key={i}
                className={`h-0.5 flex-1 rounded-full transition-colors ${i === currentIndex ? 'bg-white' : 'bg-white/30'}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="h-4" />
    </div>
  );
}
