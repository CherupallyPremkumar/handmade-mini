'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth-store';
import { formatINR } from '@/lib/format';

const API = process.env.NEXT_PUBLIC_API_URL || '';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: string;
  totalAmount: number;
  shippingAddress: { city: string };
  createdTime: string;
}

interface Product {
  id: string;
  name: string;
  stock: number;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: 'bg-yellow-50 text-yellow-700',
  PLACED: 'bg-amber-50 text-amber-700',
  PAID: 'bg-green-50 text-green-700',
  SHIPPED: 'bg-blue-50 text-blue-700',
  DELIVERED: 'bg-emerald-50 text-emerald-700',
  CANCELLED: 'bg-red-50 text-red-600',
};

export default function AdminDashboard() {
  const { getAuthHeaders } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/admin/orders`, { headers: getAuthHeaders() }).then((r) => r.ok ? r.json() : []),
      fetch(`${API}/api/products`).then((r) => r.ok ? r.json() : []),
    ])
      .then(([o, p]) => { setOrders(o); setProducts(p); })
      .catch(() => { setOrders([]); setProducts([]); })
      .finally(() => setLoading(false));
  }, []);

  const totalProducts = products.length;
  const totalOrders = orders.length;
  const paidOrders = orders.filter((o) => o.status === 'PAID' || o.status === 'SHIPPED' || o.status === 'DELIVERED');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrders = orders.filter((o) => o.status === 'PENDING_PAYMENT' || o.status === 'PLACED').length;
  const lowStock = products.filter((p) => p.stock <= 3).length;

  const stats = [
    { label: 'Products', value: String(totalProducts), color: 'bg-maroon/10 text-maroon', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { label: 'Total Orders', value: String(totalOrders), color: 'bg-blue-100 text-blue-700', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { label: 'Revenue', value: formatINR(totalRevenue), color: 'bg-sage/10 text-sage', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Pending', value: String(pendingOrders), color: 'bg-amber-50 text-amber-700', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Low Stock', value: String(lowStock), color: lowStock > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z' },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-bark mb-6">Dashboard</h1>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse bg-cream-deep/50 h-20 rounded" />
          ))}
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white border border-cream-deep/60 p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                    </svg>
                  </div>
                  <div>
                    <p className="font-ui text-[10px] text-bark-light uppercase tracking-wider">{stat.label}</p>
                    <p className="font-display text-xl font-bold text-bark">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Link href="/admin/sarees" className="bg-white border border-cream-deep/60 p-5 hover:border-maroon/30 transition-colors group">
              <p className="font-ui text-sm font-semibold text-bark group-hover:text-maroon">Manage Products</p>
              <p className="font-ui text-xs text-bark-light mt-1">Add, edit, delete products</p>
            </Link>
            <Link href="/admin/orders" className="bg-white border border-cream-deep/60 p-5 hover:border-maroon/30 transition-colors group">
              <p className="font-ui text-sm font-semibold text-bark group-hover:text-maroon">View Orders</p>
              <p className="font-ui text-xs text-bark-light mt-1">Update status, add tracking</p>
            </Link>
            <Link href="/admin/nool" className="bg-white border border-cream-deep/60 p-5 hover:border-maroon/30 transition-colors group">
              <p className="font-ui text-sm font-semibold text-bark group-hover:text-maroon">Nool Videos</p>
              <p className="font-ui text-xs text-bark-light mt-1">Upload product videos</p>
            </Link>
          </div>

          {/* Recent orders */}
          <div className="bg-white border border-cream-deep/60">
            <div className="px-5 py-4 border-b border-cream-deep/40 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-bark">Recent Orders</h2>
              <Link href="/admin/orders" className="font-ui text-xs text-maroon hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cream-deep/40">
                    <th className="text-left px-5 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">Order</th>
                    <th className="text-left px-5 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">Customer</th>
                    <th className="text-left px-5 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">Status</th>
                    <th className="text-right px-5 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 10).map((order) => (
                    <tr key={order.id} className="border-b border-cream-deep/20 last:border-0 hover:bg-cream-warm/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-ui text-sm font-medium text-bark">{order.orderNumber}</p>
                        <p className="font-ui text-xs text-bark-light/60">
                          {new Date(order.createdTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-ui text-sm text-bark">{order.customerName}</p>
                        <p className="font-ui text-xs text-bark-light/60">{order.shippingAddress?.city}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-block px-2.5 py-1 rounded-full font-ui text-xs font-medium ${STATUS_COLORS[order.status] || 'bg-gray-50 text-gray-600'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <p className="font-ui text-sm font-semibold text-bark">{formatINR(order.totalAmount)}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && (
                <div className="text-center py-10 text-bark-light font-ui text-sm">No orders yet</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
