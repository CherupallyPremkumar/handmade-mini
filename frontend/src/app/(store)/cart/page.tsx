'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/cart-store';
import CartSummary from '@/components/CartSummary';
import { formatINR, formatFabric, formatWeave } from '@/lib/format';
import { useState, useEffect } from 'react';

export default function CartPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-cream-deep rounded w-48 mb-8" />
          <div className="h-40 bg-cream-deep rounded mb-4" />
          <div className="h-40 bg-cream-deep rounded" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cream-warm mb-6">
            <svg
              className="w-10 h-10 text-bark-light/30"
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
          </div>
          <h1 className="font-display text-2xl font-bold text-bark mb-2">
            Your Cart is Empty
          </h1>
          <p className="font-body text-base text-bark-light mb-8">
            Discover our exquisite collection of handwoven Pochampally sarees
          </p>
          <Link href="/sarees" className="btn-primary">
            Browse Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-bark">
          Shopping Cart
        </h1>
        <p className="mt-1 font-ui text-sm text-bark-light">
          {items.length} item{items.length !== 1 ? 's' : ''} in your cart
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-10">
        {/* Cart items */}
        <div className="space-y-4 mb-8 lg:mb-0">
          {items.map((item) => (
            <div
              key={item.saree.id}
              className="bg-white border border-cream-deep/60 p-4 sm:p-5 flex gap-4 sm:gap-6"
            >
              {/* Product image */}
              <Link
                href={`/sarees/${item.saree.id}`}
                className="w-24 h-32 sm:w-28 sm:h-36 bg-cream-warm flex items-center justify-center shrink-0 border border-cream-deep/40 overflow-hidden"
              >
                {item.saree.images && item.saree.images.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.saree.images[0]}
                    alt={item.saree.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-full opacity-20"
                    style={{
                      background: `conic-gradient(from 0deg, var(--maroon), var(--gold), var(--maroon))`,
                    }}
                  />
                )}
              </Link>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-ui text-[10px] tracking-[0.14em] uppercase text-gold mb-0.5">
                      {formatWeave(item.saree.weave)}
                    </p>
                    <Link
                      href={`/sarees/${item.saree.id}`}
                      className="font-display text-base sm:text-lg font-semibold text-bark hover:text-maroon transition-colors leading-snug"
                    >
                      {item.saree.name}
                    </Link>
                    <p className="font-ui text-xs text-bark-light mt-0.5">
                      {formatFabric(item.saree.fabric)} &middot;{' '}
                      {item.saree.color}
                    </p>
                  </div>

                  <button
                    onClick={() => removeItem(item.saree.id)}
                    className="p-1 text-bark-light/40 hover:text-maroon transition-colors shrink-0"
                    aria-label="Remove item"
                  >
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Bottom row */}
                <div className="mt-4 flex items-center justify-between">
                  {/* Quantity */}
                  <div className="flex items-center border border-cream-deep">
                    <button
                      onClick={() =>
                        updateQuantity(item.saree.id, item.quantity - 1)
                      }
                      className="w-8 h-8 flex items-center justify-center font-ui text-base text-bark hover:bg-cream-warm transition-colors"
                    >
                      &minus;
                    </button>
                    <span className="w-8 h-8 flex items-center justify-center font-ui text-xs font-medium text-bark border-x border-cream-deep">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.saree.id,
                          Math.min(item.saree.stock, item.quantity + 1)
                        )
                      }
                      className="w-8 h-8 flex items-center justify-center font-ui text-base text-bark hover:bg-cream-warm transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="font-ui text-base font-semibold text-maroon">
                      {formatINR(item.saree.priceInPaisa * item.quantity)}
                    </p>
                    {item.quantity > 1 && (
                      <p className="font-ui text-xs text-bark-light">
                        {formatINR(item.saree.priceInPaisa)} each
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-24">
          <CartSummary
            showCheckoutButton
            onCheckout={() => router.push('/checkout')}
            checkoutLabel="Proceed to Checkout"
          />
        </div>
      </div>
    </div>
  );
}
