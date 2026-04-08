'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatINR } from '@/lib/format';
import { authFetch } from '@/lib/auth-store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL || '';

interface Analytics {
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  ordersToday: number;
  totalOrders: number;
  ordersByStatus: Record<string, number>;
  topProducts: { name: string; quantity: number; revenue: number }[];
  recentOrders: { orderNumber: string; customerName: string; status: string; totalAmount: number; createdTime: string }[];
  lowStockProducts: { name: string; stock: number; sku: string }[];
}

const STATUS_DOT: Record<string, string> = {
  PENDING_PAYMENT: 'bg-yellow-400',
  PAID: 'bg-blue-500',
  SHIPPED: 'bg-purple-500',
  DELIVERED: 'bg-green-500',
  CANCELLED: 'bg-red-400',
};

export default function AdminDashboard() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch(`${API}/api/admin/analytics`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="animate-pulse h-24 bg-cream-deep/50 rounded-xl" />)}
        </div>
        <div className="animate-pulse h-64 bg-cream-deep/50 rounded-xl" />
      </div>
    );
  }

  if (!data) return <p className="text-bark-light">Failed to load analytics.</p>;

  const chartData = data.topProducts.map(p => ({
    name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
    revenue: Math.round(p.revenue / 100),
    quantity: p.quantity,
  }));

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-bark mb-6">Dashboard</h1>

      {/* Revenue Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Revenue Today" value={formatINR(data.revenueToday)} accent="gold" />
        <StatCard label="Revenue This Week" value={formatINR(data.revenueThisWeek)} accent="sage" />
        <StatCard label="Revenue This Month" value={formatINR(data.revenueThisMonth)} accent="maroon" />
        <StatCard label="Orders Today" value={String(data.ordersToday)} sub={`${data.totalOrders} total`} accent="bark" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Top Products Chart */}
        {chartData.length > 0 && (
          <div className="bg-white border border-cream-deep/60 p-5 rounded-xl">
            <h3 className="font-display text-base font-semibold text-bark mb-4">Top Selling Products</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e8d8" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#5C4033' }} />
                <YAxis tick={{ fontSize: 10, fill: '#5C4033' }} />
                <Tooltip
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ fontFamily: 'Outfit', fontSize: 12, borderRadius: 8, border: '1px solid #e8e0d4' }}
                />
                <Bar dataKey="revenue" fill="#8B1A1A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Orders by Status */}
        <div className="bg-white border border-cream-deep/60 p-5 rounded-xl">
          <h3 className="font-display text-base font-semibold text-bark mb-4">Orders by Status</h3>
          <div className="space-y-3">
            {Object.entries(data.ordersByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[status] || 'bg-bark-light/30'}`} />
                  <span className="font-ui text-sm text-bark">{status.replace('_', ' ')}</span>
                </div>
                <span className="font-ui text-sm font-semibold text-bark">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white border border-cream-deep/60 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-cream-deep/40 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold text-bark">Recent Orders</h3>
            <Link href="/admin/orders" className="font-ui text-xs text-maroon hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-cream-deep/30">
            {data.recentOrders.map(o => (
              <div key={o.orderNumber} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="font-ui text-sm font-medium text-bark">{o.orderNumber}</p>
                  <p className="font-ui text-xs text-bark-light/50">{o.customerName} &middot; {new Date(o.createdTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                </div>
                <div className="text-right">
                  <p className="font-ui text-sm font-semibold text-bark">{formatINR(o.totalAmount)}</p>
                  <div className="flex items-center gap-1.5 justify-end">
                    <div className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[o.status] || 'bg-bark-light/30'}`} />
                    <span className="font-ui text-[10px] text-bark-light/60">{o.status.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            ))}
            {data.recentOrders.length === 0 && (
              <p className="px-5 py-6 text-center font-body text-bark-light text-sm">No orders yet</p>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white border border-cream-deep/60 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-cream-deep/40">
            <h3 className="font-display text-base font-semibold text-bark">Low Stock Alerts</h3>
          </div>
          <div className="divide-y divide-cream-deep/30">
            {data.lowStockProducts.map(p => (
              <div key={p.sku} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="font-ui text-sm text-bark">{p.name}</p>
                  <p className="font-mono text-[10px] text-bark-light/40">{p.sku}</p>
                </div>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                  p.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                </span>
              </div>
            ))}
            {data.lowStockProducts.length === 0 && (
              <div className="px-5 py-6 text-center">
                <span className="font-ui text-xs text-sage">All products well stocked</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent: string }) {
  const colors: Record<string, string> = {
    gold: 'border-l-gold bg-gold/5',
    sage: 'border-l-sage bg-sage/5',
    maroon: 'border-l-maroon bg-maroon/5',
    bark: 'border-l-bark bg-bark/5',
  };
  return (
    <div className={`border border-cream-deep/60 border-l-4 ${colors[accent] || ''} p-4 rounded-lg`}>
      <p className="font-ui text-xs text-bark-light/60 uppercase tracking-wider">{label}</p>
      <p className="font-display text-xl font-bold text-bark mt-1">{value}</p>
      {sub && <p className="font-ui text-xs text-bark-light/40 mt-0.5">{sub}</p>}
    </div>
  );
}
