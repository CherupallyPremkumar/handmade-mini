'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { formatINR } from '@/lib/format';
import StatusTimeline from '@/components/StatusTimeline';
import type { OrderStatus } from '@/lib/types';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8090';

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: OrderItem[];
  subtotal: number;
  gstAmount: number;
  shippingCost: number;
  totalAmount: number;
  paymentStatus: string | null;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  status: string;
  trackingNumber: string | null;
  createdTime: string;
}

const STATUS_COLORS: Record<string, string> = {
  PLACED: 'bg-amber-50 text-amber-700 border border-amber-200',
  PAID: 'bg-green-50 text-green-700 border border-green-200',
  SHIPPED: 'bg-blue-50 text-blue-700 border border-blue-200',
  DELIVERED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  CANCELLED: 'bg-red-50 text-red-600 border border-red-200',
};

const NEXT_STATUS: Record<string, string[]> = {
  PLACED: ['PAID', 'CANCELLED'],
  PAID: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
};

export default function AdminOrdersPage() {
  const { getAuthHeaders } = useAuthStore();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  async function fetchOrders() {
    setLoading(true);
    try {
      const url = statusFilter
        ? `${API}/api/admin/orders?status=${statusFilter}`
        : `${API}/api/admin/orders`;
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (res.ok) {
        setOrders(await res.json());
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(orderId: string, newStatus: string) {
    setUpdating(orderId);
    try {
      const body: Record<string, string> = { status: newStatus };
      if (newStatus === 'SHIPPED' && trackingInput[orderId]) {
        body.trackingNumber = trackingInput[orderId];
      }
      const res = await fetch(`${API}/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      }
    } catch {
      // silent
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-bark">Orders</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field !w-auto !py-1.5 !px-3 !text-xs"
        >
          <option value="">All Orders</option>
          <option value="PLACED">Placed</option>
          <option value="PAID">Paid</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-cream-deep/50 h-20 rounded" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white border border-cream-deep/60">
          <p className="font-body text-bark-light">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const expanded = expandedId === order.id;
            const nextStatuses = NEXT_STATUS[order.status] || [];

            return (
              <div
                key={order.id}
                className="bg-white border border-cream-deep/60 overflow-hidden"
              >
                {/* Row */}
                <button
                  onClick={() => setExpandedId(expanded ? null : order.id)}
                  className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-cream-warm/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-ui text-sm font-semibold text-bark">
                        {order.orderNumber}
                      </p>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full font-ui text-[11px] font-medium ${STATUS_COLORS[order.status] || 'bg-gray-50 text-gray-600'}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="font-ui text-xs text-bark-light">
                      {order.customerName} &middot; {order.shippingAddress.city} &middot;{' '}
                      {new Date(order.createdTime).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Expanded */}
                {expanded && (
                  <div className="border-t border-cream-deep/40 animate-fade-in">
                    <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left: Timeline + Items */}
                      <div>
                        <h4 className="font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60 mb-3">
                          Order Status
                        </h4>
                        <StatusTimeline currentStatus={order.status as OrderStatus} />

                        <h4 className="font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60 mb-3 mt-6">
                          Items
                        </h4>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between py-1.5 border-b border-cream-deep/20 last:border-0"
                            >
                              <div>
                                <p className="font-ui text-sm text-bark">
                                  {item.productName}
                                </p>
                                <p className="font-ui text-xs text-bark-light">
                                  Qty: {item.quantity} &times; {formatINR(item.unitPrice)}
                                </p>
                              </div>
                              <p className="font-ui text-sm font-medium text-bark">
                                {formatINR(item.totalPrice)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Customer + Payment + Actions */}
                      <div>
                        {/* Customer */}
                        <h4 className="font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60 mb-3">
                          Customer
                        </h4>
                        <div className="p-3 bg-cream-warm mb-4">
                          <p className="font-ui text-sm text-bark leading-relaxed">
                            <span className="font-semibold">{order.customerName}</span>
                            <br />
                            {order.customerPhone}
                            <br />
                            {order.customerEmail}
                          </p>
                        </div>

                        {/* Shipping */}
                        <h4 className="font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60 mb-3">
                          Shipping Address
                        </h4>
                        <div className="p-3 bg-cream-warm mb-4">
                          <p className="font-ui text-sm text-bark leading-relaxed">
                            {order.shippingAddress.line1}
                            {order.shippingAddress.line2 && (
                              <>, {order.shippingAddress.line2}</>
                            )}
                            <br />
                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                          </p>
                        </div>

                        {/* Payment */}
                        <h4 className="font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60 mb-3">
                          Payment
                        </h4>
                        <div className="p-3 bg-cream-warm mb-4 space-y-1.5">
                          <div className="flex justify-between font-ui text-xs">
                            <span className="text-bark-light">Status</span>
                            <span className={`font-semibold ${order.paymentStatus === 'captured' ? 'text-green-600' : 'text-amber-600'}`}>
                              {order.paymentStatus || 'Pending'}
                            </span>
                          </div>
                          {order.razorpayPaymentId && (
                            <div className="flex justify-between font-ui text-xs">
                              <span className="text-bark-light">Razorpay ID</span>
                              <span className="font-mono text-bark-light">{order.razorpayPaymentId}</span>
                            </div>
                          )}
                        </div>

                        {/* Tracking input */}
                        {(order.status === 'PAID') && (
                          <div className="mb-4">
                            <label className="input-label">Tracking Number</label>
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
                                  onClick={() => updateStatus(order.id, ns)}
                                  disabled={updating === order.id}
                                  className={`px-3 py-1.5 font-ui text-xs font-medium rounded transition-colors disabled:opacity-50 ${
                                    ns === 'CANCELLED'
                                      ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                      : 'bg-maroon/5 text-maroon hover:bg-maroon/10 border border-maroon/20'
                                  }`}
                                >
                                  {updating === order.id ? 'Updating...' : ns === 'CANCELLED' ? 'Cancel Order' : `Mark as ${ns}`}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Summary */}
                        <div className="mt-4 pt-4 border-t border-cream-deep/40 space-y-1">
                          <div className="flex justify-between font-ui text-xs text-bark-light">
                            <span>Subtotal</span>
                            <span>{formatINR(order.subtotal)}</span>
                          </div>
                          <div className="flex justify-between font-ui text-xs text-bark-light">
                            <span>GST</span>
                            <span>{formatINR(order.gstAmount)}</span>
                          </div>
                          <div className="flex justify-between font-ui text-xs text-bark-light">
                            <span>Shipping</span>
                            <span>{order.shippingCost === 0 ? 'Free' : formatINR(order.shippingCost)}</span>
                          </div>
                          <div className="flex justify-between font-ui text-sm font-semibold text-bark pt-1 border-t border-cream-deep/30">
                            <span>Total</span>
                            <span>{formatINR(order.totalAmount)}</span>
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
      )}
    </div>
  );
}
