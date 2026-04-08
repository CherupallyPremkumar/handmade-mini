'use client';

import { useCartStore } from '@/lib/cart-store';
import { formatINR } from '@/lib/format';

interface CartSummaryProps {
  showCheckoutButton?: boolean;
  onCheckout?: () => void;
  checkoutLabel?: string;
  loading?: boolean;
  discount?: number;
}

export default function CartSummary({
  showCheckoutButton = true,
  onCheckout,
  checkoutLabel = 'Proceed to Checkout',
  loading = false,
  discount = 0,
}: CartSummaryProps) {
  const subtotal = useCartStore((s) => s.subtotal());
  const gst = useCartStore((s) => s.gstAmount());
  const shipping = useCartStore((s) => s.shippingCost());
  const grandTotal = useCartStore((s) => s.grandTotal());

  const freeShippingRemaining = 99900 - subtotal;

  return (
    <div className="bg-white border border-cream-deep/60 p-6">
      <h3 className="font-display text-xl font-semibold text-bark mb-5">
        Order Summary
      </h3>

      <div className="space-y-3 mb-5">
        <div className="flex justify-between font-ui text-sm">
          <span className="text-bark-light">Subtotal</span>
          <span className="font-medium text-bark">{formatINR(subtotal)}</span>
        </div>

        <div className="flex justify-between font-ui text-sm">
          <span className="text-bark-light">
            GST <span className="text-xs">(5%)</span>
          </span>
          <span className="font-medium text-bark">{formatINR(gst)}</span>
        </div>

        <div className="flex justify-between font-ui text-sm">
          <span className="text-bark-light">Shipping</span>
          <span className="font-medium text-bark">
            {shipping === 0 ? (
              <span className="text-sage">Free</span>
            ) : (
              formatINR(shipping)
            )}
          </span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between font-ui text-sm">
            <span className="text-green-600">Coupon Discount</span>
            <span className="font-medium text-green-600">-{formatINR(discount)}</span>
          </div>
        )}

        {freeShippingRemaining > 0 && subtotal > 0 && (
          <div className="pt-2">
            <p className="font-ui text-xs text-sage">
              Add {formatINR(freeShippingRemaining)} more for free shipping
            </p>
            <div className="mt-1.5 h-1.5 bg-cream-deep rounded-full overflow-hidden">
              <div
                className="h-full bg-sage rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min((subtotal / 99900) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-cream-deep pt-4 mb-5">
        <div className="flex justify-between items-baseline">
          <span className="font-display text-lg font-semibold text-bark">
            Total
          </span>
          <span className="font-display text-2xl font-bold text-maroon">
            {formatINR(Math.max(0, grandTotal - discount))}
          </span>
        </div>
        <p className="font-ui text-[11px] text-bark-light/60 mt-1">
          Inclusive of 5% GST (HSN: 50079090)
        </p>
      </div>

      {showCheckoutButton && onCheckout && (
        <button
          onClick={onCheckout}
          disabled={loading || subtotal === 0}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Processing...
            </span>
          ) : (
            checkoutLabel
          )}
        </button>
      )}
    </div>
  );
}
