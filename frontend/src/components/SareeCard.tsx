'use client';

import Link from 'next/link';
import type { Saree } from '@/lib/types';
import { formatINR, discountPercent, formatFabric, formatWeave } from '@/lib/format';
import { useCartStore } from '@/lib/cart-store';
import { useWishlistStore } from '@/lib/wishlist-store';
import { useAuthStore } from '@/lib/auth-store';
import { useState } from 'react';

interface SareeCardProps {
  saree: Saree;
}

export default function SareeCard({ saree }: SareeCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const { toggle, isInWishlist } = useWishlistStore();
  const { isLoggedIn } = useAuthStore();
  const [added, setAdded] = useState(false);
  const discount = discountPercent(saree.mrpInPaisa, saree.priceInPaisa);
  const wishlisted = isInWishlist(saree.id);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(saree);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Link href={`/sarees/${saree.id}`} className="group block">
      <div className="card-lift bg-white overflow-hidden border border-cream-deep/60">
        {/* Image */}
        <div className="relative aspect-[3/4] bg-cream-warm overflow-hidden">
          {saree.images && saree.images.length > 0 ? (
            <img
              src={saree.images[0]}
              alt={saree.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            /* Warm maroon/gold gradient placeholder when no images */
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div
                  className="mx-auto mb-3 w-24 h-24 rounded-full opacity-30"
                  style={{
                    background: `conic-gradient(from 0deg, var(--maroon), var(--gold), var(--maroon-light), var(--gold-light), var(--maroon))`,
                  }}
                />
                <span className="font-display text-sm text-bark-light/40 italic">
                  {saree.color} {formatWeave(saree.weave)}
                </span>
              </div>
            </div>
          )}

          {/* Discount badge */}
          {discount > 0 && (
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-block px-2.5 py-1 bg-maroon text-cream font-ui text-xs font-semibold tracking-wide">
                {discount}% OFF
              </span>
            </div>
          )}

          {/* Fabric tag */}
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-block px-2.5 py-1 bg-white/90 backdrop-blur-sm text-bark font-ui text-xs font-medium tracking-wide">
              {formatFabric(saree.fabric)}
            </span>
          </div>

          {/* Wishlist heart */}
          {isLoggedIn && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(saree.id); }}
              className="absolute bottom-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110"
              title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <svg className={`w-4 h-4 transition-colors ${wishlisted ? 'text-red-500 fill-red-500' : 'text-bark-light'}`} fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-maroon-deep/0 group-hover:bg-maroon-deep/10 transition-colors duration-500" />

          {/* Quick Add */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
            <button
              onClick={handleAddToCart}
              className="w-full py-3.5 bg-maroon text-cream font-ui text-sm font-medium tracking-wider uppercase
                         hover:bg-maroon-deep transition-colors flex items-center justify-center gap-2"
            >
              {added ? (
                <>
                  <svg
                    className="w-4 h-4"
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
                  Added
                </>
              ) : (
                <>
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
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  Add to Cart
                </>
              )}
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="p-4 pb-5">
          <p className="font-ui text-[11px] font-medium tracking-[0.12em] uppercase text-gold mb-1.5">
            {formatWeave(saree.weave)}
          </p>

          <h3 className="font-display text-lg font-semibold text-bark leading-snug mb-2 group-hover:text-maroon transition-colors duration-300">
            {saree.name}
          </h3>

          <div className="flex items-baseline gap-2.5">
            <span className="font-ui text-lg font-semibold text-maroon">
              {formatINR(saree.priceInPaisa)}
            </span>
            {saree.mrpInPaisa > saree.priceInPaisa && (
              <span className="font-ui text-sm text-bark-light/50 line-through">
                {formatINR(saree.mrpInPaisa)}
              </span>
            )}
          </div>

          {saree.stock <= 3 && saree.stock > 0 && (
            <p className="mt-2 font-ui text-xs text-terracotta font-medium">
              Only {saree.stock} left
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
