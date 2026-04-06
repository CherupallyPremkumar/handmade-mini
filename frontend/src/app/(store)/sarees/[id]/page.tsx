'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useCartStore } from '@/lib/cart-store';
import type { Saree } from '@/lib/types';
import {
  formatINR,
  discountPercent,
  formatFabric,
  formatWeave,
} from '@/lib/format';

export default function SareeDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const [saree, setSaree] = useState<Saree | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.sarees.getById(id).then(res => {
      if (res.success && res.data) {
        setSaree(res.data);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading && !saree) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="font-body text-bark-light">Loading...</p>
      </div>
    );
  }

  if (!saree) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-bark mb-2">
            Saree Not Found
          </h1>
          <p className="font-body text-bark-light mb-6">
            The saree you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/sarees" className="btn-primary">
            Browse Collection
          </Link>
        </div>
      </div>
    );
  }

  const discount = discountPercent(saree.mrpInPaisa, saree.priceInPaisa);

  function handleAddToCart() {
    if (!saree) return;
    addItem(saree, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 sm:mb-8 flex items-center gap-2 font-ui text-xs text-bark-light">
        <Link href="/" className="hover:text-maroon transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/sarees" className="hover:text-maroon transition-colors">
          Sarees
        </Link>
        <span>/</span>
        <span className="text-bark">{saree.name}</span>
      </nav>

      <div className="lg:grid lg:grid-cols-2 lg:gap-12 xl:gap-16">
        {/* ── Image/Video Gallery ── */}
        <div className="mb-8 lg:mb-0">
          {/* Main display — image or video */}
          <div className="relative aspect-[3/4] bg-cream-warm border border-cream-deep/60 overflow-hidden mb-3">
            {showVideo && saree.videoUrl ? (
              /* Video playing in main area */
              <video
                src={saree.videoUrl}
                className="absolute inset-0 w-full h-full object-contain bg-black"
                controls
                loop
                playsInline
                preload="auto"
              />
            ) : saree.images && saree.images.length > 0 ? (
              <img
                src={saree.images[selectedImage] || saree.images[0]}
                alt={`${saree.name} - Image ${selectedImage + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="font-display text-base text-bark-light/40 italic">
                    {saree.color} {formatWeave(saree.weave)}
                  </span>
                  <p className="font-ui text-xs text-bark-light/30 mt-2">No images yet</p>
                </div>
              </div>
            )}

            {/* Nool badge when video is playing */}
            {showVideo && saree.videoUrl && (
              <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-full flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-gold" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                <span className="text-white text-xs font-medium">Nool</span>
              </div>
            )}

            {/* Discount badge */}
            {!showVideo && discount > 0 && (
              <div className="absolute top-4 left-4">
                <span className="inline-block px-3 py-1.5 bg-maroon text-cream font-ui text-sm font-semibold">
                  {discount}% OFF
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails row — images + video at the end */}
          <div className="flex gap-2">
            {saree.images?.map((url, i) => (
              <button
                key={url}
                onClick={() => { setSelectedImage(i); setShowVideo(false); }}
                className={`
                  w-16 h-20 bg-cream-warm border-2 transition-all overflow-hidden
                  ${!showVideo && selectedImage === i ? 'border-maroon' : 'border-cream-deep/60 hover:border-bark-light/40'}
                `}
              >
                <img src={url} alt={`${saree.name} thumbnail ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}

            {/* Video thumbnail — last in the row */}
            {saree.videoUrl && (
              <button
                onClick={() => setShowVideo(true)}
                className={`
                  w-16 h-20 bg-black border-2 transition-all overflow-hidden relative flex items-center justify-center
                  ${showVideo ? 'border-maroon' : 'border-cream-deep/60 hover:border-bark-light/40'}
                `}
              >
                <svg className="w-6 h-6 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span className="absolute bottom-0.5 left-0 right-0 text-center text-[8px] text-white/60 font-medium">Nool</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Details ── */}
        <div>
          {/* Weave badge */}
          <span className="inline-block font-ui text-xs tracking-[0.15em] uppercase text-gold mb-2">
            {formatWeave(saree.weave)} &middot; {formatFabric(saree.fabric)}
          </span>

          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-bark leading-tight mb-4">
            {saree.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-display text-3xl font-bold text-maroon">
              {formatINR(saree.priceInPaisa)}
            </span>
            {saree.mrpInPaisa > saree.priceInPaisa && (
              <>
                <span className="font-ui text-lg text-bark-light/50 line-through">
                  {formatINR(saree.mrpInPaisa)}
                </span>
                <span className="font-ui text-sm font-semibold text-sage">
                  Save {formatINR(saree.mrpInPaisa - saree.priceInPaisa)}
                </span>
              </>
            )}
          </div>

          <p className="font-ui text-xs text-bark-light/60 mb-6">
            5% GST included (HSN: 50079090)
          </p>

          {/* Specs */}
          <div className="grid grid-cols-2 gap-4 mb-8 p-5 bg-cream-warm border border-cream-deep/40">
            <div>
              <p className="font-ui text-[10px] tracking-[0.14em] uppercase text-bark-light/60 mb-0.5">
                Fabric
              </p>
              <p className="font-ui text-sm font-medium text-bark">
                {formatFabric(saree.fabric)}
              </p>
            </div>
            <div>
              <p className="font-ui text-[10px] tracking-[0.14em] uppercase text-bark-light/60 mb-0.5">
                Weave
              </p>
              <p className="font-ui text-sm font-medium text-bark">
                {formatWeave(saree.weave)}
              </p>
            </div>
            <div>
              <p className="font-ui text-[10px] tracking-[0.14em] uppercase text-bark-light/60 mb-0.5">
                Length
              </p>
              <p className="font-ui text-sm font-medium text-bark">
                {saree.lengthInMeters} meters
              </p>
            </div>
            <div>
              <p className="font-ui text-[10px] tracking-[0.14em] uppercase text-bark-light/60 mb-0.5">
                Blouse Piece
              </p>
              <p className="font-ui text-sm font-medium text-bark">
                {saree.blousePieceIncluded ? 'Included' : 'Not Included'}
              </p>
            </div>
            <div>
              <p className="font-ui text-[10px] tracking-[0.14em] uppercase text-bark-light/60 mb-0.5">
                Color
              </p>
              <p className="font-ui text-sm font-medium text-bark">
                {saree.color}
              </p>
            </div>
            <div>
              <p className="font-ui text-[10px] tracking-[0.14em] uppercase text-bark-light/60 mb-0.5">
                Stock
              </p>
              <p
                className={`font-ui text-sm font-medium ${saree.stock <= 3 ? 'text-terracotta' : 'text-sage'}`}
              >
                {saree.stock <= 3
                  ? `Only ${saree.stock} left`
                  : 'In Stock'}
              </p>
            </div>
          </div>

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-cream-deep">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center font-ui text-lg text-bark hover:bg-cream-warm transition-colors"
              >
                &minus;
              </button>
              <span className="w-10 h-10 flex items-center justify-center font-ui text-sm font-medium text-bark border-x border-cream-deep">
                {quantity}
              </span>
              <button
                onClick={() =>
                  setQuantity(Math.min(saree.stock, quantity + 1))
                }
                className="w-10 h-10 flex items-center justify-center font-ui text-lg text-bark hover:bg-cream-warm transition-colors"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={saree.stock === 0}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {added ? (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Added to Cart
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  Add to Cart
                </>
              )}
            </button>
          </div>

          {/* Shipping info */}
          <div className="space-y-2 mb-8">
            <div className="flex items-center gap-2 font-ui text-sm text-bark-light">
              <svg
                className="w-4 h-4 text-sage shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
              Free shipping on orders above {'\u20B9'}999
            </div>
            <div className="flex items-center gap-2 font-ui text-sm text-bark-light">
              <svg
                className="w-4 h-4 text-sage shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              GI Tag authenticated
            </div>
            <div className="flex items-center gap-2 font-ui text-sm text-bark-light">
              <svg
                className="w-4 h-4 text-sage shrink-0"
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
              Secure Razorpay payment
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-cream-deep pt-6 mb-6">
            <h3 className="font-display text-lg font-semibold text-bark mb-3">
              Description
            </h3>
            <p className="font-body text-base text-bark-light leading-relaxed">
              {saree.description}
            </p>
          </div>

          {/* Care & Shipping */}
          <div className="border-t border-cream-deep pt-6 mb-6">
            <h3 className="font-display text-lg font-semibold text-bark mb-3">
              Care & Shipping
            </h3>
            <div className="space-y-3 font-ui text-sm text-bark-light">
              <div className="flex items-start gap-3">
                <svg className="w-4 h-4 text-bark-light/50 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <div>
                  <p className="font-medium text-bark">Washing Care</p>
                  <p className="text-bark-light/70">Dry clean only. Do not bleach. Store in muslin cloth.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-4 h-4 text-bark-light/50 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
                <div>
                  <p className="font-medium text-bark">Delivery</p>
                  <p className="text-bark-light/70">Ships within 2-3 business days. Delivery in 5-7 days across India.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-4 h-4 text-bark-light/50 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                </svg>
                <div>
                  <p className="font-medium text-bark">Returns</p>
                  <p className="text-bark-light/70">Easy returns within 7 days if product is unused and in original packaging.</p>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp + Share */}
          <div className="flex gap-3">
            <a
              href={`https://wa.me/919440249456?text=${encodeURIComponent(`Hi, I'm interested in: ${saree.name} (${formatINR(saree.priceInPaisa)}) - ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white font-ui text-sm font-medium rounded hover:bg-green-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp Enquiry
            </a>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: saree.name, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
              className="px-4 py-3 border border-cream-deep text-bark-light font-ui text-sm hover:border-maroon hover:text-maroon transition-colors rounded"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
