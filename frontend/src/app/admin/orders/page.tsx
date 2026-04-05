'use client';

import { useState } from 'react';
import { sampleOrders } from '@/lib/sample-data';
import {
  formatINR,
  formatStatus,
  statusColor,
} from '@/lib/format';
import StatusTimeline from '@/components/StatusTimeline';
import type { Order, OrderStatus } from '@/lib/types';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(sampleOrders);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState<Record<string, string>>(
    {}
  );

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function updateStatus(orderId: string, status: OrderStatus) {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status,
              updatedAt: new Date().toISOString(),
              trackingNumber:
                status === 'SHIPPED'
                  ? trackingInput[orderId] || o.trackingNumber
                  : o.trackingNumber,
            }
          : o
      )
    );
  }

  const nextStatusMap: Partial<Record<OrderStatus, OrderStatus[]>> = {
    PLACED: ['PAID', 'CANCELLED'],
    PAID: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED'],
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-bark mb-6">
        Orders
      </h1>

      <div className="space-y-3">
        {orders.map((order) => {
          const expanded = expandedId === order.id;
          const nextStatuses = nextStatusMap[order.status] || [];

          return (
            <div
              key={order.id}
              className="bg-white border border-cream-deep/60 overflow-hidden"
            >
              {/* Row */}
              <button
                onClick={() => toggleExpand(order.id)}
                className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-cream-warm/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-ui text-sm font-semibold text-bark">
                      {order.orderNumber}
                    </p>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full font-ui text-[11px] font-medium ${statusColor(order.status)}`}
                    >
                      {formatStatus(order.status)}
                    </span>
                  </div>
                  <p className="font-ui text-xs text-bark-light">
                    {order.address.name} &middot; {order.address.city} &middot;{' '}
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <p className="font-ui text-sm font-semibold text-bark shrink-0">
                  {formatINR(order.grandTotalInPaisa)}
                </p>

                <svg
                  className={`w-5 h-5 text-bark-light transition-transform ${expanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Expanded details */}
              {expanded && (
                <div className="border-t border-cream-deep/40 animate-fade-in">
                  <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Timeline + Items */}
                    <div>
                      <h4 className="font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60 mb-3">
                        Order Status
                      </h4>
                      <StatusTimeline currentStatus={order.status} />

                      <h4 className="font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60 mb-3 mt-4">
                        Items
                      </h4>
                      <div className="space-y-2">
                        {order.items.map((item, i) => (
                          <div
                            key={i}
                            className="flex justify-between py-1.5 border-b border-cream-deep/20 last:border-0"
                          >
                            <div>
                              <p className="font-ui text-sm text-bark">
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

                    {/* Right: Payment + Address + Actions */}
                    <div>
                      {/* Payment Details */}
                      <h4 className="font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60 mb-3">
                        Payment
                      </h4>
                      <div className="p-3 bg-cream-warm rounded-lg mb-4">
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <span className="font-ui text-xs text-bark-light">Status</span>
                            <span className={`font-ui text-xs font-semibold ${order.status === 'PLACED' ? 'text-amber-600' : 'text-green-600'}`}>
                              {order.status === 'PLACED' ? 'Pending' : 'Paid'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-ui text-xs text-bark-light">Amount</span>
                            <span className="font-ui text-xs font-semibold text-bark">{formatINR(order.totalInPaisa)}</span>
                          </div>
                          {order.razorpayPaymentId && (
                            <>
                              <div className="flex justify-between">
                                <span className="font-ui text-xs text-bark-light">Razorpay ID</span>
                                <span className="font-ui text-xs font-mono text-bark-light">{order.razorpayPaymentId}</span>
                              </div>
                              <a
                                href={`https://dashboard.razorpay.com/app/payments/${order.razorpayPaymentId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 flex items-center justify-center gap-1.5 w-full py-2 bg-blue-50 text-blue-700 font-ui text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                View on Razorpay
                              </a>
                            </>
                          )}
                        </div>
                      </div>

                      <h4 className="font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60 mb-3">
                        Shipping Address
                      </h4>
                      <div className="p-3 bg-cream-warm mb-4">
                        <p className="font-ui text-sm text-bark leading-relaxed">
                          {order.address.name}
                          <br />
                          {order.address.phone}
                          <br />
                          {order.address.addressLine1}
                          <br />
                          {order.address.city}, {order.address.state}{' '}
                          {order.address.pincode}
                        </p>
                      </div>

                      {/* Tracking number input (for shipping) */}
                      {(order.status === 'PROCESSING' ||
                        order.status === 'PAID') && (
                        <div className="mb-4">
                          <label className="input-label">
                            Tracking Number
                          </label>
                          <input
                            type="text"
                            value={trackingInput[order.id] || ''}
                            onChange={(e) =>
                              setTrackingInput((prev) => ({
                                ...prev,
                                [order.id]: e.target.value,
                              }))
                            }
                            placeholder="e.g., DTDC1234567890"
                            className="input-field"
                          />
                        </div>
                      )}

                      {order.trackingNumber && (
                        <div className="mb-4 p-3 bg-cream-warm">
                          <p className="font-ui text-xs text-bark-light/60 uppercase tracking-wider mb-0.5">
                            Tracking Number
                          </p>
                          <p className="font-ui text-sm font-semibold text-bark">
                            {order.trackingNumber}
                          </p>
                        </div>
                      )}

                      {/* Status actions */}
                      {nextStatuses.length > 0 && (
                        <div>
                          <h4 className="font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60 mb-3">
                            Update Status
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {nextStatuses.map((ns) => (
                              <button
                                key={ns}
                                onClick={() =>
                                  updateStatus(order.id, ns)
                                }
                                className={`
                                  px-3 py-1.5 font-ui text-xs font-medium rounded transition-colors
                                  ${
                                    ns === 'CANCELLED'
                                      ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                      : 'bg-maroon/5 text-maroon hover:bg-maroon/10 border border-maroon/20'
                                  }
                                `}
                              >
                                {ns === 'CANCELLED'
                                  ? 'Cancel Order'
                                  : `Mark as ${formatStatus(ns)}`}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Summary */}
                      <div className="mt-4 pt-4 border-t border-cream-deep/40">
                        <div className="space-y-1">
                          <div className="flex justify-between font-ui text-xs text-bark-light">
                            <span>Subtotal</span>
                            <span>{formatINR(order.totalInPaisa)}</span>
                          </div>
                          <div className="flex justify-between font-ui text-xs text-bark-light">
                            <span>GST (5%)</span>
                            <span>{formatINR(order.gstInPaisa)}</span>
                          </div>
                          <div className="flex justify-between font-ui text-xs text-bark-light">
                            <span>Shipping</span>
                            <span>
                              {order.shippingInPaisa === 0
                                ? 'Free'
                                : formatINR(order.shippingInPaisa)}
                            </span>
                          </div>
                          <div className="flex justify-between font-ui text-sm font-semibold text-bark pt-1 border-t border-cream-deep/30">
                            <span>Total</span>
                            <span>{formatINR(order.grandTotalInPaisa)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-20 bg-white border border-cream-deep/60">
          <p className="font-body text-bark-light">No orders yet.</p>
        </div>
      )}
    </div>
  );
}
