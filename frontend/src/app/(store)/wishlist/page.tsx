'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore, authFetch } from '@/lib/auth-store';
import { useWishlistStore } from '@/lib/wishlist-store';
import { useCartStore } from '@/lib/cart-store';
import { formatINR, discountPercent } from '@/lib/format';
import { api } from '@/lib/api';
import type { Saree } from '@/lib/types';

const API = process.env.NEXT_PUBLIC_API_URL || '';

interface WishlistProduct {
  productId: string;
  name: string;
  sellingPrice: number;
  mrp: number;
  images: string[];
  stock: number;
  isActive: boolean;
}

export default function WishlistPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();
  const { toggle } = useWishlistStore();
  const addToCart = useCartStore((s) => s.addItem);
  const [items, setItems] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && !isLoggedIn) {
      router.replace('/login?redirect=/wishlist');
      return;
    }
    if (mounted && isLoggedIn) loadWishlist();
  }, [mounted, isLoggedIn, router]);

  async function loadWishlist() {
    setLoading(true);
    try {
      const res = await authFetch(`${API}/api/wishlist`);
      if (res.ok) setItems(await res.json());
    } finally { setLoading(false); }
  }

  async function removeItem(productId: string) {
    setItems(prev => prev.filter(i => i.productId !== productId));
    toggle(productId);
  }

  async function addItemToCart(item: WishlistProduct) {
    try {
      const res = await api.sarees.getById(item.productId);
      if (res.success && res.data) {
        addToCart(res.data, 1);
      }
    } catch { /* silent */ }
  }

  if (!mounted || !isLoggedIn) {
    return <div className="max-w-5xl mx-auto px-4 py-12"><div className="animate-pulse"><div className="h-8 bg-cream-deep rounded w-48 mb-8" /><div className="h-64 bg-cream-deep rounded" /></div></div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="font-display text-2xl font-bold text-bark mb-6">My Wishlist</h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="animate-pulse"><div className="h-72 bg-cream-deep rounded-lg mb-3" /><div className="h-5 bg-cream-deep rounded w-3/4" /></div>)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-16 h-16 mx-auto text-bark-light/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h2 className="font-display text-xl font-semibold text-bark mb-2">Your wishlist is empty</h2>
          <p className="font-body text-bark-light mb-6">Save sarees you love and come back to them anytime.</p>
          <Link href="/sarees" className="btn-primary">Browse Collection</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => {
            const discount = item.mrp > item.sellingPrice ? discountPercent(item.mrp, item.sellingPrice) : 0;
            return (
              <div key={item.productId} className="bg-white border border-cream-deep/60 rounded-lg overflow-hidden group">
                <Link href={`/sarees/${item.productId}`} className="block relative aspect-[3/4] bg-cream-warm">
                  {item.images?.length > 0 ? (
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-bark-light/20">No image</div>
                  )}
                  {discount > 0 && (
                    <span className="absolute top-3 left-3 bg-maroon text-cream font-ui text-xs font-semibold px-2 py-1 rounded">{discount}% OFF</span>
                  )}
                </Link>
                <div className="p-4">
                  <Link href={`/sarees/${item.productId}`}>
                    <h3 className="font-display text-sm font-semibold text-bark line-clamp-2 hover:text-maroon transition-colors">{item.name}</h3>
                  </Link>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="font-ui text-base font-bold text-maroon">{formatINR(item.sellingPrice)}</span>
                    {item.mrp > item.sellingPrice && (
                      <span className="font-ui text-xs text-bark-light/50 line-through">{formatINR(item.mrp)}</span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => addItemToCart(item)}
                      disabled={item.stock <= 0}
                      className="flex-1 btn-primary !py-2 !text-xs rounded-lg disabled:opacity-50"
                    >
                      {item.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="p-2 border border-cream-deep/60 rounded-lg text-bark-light hover:text-red-500 hover:border-red-200 transition-colors"
                      title="Remove from wishlist"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
