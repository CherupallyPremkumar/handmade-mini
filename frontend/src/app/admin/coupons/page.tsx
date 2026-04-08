'use client';

import { useState, useEffect } from 'react';
import { authFetch } from '@/lib/auth-store';
import { formatINR } from '@/lib/format';

const API = process.env.NEXT_PUBLIC_API_URL || '';

interface Coupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  validFrom: string | null;
  validTo: string | null;
  isActive: boolean;
}

interface CouponForm {
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

const EMPTY: CouponForm = {
  code: '', type: 'PERCENTAGE', value: 0,
  minOrderAmount: null, maxDiscount: null,
  usageLimit: null, validFrom: '', validTo: '', isActive: true,
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [mode, setMode] = useState<'list' | 'form'>('list');
  const [saving, setSaving] = useState(false);
  const [valueDisplay, setValueDisplay] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await authFetch(`${API}/api/admin/coupons`);
    if (res.ok) setCoupons(await res.json());
  }

  function openAdd() {
    setForm(EMPTY);
    setValueDisplay('');
    setEditing(null);
    setMode('form');
  }

  function openEdit(c: Coupon) {
    setForm({
      code: c.code, type: c.type, value: c.value,
      minOrderAmount: c.minOrderAmount, maxDiscount: c.maxDiscount,
      usageLimit: c.usageLimit, validFrom: c.validFrom?.substring(0, 16) || '',
      validTo: c.validTo?.substring(0, 16) || '', isActive: c.isActive,
    });
    setValueDisplay(c.type === 'FIXED' ? String(c.value / 100) : String(c.value));
    setEditing(c);
    setMode('form');
  }

  async function save() {
    if (!form.code.trim() || form.value <= 0) return;
    setSaving(true);
    try {
      const body = {
        ...form,
        code: form.code.toUpperCase().trim(),
        validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : null,
        validTo: form.validTo ? new Date(form.validTo).toISOString() : null,
      };
      const url = editing ? `${API}/api/admin/coupons/${editing.id}` : `${API}/api/admin/coupons`;
      await authFetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      setMode('list');
      await load();
    } finally { setSaving(false); }
  }

  async function remove(id: string) {
    if (!confirm('Delete this coupon?')) return;
    setCoupons(prev => prev.filter(c => c.id !== id));
    await authFetch(`${API}/api/admin/coupons/${id}`, { method: 'DELETE' });
  }

  function formatDiscount(c: Coupon) {
    return c.type === 'PERCENTAGE' ? `${c.value}%` : formatINR(c.value);
  }

  function formatDate(iso: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  if (mode === 'form') {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold text-bark">{editing ? 'Edit Coupon' : 'Create Coupon'}</h1>
          <button onClick={() => setMode('list')} className="btn-outline rounded-lg">Cancel</button>
        </div>
        <div className="bg-white border border-cream-deep/60 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Coupon Code *</label>
              <input type="text" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                className="input-field font-mono tracking-widest" placeholder="WELCOME20" maxLength={30} />
            </div>
            <div>
              <label className="input-label">Discount Type *</label>
              <select value={form.type} onChange={e => { setForm(f => ({ ...f, type: e.target.value as 'PERCENTAGE' | 'FIXED', value: 0 })); setValueDisplay(''); }}
                className="input-field">
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (₹)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="input-label">{form.type === 'PERCENTAGE' ? 'Discount %' : 'Discount ₹'} *</label>
              <input type="number" value={valueDisplay}
                onChange={e => {
                  setValueDisplay(e.target.value);
                  const v = parseFloat(e.target.value || '0');
                  setForm(f => ({ ...f, value: f.type === 'FIXED' ? Math.round(v * 100) : v }));
                }}
                className="input-field" placeholder={form.type === 'PERCENTAGE' ? '20' : '500'} />
            </div>
            <div>
              <label className="input-label">Min Order (₹)</label>
              <input type="number" value={form.minOrderAmount ? form.minOrderAmount / 100 : ''}
                onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null }))}
                className="input-field" placeholder="999" />
            </div>
            <div>
              <label className="input-label">Max Discount (₹)</label>
              <input type="number" value={form.maxDiscount ? form.maxDiscount / 100 : ''}
                onChange={e => setForm(f => ({ ...f, maxDiscount: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null }))}
                className="input-field" placeholder="500" />
              <p className="font-ui text-[10px] text-bark-light/50 mt-1">Caps % discounts</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="input-label">Usage Limit</label>
              <input type="number" value={form.usageLimit ?? ''}
                onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value ? parseInt(e.target.value) : null }))}
                className="input-field" placeholder="100 (blank = unlimited)" />
            </div>
            <div>
              <label className="input-label">Valid From</label>
              <input type="datetime-local" value={form.validFrom}
                onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))}
                className="input-field" />
            </div>
            <div>
              <label className="input-label">Valid To</label>
              <input type="datetime-local" value={form.validTo}
                onChange={e => setForm(f => ({ ...f, validTo: e.target.value }))}
                className="input-field" />
            </div>
          </div>
          <label className="flex items-center gap-2 font-ui text-sm text-bark cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 accent-maroon" />
            Active
          </label>
          <div className="flex justify-end gap-3 pt-4 border-t border-cream-deep/40">
            <button onClick={() => setMode('list')} className="btn-outline rounded-lg">Cancel</button>
            <button onClick={save} disabled={saving || !form.code.trim() || form.value <= 0} className="btn-primary rounded-lg">
              {saving ? 'Saving...' : editing ? 'Update Coupon' : 'Create Coupon'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-bark">Coupons</h1>
          <p className="font-ui text-sm text-bark-light/60 mt-0.5">{coupons.length} coupon{coupons.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openAdd} className="btn-primary rounded-lg">+ Create Coupon</button>
      </div>

      {coupons.length === 0 ? (
        <div className="bg-white border border-cream-deep/60 p-12 text-center">
          <p className="font-body text-bark-light mb-4">No coupons yet. Create your first discount coupon.</p>
          <button onClick={openAdd} className="btn-primary rounded-lg">Create Coupon</button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-cream-deep/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cream-deep/40 bg-cream-warm/30">
                  <th className="text-left px-4 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">Code</th>
                  <th className="text-left px-4 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">Discount</th>
                  <th className="text-center px-4 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">Used</th>
                  <th className="text-left px-4 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">Validity</th>
                  <th className="text-center px-4 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">Status</th>
                  <th className="text-right px-4 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => {
                  const expired = c.validTo && new Date(c.validTo) < new Date();
                  return (
                    <tr key={c.id} className={`border-b border-cream-deep/20 last:border-0 hover:bg-cream-warm/50 ${!c.isActive || expired ? 'opacity-60' : ''}`}>
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm font-bold text-bark tracking-wider">{c.code}</span>
                        {c.minOrderAmount && <p className="font-ui text-[10px] text-bark-light/50">Min order: {formatINR(c.minOrderAmount)}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-ui text-sm font-semibold text-maroon">{formatDiscount(c)}</span>
                        {c.maxDiscount && <p className="font-ui text-[10px] text-bark-light/50">Max: {formatINR(c.maxDiscount)}</p>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-ui text-sm text-bark">{c.usedCount}</span>
                        {c.usageLimit && <span className="font-ui text-xs text-bark-light/50">/{c.usageLimit}</span>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-ui text-xs text-bark-light">{formatDate(c.validFrom)} — {formatDate(c.validTo)}</p>
                        {expired && <span className="font-ui text-[10px] text-red-500">Expired</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          !c.isActive ? 'bg-bark-light/10 text-bark-light' :
                          expired ? 'bg-red-50 text-red-500' :
                          'bg-green-50 text-green-700'
                        }`}>
                          {!c.isActive ? 'Inactive' : expired ? 'Expired' : 'Active'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-bark-light hover:text-maroon hover:bg-maroon/5 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => remove(c.id)} className="p-1.5 rounded-lg text-bark-light hover:text-red-500 hover:bg-red-500/5 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
