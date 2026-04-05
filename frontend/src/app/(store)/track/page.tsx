'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import StatusTimeline from '@/components/StatusTimeline';
import { api } from '@/lib/api';
import { sampleOrders } from '@/lib/sample-data';
import type { Order } from '@/lib/types';
import { formatINR } from '@/lib/format';

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="animate-pulse">
            <div className="h-8 bg-cream-deep rounded w-48 mx-auto mb-8" />
            <div className="h-48 bg-cream-deep rounded" />
          </div>
        </div>
      }
    >
      <TrackPageContent />
    </Suspense>
  );
}

function TrackPageContent() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  async function handleTrack(num?: string) {
    const trackNumber = num || orderNumber;
    if (!trackNumber.trim()) {
      setError('Please enter an order number');
      return;
    }

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const res = await api.orders.track(trackNumber);
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        // Demo fallback: check sample data
        const sample = sampleOrders.find(
          (o) => o.orderNumber === trackNumber
        );
        if (sample) {
          setOrder(sample);
        } else {
          setError('Order not found. Please check your order number.');
          setOrder(null);
        }
      }
    } catch {
      // Demo fallback
      const sample = sampleOrders.find(
        (o) => o.orderNumber === trackNumber
      );
      if (sample) {
        setOrder(sample);
      } else {
        setError('Order not found. Please check your order number.');
        setOrder(null);
      }
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const prefilled = searchParams.get('order');
    if (prefilled) {
      setOrderNumber(prefilled);
      handleTrack(prefilled);
    }
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="font-ui text-xs tracking-[0.2em] uppercase text-gold">
          Order Tracking
        </span>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-bark">
          Track Your Saree
        </h1>
        <div className="gold-divider mt-3" />
      </div>

      {/* Search */}
      <div className="bg-white border border-cream-deep/60 p-6 sm:p-8 mb-8">
        <label className="input-label">Order Number</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => {
              setOrderNumber(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
            placeholder="e.g., PCH-20260401-001"
            className={`input-field flex-1 ${error ? '!border-red-400' : ''}`}
          />
          <button
            onClick={() => handleTrack()}
            disabled={loading}
            className="btn-primary shrink-0"
          >
            {loading ? (
              <svg
                className="animate-spin w-5 h-5"
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
            ) : (
              'Track'
            )}
          </button>
        </div>
        {error && (
          <p className="mt-2 font-ui text-xs text-red-500">{error}</p>
        )}

        {/* Demo hint */}
        <p className="mt-3 font-ui text-xs text-bark-light/50">
          Try: PCH-20260401-001, PCH-20260402-002, or PCH-20260404-003
        </p>
      </div>

      {/* Results */}
      {order && (
        <div className="animate-fade-in-up">
          <div className="bg-white border border-cream-deep/60 p-6 sm:p-8">
            {/* Order header */}
            <div className="flex items-start justify-between mb-6 pb-6 border-b border-cream-deep/40">
              <div>
                <p className="font-ui text-[10px] tracking-[0.14em] uppercase text-bark-light/60 mb-0.5">
                  Order Number
                </p>
                <p className="font-display text-lg font-bold text-maroon">
                  {order.orderNumber}
                </p>
              </div>
              <div className="text-right">
                <p className="font-ui text-[10px] tracking-[0.14em] uppercase text-bark-light/60 mb-0.5">
                  Total
                </p>
                <p className="font-display text-lg font-bold text-bark">
                  {formatINR(order.grandTotalInPaisa)}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="mb-6">
              <h3 className="font-display text-lg font-semibold text-bark mb-5">
                Status
              </h3>
              <StatusTimeline currentStatus={order.status} />
            </div>

            {/* Tracking number */}
            {order.trackingNumber && (
              <div className="p-4 bg-cream-warm border border-cream-deep/40 mb-6">
                <p className="font-ui text-[10px] tracking-[0.14em] uppercase text-bark-light/60 mb-0.5">
                  Tracking Number
                </p>
                <p className="font-ui text-sm font-semibold text-bark">
                  {order.trackingNumber}
                </p>
              </div>
            )}

            {/* Items */}
            <div>
              <h3 className="font-display text-lg font-semibold text-bark mb-3">
                Items
              </h3>
              <div className="space-y-2">
                {order.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-cream-deep/30 last:border-0"
                  >
                    <div>
                      <p className="font-ui text-sm font-medium text-bark">
                        {item.sareeName}
                      </p>
                      <p className="font-ui text-xs text-bark-light">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-ui text-sm font-medium text-bark">
                      {formatINR(item.priceInPaisa * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping address */}
            <div className="mt-6 pt-6 border-t border-cream-deep/40">
              <h3 className="font-display text-lg font-semibold text-bark mb-2">
                Shipping Address
              </h3>
              <p className="font-ui text-sm text-bark-light leading-relaxed">
                {order.address.name}
                <br />
                {order.address.addressLine1}
                {order.address.addressLine2 && (
                  <>
                    <br />
                    {order.address.addressLine2}
                  </>
                )}
                <br />
                {order.address.city}, {order.address.state}{' '}
                {order.address.pincode}
                <br />
                {order.address.phone}
              </p>
            </div>
          </div>
        </div>
      )}

      {searched && !order && !loading && !error && (
        <div className="text-center py-12">
          <p className="font-body text-bark-light">No order found.</p>
        </div>
      )}
    </div>
  );
}
