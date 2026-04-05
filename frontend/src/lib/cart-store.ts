import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Saree, CartItem } from './types';

const GST_RATE = 0.05;
const FREE_SHIPPING_THRESHOLD = 99900; // 999 rupees in paisa
const SHIPPING_COST = 9900; // 99 rupees in paisa

interface CartState {
  items: CartItem[];
  addItem: (saree: Saree, quantity?: number) => void;
  removeItem: (sareeId: string) => void;
  updateQuantity: (sareeId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: () => number;
  subtotal: () => number;
  gstAmount: () => number;
  shippingCost: () => number;
  grandTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (saree: Saree, quantity = 1) => {
        set((state) => {
          const existing = state.items.find(
            (item) => item.saree.id === saree.id
          );
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.saree.id === saree.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return {
            items: [...state.items, { saree, quantity }],
          };
        });
      },

      removeItem: (sareeId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.saree.id !== sareeId),
        }));
      },

      updateQuantity: (sareeId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(sareeId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.saree.id === sareeId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      itemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      subtotal: () =>
        get().items.reduce(
          (sum, item) => sum + item.saree.priceInPaisa * item.quantity,
          0
        ),

      gstAmount: () => Math.round(get().subtotal() * GST_RATE),

      shippingCost: () =>
        get().subtotal() >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST,

      grandTotal: () =>
        get().subtotal() + get().gstAmount() + get().shippingCost(),
    }),
    {
      name: 'pochampally-cart',
    }
  )
);
