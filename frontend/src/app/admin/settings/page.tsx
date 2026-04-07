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

const LABELS: Record<string, { label: string; type: 'number' | 'currency' | 'boolean' }> = {
  min_product_images: { label: 'Min Images Per Product', type: 'number' },
  min_product_videos: { label: 'Min Videos Per Product', type: 'number' },
  require_product_description: { label: 'Description Required', type: 'boolean' },
  require_secondary_description: { label: 'Secondary Description Required', type: 'boolean' },
  max_addresses_per_user: { label: 'Max Addresses Per User', type: 'number' },
  max_pending_orders: { label: 'Max Pending Orders Per Customer', type: 'number' },
  free_shipping_threshold: { label: 'Free Shipping Threshold', type: 'currency' },
  shipping_cost: { label: 'Shipping Cost', type: 'currency' },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const res = await authFetch(`${API}/api/admin/settings`);
    if (res.ok) {
      setSettings(await res.json());
    }
  }

  async function save(key: string) {
    setSaving(true);
    setMessage('');
    try {
      const meta = LABELS[key];
      // Convert rupees back to paisa for currency fields
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

  function displayValue(setting: Setting) {
    const meta = LABELS[setting.key];
    if (meta?.type === 'currency') {
      return formatINR(parseInt(setting.value));
    }
    return setting.value;
  }

  function editDisplayValue(setting: Setting) {
    const meta = LABELS[setting.key];
    if (meta?.type === 'currency') {
      return String(parseInt(setting.value) / 100);
    }
    return setting.value;
  }

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

      <div className="bg-white border border-cream-deep/60 divide-y divide-cream-deep/40">
        {settings.map((s) => {
          const meta = LABELS[s.key];
          return (
            <div key={s.key} className="p-5 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-ui text-sm font-medium text-bark">
                  {meta?.label || s.key}
                </p>
                {s.description && (
                  <p className="font-ui text-xs text-bark-light/60 mt-0.5">{s.description}</p>
                )}
              </div>

              {meta?.type === 'boolean' ? (
                <button
                  onClick={async () => {
                    const newVal = s.value === 'true' ? 'false' : 'true';
                    setSaving(true);
                    try {
                      const res = await authFetch(`${API}/api/admin/settings/${s.key}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ value: newVal }),
                      });
                      if (res.ok) await loadSettings();
                    } finally { setSaving(false); }
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    s.value === 'true' ? 'bg-sage' : 'bg-bark-light/30'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    s.value === 'true' ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
              ) : editing === s.key ? (
                <div className="flex items-center gap-2">
                  {meta?.type === 'currency' && (
                    <span className="font-ui text-sm text-bark-light">₹</span>
                  )}
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="input-field !w-28 !py-1.5 !text-sm"
                    autoFocus
                  />
                  <button
                    onClick={() => save(s.key)}
                    disabled={saving}
                    className="px-3 py-1.5 bg-maroon text-white text-xs font-ui rounded hover:bg-maroon-deep transition-colors"
                  >
                    {saving ? '...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="px-3 py-1.5 text-bark-light text-xs font-ui hover:text-bark transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="font-ui text-sm font-medium text-bark">
                    {displayValue(s)}
                  </span>
                  <button
                    onClick={() => {
                      setEditing(s.key);
                      setEditValue(editDisplayValue(s));
                    }}
                    className="px-3 py-1.5 border border-cream-deep/60 text-bark-light text-xs font-ui rounded hover:border-bark-light/30 transition-colors"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
