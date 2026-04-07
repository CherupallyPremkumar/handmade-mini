'use client';

import { useState, useEffect } from 'react';
import { authFetch } from '@/lib/auth-store';
import { formatINR } from '@/lib/format';

const API = process.env.NEXT_PUBLIC_API_URL || '';

interface Setting {
  key: string;
  value: string;
  description: string;
}

type FieldType = 'number' | 'currency' | 'boolean' | 'text';

interface FieldMeta {
  label: string;
  type: FieldType;
  section: string;
}

const SECTIONS = [
  { key: 'product', title: 'Product Rules', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { key: 'order', title: 'Orders & Payment', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z' },
  { key: 'display', title: 'Store Frontend', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
  { key: 'customer', title: 'Customer & Security', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { key: 'business', title: 'Business Info', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { key: 'notifications', title: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
];

const FIELDS: Record<string, FieldMeta> = {
  min_product_images: { label: 'Min Images Per Product', type: 'number', section: 'product' },
  min_product_videos: { label: 'Min Videos Per Product', type: 'number', section: 'product' },
  require_product_description: { label: 'Description Required', type: 'boolean', section: 'product' },
  require_secondary_description: { label: 'Secondary Description Required', type: 'boolean', section: 'product' },
  min_description_length: { label: 'Min Description Length (chars)', type: 'number', section: 'product' },

  payment_timeout_minutes: { label: 'Payment Timeout (minutes)', type: 'number', section: 'order' },
  cod_enabled: { label: 'Cash on Delivery', type: 'boolean', section: 'order' },
  min_order_amount: { label: 'Minimum Order Amount', type: 'currency', section: 'order' },
  max_order_amount: { label: 'Maximum Order Amount', type: 'currency', section: 'order' },
  free_shipping_threshold: { label: 'Free Shipping Threshold', type: 'currency', section: 'order' },
  shipping_cost: { label: 'Shipping Cost', type: 'currency', section: 'order' },
  order_cancellation_hours: { label: 'Cancellation Window (hours)', type: 'number', section: 'order' },
  max_pending_orders: { label: 'Max Pending Orders', type: 'number', section: 'order' },

  products_per_page: { label: 'Products Per Page', type: 'number', section: 'display' },
  featured_products_count: { label: 'Featured Products on Home', type: 'number', section: 'display' },
  show_out_of_stock: { label: 'Show Out-of-Stock Products', type: 'boolean', section: 'display' },
  low_stock_threshold: { label: 'Low Stock Badge Threshold', type: 'number', section: 'display' },

  max_addresses_per_user: { label: 'Max Addresses Per User', type: 'number', section: 'customer' },
  max_login_attempts: { label: 'Max Login Attempts', type: 'number', section: 'customer' },
  login_lockout_seconds: { label: 'Lockout Duration (seconds)', type: 'number', section: 'customer' },
  verification_email_expiry_hours: { label: 'Verification Link Expiry (hours)', type: 'number', section: 'customer' },

  store_name: { label: 'Store Name', type: 'text', section: 'business' },
  support_email: { label: 'Support Email', type: 'text', section: 'business' },
  support_phone: { label: 'Support Phone', type: 'text', section: 'business' },
  whatsapp_number: { label: 'WhatsApp Number', type: 'text', section: 'business' },
  gst_number: { label: 'GST Number', type: 'text', section: 'business' },
  return_policy_days: { label: 'Return Policy (days)', type: 'number', section: 'business' },

  send_order_confirmation_email: { label: 'Order Confirmation Email', type: 'boolean', section: 'notifications' },
  send_shipping_update_email: { label: 'Shipping Update Email', type: 'boolean', section: 'notifications' },
  admin_order_alert_email: { label: 'Admin Order Alert Email', type: 'text', section: 'notifications' },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [activeSection, setActiveSection] = useState('product');
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { loadSettings(); }, []);

  async function loadSettings() {
    const res = await authFetch(`${API}/api/admin/settings`);
    if (res.ok) setSettings(await res.json());
  }

  async function save(key: string) {
    setSaving(true);
    setMessage('');
    try {
      const meta = FIELDS[key];
      const valueToSend = meta?.type === 'currency'
        ? String(Math.round(parseFloat(editValue) * 100))
        : editValue;

      const res = await authFetch(`${API}/api/admin/settings/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: valueToSend }),
      });

      if (res.ok) {
        setMessage('Saved!');
        setEditing(null);
        await loadSettings();
      } else {
        const err = await res.json().catch(() => null);
        setMessage(err?.error || 'Failed to save');
      }
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  }

  async function toggleBoolean(key: string, currentValue: string) {
    setSaving(true);
    try {
      const res = await authFetch(`${API}/api/admin/settings/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: currentValue === 'true' ? 'false' : 'true' }),
      });
      if (res.ok) await loadSettings();
    } finally { setSaving(false); }
  }

  function displayValue(s: Setting) {
    const meta = FIELDS[s.key];
    if (meta?.type === 'currency') return formatINR(parseInt(s.value));
    return s.value || '—';
  }

  function editDisplayValue(s: Setting) {
    const meta = FIELDS[s.key];
    if (meta?.type === 'currency') return String(parseInt(s.value) / 100);
    return s.value;
  }

  const activeItems = settings
    .filter(s => FIELDS[s.key]?.section === activeSection)
    .sort((a, b) => {
      const keys = Object.keys(FIELDS);
      return keys.indexOf(a.key) - keys.indexOf(b.key);
    });

  const activeTitle = SECTIONS.find(s => s.key === activeSection)?.title || '';

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-bark mb-6">Settings</h1>

      {message && (
        <div className={`mb-4 p-3 rounded text-sm font-ui ${
          message === 'Saved!' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-6">
        {/* Sidebar */}
        <nav className="mb-6 lg:mb-0">
          <div className="bg-white border border-cream-deep/60 overflow-hidden lg:sticky lg:top-4">
            {SECTIONS.map(section => (
              <button
                key={section.key}
                onClick={() => { setActiveSection(section.key); setEditing(null); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-cream-deep/20 last:border-0 ${
                  activeSection === section.key
                    ? 'bg-maroon/5 text-maroon border-l-2 border-l-maroon'
                    : 'text-bark-light hover:bg-cream-warm/50 border-l-2 border-l-transparent'
                }`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={section.icon} />
                </svg>
                <span className="font-ui text-sm font-medium">{section.title}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="bg-white border border-cream-deep/60">
          <div className="px-6 py-4 border-b border-cream-deep/40 bg-cream-warm/20">
            <h2 className="font-display text-lg font-semibold text-bark">{activeTitle}</h2>
            <p className="font-ui text-xs text-bark-light/50 mt-0.5">
              {activeItems.length} setting{activeItems.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="divide-y divide-cream-deep/30">
            {activeItems.map(s => {
              const meta = FIELDS[s.key];
              return (
                <div key={s.key} className="px-6 py-4 flex items-center justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <p className="font-ui text-sm font-medium text-bark">{meta?.label || s.key}</p>
                    {s.description && (
                      <p className="font-ui text-xs text-bark-light/50 mt-0.5">{s.description}</p>
                    )}
                  </div>

                  {meta?.type === 'boolean' ? (
                    <button
                      onClick={() => toggleBoolean(s.key, s.value)}
                      disabled={saving}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                        s.value === 'true' ? 'bg-sage' : 'bg-bark-light/30'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        s.value === 'true' ? 'translate-x-5' : 'translate-x-1'
                      }`} />
                    </button>
                  ) : editing === s.key ? (
                    <div className="flex items-center gap-2 shrink-0">
                      {meta?.type === 'currency' && <span className="font-ui text-sm text-bark-light">₹</span>}
                      <input
                        type={meta?.type === 'text' ? 'text' : 'number'}
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') save(s.key); if (e.key === 'Escape') setEditing(null); }}
                        className={`input-field !py-1.5 !text-sm ${meta?.type === 'text' ? '!w-56' : '!w-28'}`}
                        autoFocus
                      />
                      <button onClick={() => save(s.key)} disabled={saving}
                        className="px-3 py-1.5 bg-maroon text-white text-xs font-ui rounded hover:bg-maroon-deep transition-colors">
                        {saving ? '...' : 'Save'}
                      </button>
                      <button onClick={() => setEditing(null)}
                        className="px-3 py-1.5 text-bark-light text-xs font-ui hover:text-bark transition-colors">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-ui text-sm font-medium text-bark">{displayValue(s)}</span>
                      <button
                        onClick={() => { setEditing(s.key); setEditValue(editDisplayValue(s)); }}
                        className="px-3 py-1.5 border border-cream-deep/60 text-bark-light text-xs font-ui rounded hover:border-bark-light/30 hover:text-bark transition-colors">
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {activeItems.length === 0 && (
              <div className="px-6 py-12 text-center">
                <p className="font-ui text-sm text-bark-light/50">No settings in this category yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
