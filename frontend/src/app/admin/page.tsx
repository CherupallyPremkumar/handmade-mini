'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatINR } from '@/lib/format';

const API = process.env.NEXT_PUBLIC_API_URL || '';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  totalAmount: number;
  shippingAddress: { city?: string };
  createdTime: string;
  items: { productName: string; quantity: number }[];
}

interface Product {
  id: string;
  name: string;
  stock: number;
  sellingPrice: number;
  images: string[];
  videoUrl: string | null;
}

const STATUS_DOT: Record<string, string> = {
  PENDING_PAYMENT: 'bg-yellow-400',
  PLACED: 'bg-amber-400',
  PAID: 'bg-green-400',
  SHIPPED: 'bg-blue-400',
  DELIVERED: 'bg-emerald-400',
  CANCELLED: 'bg-red-400',
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/admin/orders`, { credentials: 'include' as RequestCredentials }).then((r) => r.ok ? r.json() : []),
      fetch(`${API}/api/products`).then((r) => r.ok ? r.json() : []),
    ])
      .then(([o, p]) => { setOrders(o); setProducts(p); })
      .catch(() => { setOrders([]); setProducts([]); })
      .finally(() => setLoading(false));
  }, []);

  const paidOrders = orders.filter((o) => ['PAID', 'SHIPPED', 'DELIVERED'].includes(o.status));
  const totalRevenue = paidOrders.reduce((s, o) => s + o.totalAmount, 0);
  const pendingCount = orders.filter((o) => ['PENDING_PAYMENT', 'PLACED'].includes(o.status)).length;
  const lowStock = products.filter((p) => p.stock <= 3);
  const noVideo = products.filter((p) => !p.videoUrl);
  const todayOrders = orders.filter((o) => new Date(o.createdTime).toDateString() === new Date().toDateString());

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 animate-pulse bg-cream-deep/50 rounded-xl" />)}</div>
        <div className="h-64 animate-pulse bg-cream-deep/50 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-bark">Dashboard</h1>
          <p className="font-ui text-xs text-bark-light mt-0.5">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <Link href="/admin/sarees?action=add" className="btn-primary text-sm hidden sm:flex">+ Add Product</Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl p-4 border border-cream-deep/60 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-ui text-[10px] uppercase tracking-wider text-bark-light/60">Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-sage/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <p className="font-display text-xl sm:text-2xl font-bold text-bark">{formatINR(totalRevenue)}</p>
          <p className="font-ui text-[10px] text-sage mt-1">{paidOrders.length} paid orders</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-cream-deep/60 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-ui text-[10px] uppercase tracking-wider text-bark-light/60">Orders</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
          </div>
          <p className="font-display text-xl sm:text-2xl font-bold text-bark">{orders.length}</p>
          <p className="font-ui text-[10px] text-blue-600 mt-1">{todayOrders.length} today</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-cream-deep/60 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-ui text-[10px] uppercase tracking-wider text-bark-light/60">Products</span>
            <div className="w-8 h-8 rounded-lg bg-maroon/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-maroon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
          </div>
          <p className="font-display text-xl sm:text-2xl font-bold text-bark">{products.length}</p>
          <p className="font-ui text-[10px] text-bark-light mt-1">{noVideo.length} missing video</p>
        </div>

        <div className={`rounded-xl p-4 border shadow-sm ${pendingCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-cream-deep/60'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-ui text-[10px] uppercase tracking-wider text-bark-light/60">Pending</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${pendingCount > 0 ? 'bg-amber-100' : 'bg-cream-deep/30'}`}>
              <svg className={`w-4 h-4 ${pendingCount > 0 ? 'text-amber-600' : 'text-bark-light/40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <p className="font-display text-xl sm:text-2xl font-bold text-bark">{pendingCount}</p>
          <p className="font-ui text-[10px] text-amber-600 mt-1">{pendingCount > 0 ? 'Needs attention' : 'All clear'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-cream-deep/60 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-cream-deep/40 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-bark">Recent Orders</h2>
            <Link href="/admin/orders" className="font-ui text-xs text-maroon hover:underline">View All →</Link>
          </div>
          <div className="divide-y divide-cream-deep/30">
            {orders.slice(0, 8).map((order) => (
              <div key={order.id} className="px-5 py-3 flex items-center gap-3 hover:bg-cream-warm/30 transition-colors">
                <div className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[order.status] || 'bg-gray-300'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-ui text-sm font-medium text-bark truncate">{order.customerName}</p>
                    <span className="font-ui text-[10px] text-bark-light/50 hidden sm:inline">{order.orderNumber}</span>
                  </div>
                  <p className="font-ui text-xs text-bark-light/60 truncate">
                    {order.items?.map(i => i.productName).join(', ') || 'No items'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-ui text-sm font-semibold text-bark">{formatINR(order.totalAmount)}</p>
                  <p className="font-ui text-[10px] text-bark-light/50">{new Date(order.createdTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="px-5 py-12 text-center">
                <p className="font-ui text-sm text-bark-light/50">No orders yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-cream-deep/60 shadow-sm p-4">
            <h3 className="font-ui text-xs font-semibold uppercase tracking-wider text-bark-light/60 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/admin/sarees?action=add" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-cream-warm transition-colors">
                <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center"><svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg></div>
                <span className="font-ui text-sm text-bark">Add Product</span>
              </Link>
              <Link href="/admin/orders" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-cream-warm transition-colors">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg></div>
                <span className="font-ui text-sm text-bark">Manage Orders</span>
              </Link>
              <Link href="/admin/nool" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-cream-warm transition-colors">
                <div className="w-8 h-8 rounded-lg bg-maroon/10 flex items-center justify-center"><svg className="w-4 h-4 text-maroon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></div>
                <span className="font-ui text-sm text-bark">Upload Videos</span>
              </Link>
            </div>
          </div>

          {lowStock.length > 0 && (
            <div className="bg-red-50 rounded-xl border border-red-200 p-4">
              <h3 className="font-ui text-xs font-semibold uppercase tracking-wider text-red-600 mb-3">Low Stock ({lowStock.length})</h3>
              <div className="space-y-2">
                {lowStock.slice(0, 5).map((p) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <p className="font-ui text-xs text-bark truncate flex-1">{p.name}</p>
                    <span className="font-ui text-xs font-bold text-red-600 ml-2">{p.stock} left</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-cream-deep/60 shadow-sm p-4">
            <h3 className="font-ui text-xs font-semibold uppercase tracking-wider text-bark-light/60 mb-3">Store Health</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-ui text-xs text-bark-light">Products with 3+ images</span>
                <span className="font-ui text-xs font-semibold text-bark">{products.filter(p => p.images?.length >= 3).length}/{products.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-ui text-xs text-bark-light">Products with video</span>
                <span className="font-ui text-xs font-semibold text-bark">{products.filter(p => p.videoUrl).length}/{products.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-ui text-xs text-bark-light">Avg. order value</span>
                <span className="font-ui text-xs font-semibold text-bark">{paidOrders.length > 0 ? formatINR(Math.round(totalRevenue / paidOrders.length)) : '₹0'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-ui text-xs text-bark-light">Total stock</span>
                <span className="font-ui text-xs font-semibold text-bark">{products.reduce((s, p) => s + p.stock, 0)} units</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
