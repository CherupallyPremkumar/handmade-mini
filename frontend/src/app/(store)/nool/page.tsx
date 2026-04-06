'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { formatINR, formatFabric, formatWeave } from '@/lib/format';

const API = process.env.NEXT_PUBLIC_API_URL || '';

interface Product {
  id: string;
  name: string;
  sellingPrice: number;
  mrp: number;
  images: string[];
  videoUrl: string | null;
  color: string;
  fabric: string;
  weaveType: string;
  description: string;
  stock: number;
  lengthMeters: number;
  blousePiece: boolean;
}

export default function NoolPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    fetch(`${API}/api/products`, { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then((data: Product[]) => {
        const withVideo = data.filter((p) => p.videoUrl);
        setProducts(withVideo);
      })
      .catch((err) => console.error('Nool fetch failed:', err))
      .finally(() => setLoading(false));
  }, []);

  // Play active video, pause others
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      v.muted = muted;
      if (i === activeIndex) {
        v.play().catch(() => {});
      } else {
        v.pause();
        v.currentTime = 0;
      }
    });
  }, [activeIndex, muted]);

  // Snap scroll observer
  const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const idx = Number(entry.target.getAttribute('data-index'));
        if (!isNaN(idx)) setActiveIndex(idx);
      }
    });
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(observerCallback, {
      root: container,
      threshold: 0.6,
    });

    container.querySelectorAll('[data-index]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [products, observerCallback]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bark flex items-center justify-center">
        <div className="animate-pulse text-cream/40 font-ui text-sm">Loading Nool...</div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-bark flex items-center justify-center text-center">
        <div>
          <p className="text-cream/60 font-display text-xl mb-4">No Nool videos yet</p>
          <Link href="/sarees" className="btn-gold">Browse Collection</Link>
        </div>
      </div>
    );
  }

  const current = products[activeIndex];
  const discount = current && current.mrp > current.sellingPrice
    ? Math.round(((current.mrp - current.sellingPrice) / current.mrp) * 100)
    : 0;

  return (
    <div className="h-[calc(100vh-4rem)] bg-bark flex flex-col overflow-hidden">
      {/* Tap to unmute overlay */}
      {muted && products.length > 0 && (
        <button
          onClick={() => setMuted(false)}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-black/70 backdrop-blur-sm text-white font-ui text-sm rounded-full flex items-center gap-2 animate-pulse"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
          Tap to unmute
        </button>
      )}
      {/* Main: Desktop = scrollable video left + sticky details right */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Vertical scroll reel feed — 9:16 ratio */}
        <div className="flex-1 md:w-[65%] md:flex-none flex items-center justify-center bg-black">
          <div
            ref={scrollRef}
            className="h-full aspect-[9/16] max-h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: 'none' }}
          >
          {products.map((p, i) => (
            <div
              key={p.id}
              data-index={i}
              className="h-full snap-start snap-always relative bg-black"
            >
              {/* Video */}
              <video
                ref={(el) => { videoRefs.current[i] = el; }}
                src={p.videoUrl!}
                poster={p.images && p.images.length > 0 ? p.images[0] : undefined}
                className="absolute inset-0 w-full h-full object-cover z-[5]"
                loop
                playsInline
                muted={muted}
                preload={Math.abs(i - activeIndex) <= 1 ? 'auto' : 'none'}
              />

              {/* Loading spinner (behind video) */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              </div>

              {/* Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none z-10" />

              {/* Mute button */}
              <button
                onClick={() => setMuted(!muted)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 border border-white/30"
              >
                {muted ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                )}
              </button>


              {/* Mobile: product overlay */}
              <div className="md:hidden absolute bottom-0 left-0 right-0 p-4 z-20">
                <p className="font-display text-sm font-semibold text-white mb-2">{p.name}</p>
                <Link
                  href={`/sarees/${p.id}`}
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-lg p-2.5"
                >
                  {p.images?.[0] && (
                    <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="font-ui text-sm font-bold text-gold">{formatINR(p.sellingPrice)}</span>
                    {p.mrp > p.sellingPrice && (
                      <span className="font-ui text-xs text-white/40 line-through ml-2">{formatINR(p.mrp)}</span>
                    )}
                  </div>
                  <span className="px-2.5 py-1 bg-gold text-bark font-ui text-xs font-bold rounded">SHOP</span>
                </Link>
              </div>

              {/* Right side action buttons (mobile) */}
              <div className="md:hidden absolute right-3 bottom-28 z-20 flex flex-col items-center gap-5">
                <Link href={`/sarees/${p.id}`} className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <span className="font-ui text-[10px] text-white/80">Shop</span>
                </Link>
              </div>
            </div>
          ))}
          </div>
        </div>

        {/* RIGHT: Product details (desktop only) */}
        {current && (
          <div className="hidden md:flex md:w-[35%] items-center justify-center px-6 overflow-y-auto overscroll-contain bg-bark" onWheel={(e) => e.stopPropagation()}>
            <div className="max-w-md w-full py-8">
              {/* Images */}
              {current.images && current.images.length > 0 && (
                <div className="flex gap-2 mb-6">
                  {current.images.map((img, i) => (
                    <img key={i} src={img} alt={`${current.name} ${i + 1}`} className="w-20 h-20 rounded-lg object-cover border-2 border-cream-deep/20" />
                  ))}
                </div>
              )}

              <h2 className="font-display text-2xl font-bold text-cream mb-2">{current.name}</h2>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="font-display text-3xl font-bold text-gold">{formatINR(current.sellingPrice)}</span>
                {current.mrp > current.sellingPrice && (
                  <>
                    <span className="font-ui text-lg text-cream/40 line-through">{formatINR(current.mrp)}</span>
                    <span className="px-2 py-0.5 bg-maroon text-cream font-ui text-xs font-bold rounded">{discount}% OFF</span>
                  </>
                )}
              </div>

              <p className="font-body text-sm text-cream/60 leading-relaxed mb-6">{current.description}</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-cream/5 rounded-lg p-3">
                  <p className="font-ui text-[10px] uppercase tracking-wider text-cream/40 mb-1">Fabric</p>
                  <p className="font-ui text-sm text-cream">{formatFabric(current.fabric)}</p>
                </div>
                <div className="bg-cream/5 rounded-lg p-3">
                  <p className="font-ui text-[10px] uppercase tracking-wider text-cream/40 mb-1">Weave</p>
                  <p className="font-ui text-sm text-cream">{formatWeave(current.weaveType)}</p>
                </div>
                <div className="bg-cream/5 rounded-lg p-3">
                  <p className="font-ui text-[10px] uppercase tracking-wider text-cream/40 mb-1">Color</p>
                  <p className="font-ui text-sm text-cream">{current.color}</p>
                </div>
                <div className="bg-cream/5 rounded-lg p-3">
                  <p className="font-ui text-[10px] uppercase tracking-wider text-cream/40 mb-1">Length</p>
                  <p className="font-ui text-sm text-cream">{current.lengthMeters}m {current.blousePiece ? '+ blouse' : ''}</p>
                </div>
              </div>

              {current.stock <= 5 && (
                <p className="font-ui text-xs text-terracotta mb-4">Only {current.stock} left in stock</p>
              )}

              <Link href={`/sarees/${current.id}`} className="btn-primary w-full text-center block">
                View Product & Buy
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
