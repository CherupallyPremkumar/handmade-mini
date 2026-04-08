'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/cart-store';

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderNumber =
    typeof params.orderNumber === 'string' ? params.orderNumber : '';
  const clearCart = useCartStore((s) => s.clearCart);

  // Clear cart when order is confirmed
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="text-center">
        {/* Success icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-sage/10 mb-6 animate-fade-in">
          <div className="w-14 h-14 rounded-full bg-sage/20 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-sage"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-bold text-bark mb-3 animate-fade-in-up stagger-1">
          Order Confirmed!
        </h1>

        <p className="font-body text-lg text-bark-light mb-2 animate-fade-in-up stagger-2">
          Thank you for choosing Dhanunjaiah Handlooms.
        </p>
        <p className="font-body text-base text-bark-light/70 animate-fade-in-up stagger-2">
          Your saree will be carefully packed and shipped with love.
        </p>
      </div>

      {/* Order details card */}
      <div className="mt-10 bg-white border border-cream-deep/60 p-6 sm:p-8 animate-fade-in-up stagger-3">
        <div className="text-center mb-6">
          <p className="font-ui text-xs tracking-[0.14em] uppercase text-bark-light/60 mb-1">
            Order Number
          </p>
          <p className="font-display text-xl font-bold text-maroon">
            {orderNumber}
          </p>
        </div>

        <div className="gold-divider mb-6" />

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-cream-warm rounded">
            <div className="w-8 h-8 rounded-full bg-sage/20 flex items-center justify-center shrink-0">
              <svg
                className="w-4 h-4 text-sage"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="font-ui text-sm font-medium text-bark">
                Confirmation email sent
              </p>
              <p className="font-ui text-xs text-bark-light">
                Check your inbox for order details and tracking updates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-cream-warm rounded">
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
              <svg
                className="w-4 h-4 text-gold"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <div>
              <p className="font-ui text-sm font-medium text-bark">
                Processing your order
              </p>
              <p className="font-ui text-xs text-bark-light">
                We&apos;ll notify you when your saree is shipped
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up stagger-4">
        <Link
          href={`/track?order=${orderNumber}`}
          className="btn-primary w-full sm:w-auto"
        >
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          Track Your Order
        </Link>
        <Link href="/sarees" className="btn-outline w-full sm:w-auto">
          Continue Shopping
        </Link>
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL || ''}/api/orders/${orderNumber}/invoice`}
          className="btn-outline w-full sm:w-auto flex items-center justify-center gap-2"
          target="_blank" rel="noopener noreferrer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Invoice
        </a>
      </div>

      {/* Support note */}
      <div className="mt-12 text-center">
        <p className="font-ui text-xs text-bark-light/60">
          Need help? Call us at{' '}
          <a
            href="tel:+919876543210"
            className="text-maroon hover:underline"
          >
            +91 98765 43210
          </a>{' '}
          or email{' '}
          <a
            href="mailto:hello@pochampallyhandlooms.in"
            className="text-maroon hover:underline"
          >
            hello@pochampallyhandlooms.in
          </a>
        </p>
      </div>
    </div>
  );
}
