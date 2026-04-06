'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { formatINR, formatFabric, formatWeave } from '@/lib/format';

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
  weaveType: string;
  description: string;
  stock: number;
  lengthMeters: number;
  blousePiece: boolean;
}

export default function NoolPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(true);
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
        v.muted = muted;
        v.play().catch(() => {});
      } else {
        v.pause();
        v.currentTime = 0;
      }
    });
  }, [currentIndex, muted]);

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
  const discount = current.mrp > current.sellingPrice
    ? Math.round(((current.mrp - current.sellingPrice) / current.mrp) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-bark flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/" className="font-ui text-sm text-cream/60 hover:text-cream flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="hidden sm:inline">Back to store</span>
        </Link>
        <h1 className="font-display text-lg font-bold text-cream">Nool</h1>
        <button
          onClick={() => setMuted(!muted)}
          className="font-ui text-xs text-cream/60 hover:text-cream flex items-center gap-1"
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
          <span className="hidden sm:inline">{muted ? 'Unmute' : 'Mute'}</span>
        </button>
      </div>

      {/* Main content: Desktop = video left + details right, Mobile = video only */}
      <div className="flex-1 flex items-center justify-center px-4 pb-4">
        <div className="w-full max-w-5xl mx-auto md:flex md:gap-8 md:items-center">

          {/* LEFT: Video player */}
          <div className="w-full md:w-[360px] md:shrink-0 mx-auto md:mx-0">
            <div className="relative w-full max-w-sm mx-auto aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl">
              <video
                ref={(el) => { videoRefs.current[currentIndex] = el; }}
                key={current.id}
                src={current.videoUrl!}
                poster={current.images?.[0] || undefined}
                className="absolute inset-0 w-full h-full object-cover z-10"
                loop
                playsInline
                muted={muted}
                autoPlay
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

              {/* Nav arrows */}
              {currentIndex > 0 && (
                <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white/80 hover:bg-black/60">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              {currentIndex < products.length - 1 && (
                <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white/80 hover:bg-black/60">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}

              {/* Mobile: product overlay at bottom */}
              <div className="md:hidden absolute bottom-0 left-0 right-0 p-4">
                <Link
                  href={`/sarees/${current.id}`}
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-lg p-3"
                >
                  {current.images?.[0] && (
                    <img src={current.images[0]} alt={current.name} className="w-12 h-12 rounded object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-ui text-sm font-medium text-white truncate">{current.name}</p>
                    <span className="font-ui text-sm font-bold text-gold">{formatINR(current.sellingPrice)}</span>
                  </div>
                  <span className="px-3 py-1.5 bg-gold text-bark font-ui text-xs font-bold rounded">SHOP</span>
                </Link>
              </div>

              {/* Progress dots */}
              <div className="absolute top-3 left-3 right-3 flex gap-1">
                {products.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-1 flex-1 rounded-full transition-colors ${i === currentIndex ? 'bg-white' : 'bg-white/30'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Product details (desktop only) */}
          <div className="hidden md:flex flex-col flex-1 justify-center">
            <div className="max-w-md">
              {/* Product images */}
              {current.images?.length > 0 && (
                <div className="flex gap-2 mb-6 overflow-x-auto">
                  {current.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`${current.name} ${i + 1}`}
                      className="w-20 h-20 rounded-lg object-cover border-2 border-cream-deep/20"
                    />
                  ))}
                </div>
              )}

              {/* Name */}
              <h2 className="font-display text-2xl font-bold text-cream mb-2">
                {current.name}
              </h2>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="font-display text-3xl font-bold text-gold">
                  {formatINR(current.sellingPrice)}
                </span>
                {current.mrp > current.sellingPrice && (
                  <>
                    <span className="font-ui text-lg text-cream/40 line-through">
                      {formatINR(current.mrp)}
                    </span>
                    <span className="px-2 py-0.5 bg-maroon text-cream font-ui text-xs font-bold rounded">
                      {discount}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="font-body text-sm text-cream/60 leading-relaxed mb-6">
                {current.description}
              </p>

              {/* Details */}
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

              {/* Stock */}
              {current.stock <= 5 && (
                <p className="font-ui text-xs text-terracotta mb-4">
                  Only {current.stock} left in stock
                </p>
              )}

              {/* CTA */}
              <Link
                href={`/sarees/${current.id}`}
                className="btn-primary w-full text-center block"
              >
                View Product & Buy
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="h-4" />
    </div>
  );
}
