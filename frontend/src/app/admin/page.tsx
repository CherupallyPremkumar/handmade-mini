'use client';

import Link from 'next/link';
import { sampleSarees, sampleOrders } from '@/lib/sample-data';
import { formatINR, formatStatus, statusColor } from '@/lib/format';

export default function AdminDashboard() {
  const totalSarees = sampleSarees.length;
  const totalOrders = sampleOrders.length;
  const revenueToday = sampleOrders
    .filter(
      (o) =>
        new Date(o.createdAt).toDateString() === new Date().toDateString()
    )
    .reduce((sum, o) => sum + o.grandTotalInPaisa, 0);

  const stats = [
    {
      label: 'Total Sarees',
      value: totalSarees,
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      ),
      color: 'bg-maroon/10 text-maroon',
    },
    {
      label: 'Total Orders',
      value: totalOrders,
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      ),
      color: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Revenue Today',
      value: revenueToday > 0 ? formatINR(revenueToday) : '\u20B90',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
      color: 'bg-sage/10 text-sage',
    },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-bark mb-6">
        Dashboard
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-cream-deep/60 p-5 flex items-center gap-4"
          >
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {stat.icon}
              </svg>
            </div>
            <div>
              <p className="font-ui text-xs text-bark-light uppercase tracking-wider">
                {stat.label}
              </p>
              <p className="font-display text-2xl font-bold text-bark">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link
          href="/admin/sarees"
          className="bg-white border border-cream-deep/60 p-5 hover:border-maroon/30 transition-colors group flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold/20 transition-colors">
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <div>
            <p className="font-ui text-sm font-semibold text-bark group-hover:text-maroon transition-colors">
              Manage Sarees
            </p>
            <p className="font-ui text-xs text-bark-light">
              Add, edit, or remove sarees from your catalog
            </p>
          </div>
        </Link>

        <Link
          href="/admin/orders"
          className="bg-white border border-cream-deep/60 p-5 hover:border-maroon/30 transition-colors group flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </div>
          <div>
            <p className="font-ui text-sm font-semibold text-bark group-hover:text-maroon transition-colors">
              View Orders
            </p>
            <p className="font-ui text-xs text-bark-light">
              Manage orders, update status, add tracking
            </p>
          </div>
        </Link>
      </div>

      {/* Recent orders */}
      <div className="bg-white border border-cream-deep/60">
        <div className="px-5 py-4 border-b border-cream-deep/40 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-bark">
            Recent Orders
          </h2>
          <Link
            href="/admin/orders"
            className="font-ui text-xs text-maroon hover:underline"
          >
            View All
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cream-deep/40">
                <th className="text-left px-5 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">
                  Order
                </th>
                <th className="text-left px-5 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">
                  Customer
                </th>
                <th className="text-left px-5 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">
                  Status
                </th>
                <th className="text-right px-5 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {sampleOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-cream-deep/20 last:border-0 hover:bg-cream-warm/50 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <p className="font-ui text-sm font-medium text-bark">
                      {order.orderNumber}
                    </p>
                    <p className="font-ui text-xs text-bark-light/60">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-ui text-sm text-bark">
                      {order.address.name}
                    </p>
                    <p className="font-ui text-xs text-bark-light/60">
                      {order.address.city}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full font-ui text-xs font-medium ${statusColor(order.status)}`}
                    >
                      {formatStatus(order.status)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <p className="font-ui text-sm font-semibold text-bark">
                      {formatINR(order.grandTotalInPaisa)}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
