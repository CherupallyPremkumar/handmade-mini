'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth-store';
import StatusTimeline from '@/components/StatusTimeline';
import { formatINR } from '@/lib/format';
import type { OrderStatus } from '@/lib/types';

const API = process.env.NEXT_PUBLIC_API_URL || '';

interface TrackingItem {
  productName: string;
  quantity: number;
}

interface MyOrder {
  orderNumber: string;
  status: string;
  trackingNumber: string | null;
  items: TrackingItem[];
  totalAmount: number;
  createdTime: string;
}

export default function MyOrdersPage() {
  const router = useRouter();
  const { isLoggedIn, getAuthHeaders } = useAuthStore();
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoggedIn) {
      router.replace('/login?redirect=/my-orders');
      return;
    }
    if (mounted && isLoggedIn) {
      fetchOrders();
    }
  }, [mounted, isLoggedIn]);

  async function fetchOrders() {
    try {
      const res = await fetch(`${API}/api/orders/my/list`, {
        credentials: 'include' as RequestCredentials,
      });
      if (res.ok) {
        setOrders(await res.json());
      }
    } catch (e) {
      // Log for debugging
    } finally {
      setLoading(false);
    }
  }

  if (!mounted || !isLoggedIn) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-cream-deep rounded w-48 mb-8" />
          <div className="h-40 bg-cream-deep rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="text-center mb-10">
        <span className="font-ui text-xs tracking-[0.2em] uppercase text-gold">
          Your Account
        </span>
        <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-bark">
          My Orders
        </h1>
        <div className="gold-divider mt-3" />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-cream-deep/50 h-24 rounded" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white border border-cream-deep/60">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cream-warm mb-4">
            <svg className="w-8 h-8 text-bark-light/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="font-display text-xl font-semibold text-bark mb-2">
            No orders yet
          </h2>
          <p className="font-body text-bark-light mb-6">
            Start shopping to see your orders here
          </p>
          <Link href="/sarees" className="btn-primary">
            Browse Collection
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const expanded = expandedOrder === order.orderNumber;

            return (
              <div
                key={order.orderNumber}
                className="bg-white border border-cream-deep/60 overflow-hidden"
              >
                {/* Order row */}
                <button
                  onClick={() => setExpandedOrder(expanded ? null : order.orderNumber)}
                  className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-cream-warm/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-ui text-sm font-semibold text-bark">
                        {order.orderNumber}
                      </p>
                      <span className={`inline-block px-2 py-0.5 rounded-full font-ui text-[11px] font-medium ${
                        order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        order.status === 'PAID' ? 'bg-green-50 text-green-700 border border-green-200' :
                        order.status === 'CANCELLED' ? 'bg-red-50 text-red-600 border border-red-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="font-ui text-xs text-bark-light">
                      {new Date(order.createdTime).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                      {' '}&middot;{' '}
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <p className="font-ui text-sm font-semibold text-bark shrink-0">
                    {formatINR(order.totalAmount)}
                  </p>

                  <svg
                    className={`w-5 h-5 text-bark-light transition-transform ${expanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Expanded details */}
                {expanded && (
                  <div className="border-t border-cream-deep/40 p-5 animate-fade-in">
                    {/* Timeline */}
                    <div className="mb-6">
                      <StatusTimeline currentStatus={order.status as OrderStatus} />
                    </div>

                    {/* Tracking number */}
                    {order.trackingNumber && (
                      <div className="p-3 bg-cream-warm border border-cream-deep/40 mb-4">
                        <p className="font-ui text-[10px] tracking-[0.14em] uppercase text-bark-light/60 mb-0.5">
                          Tracking Number
                        </p>
                        <p className="font-ui text-sm font-semibold text-bark">
                          {order.trackingNumber}
                        </p>
                      </div>
                    )}

                    {/* Items */}
                    <div className="space-y-2">
                      {order.items.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between py-2 border-b border-cream-deep/30 last:border-0"
                        >
                          <p className="font-ui text-sm font-medium text-bark">
                            {item.productName}
                          </p>
                          <p className="font-ui text-xs text-bark-light">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Total + Invoice */}
                    <div className="mt-4 pt-3 border-t border-cream-deep/40 flex justify-between items-center">
                      <div>
                        <span className="font-ui text-sm font-semibold text-bark">Total: </span>
                        <span className="font-display text-lg font-bold text-maroon">
                          {formatINR(order.totalAmount)}
                        </span>
                      </div>
                      {['PAID', 'SHIPPED', 'DELIVERED'].includes(order.status) && (
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL || ''}/api/orders/${order.orderNumber}/invoice`}
                          className="font-ui text-xs text-maroon hover:text-maroon-deep flex items-center gap-1 transition-colors"
                          target="_blank" rel="noopener noreferrer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Invoice
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
