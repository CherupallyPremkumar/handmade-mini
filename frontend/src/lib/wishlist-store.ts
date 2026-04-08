import { create } from 'zustand';
import { authFetch } from './auth-store';

const API = process.env.NEXT_PUBLIC_API_URL || '';

interface WishlistState {
  items: Set<string>; // productIds
  loaded: boolean;
  toggle: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  sync: () => void;
}

export const useWishlistStore = create<WishlistState>()((set, get) => ({
  items: new Set<string>(),
  loaded: false,

  toggle: async (productId: string) => {
    const current = get().items;
    const inWishlist = current.has(productId);

    // Optimistic update
    const next = new Set(current);
    if (inWishlist) {
      next.delete(productId);
    } else {
      next.add(productId);
    }
    set({ items: next });

    // Sync with backend
    try {
      if (inWishlist) {
        await authFetch(`${API}/api/wishlist/${productId}`, { method: 'DELETE' });
      } else {
        await authFetch(`${API}/api/wishlist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        });
      }
    } catch {
      // Revert on failure
      set({ items: current });
    }
  },

  isInWishlist: (productId: string) => get().items.has(productId),

  sync: async () => {
    try {
      const res = await authFetch(`${API}/api/wishlist`);
      if (res.ok) {
        const data: { productId: string }[] = await res.json();
        set({ items: new Set(data.map(d => d.productId)), loaded: true });
      }
    } catch {
      // silent
    }
  },
}));
