'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, authFetch } from '@/lib/auth-store';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || '';

interface UserInfo {
  name: string;
  email: string;
  phone: string;
  role: string;
  emailVerified: boolean;
}

interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh',
];

const EMPTY_ADDR = {
  label: '', name: '', phone: '', line1: '', line2: '', city: '', state: 'Telangana', pincode: '',
};

export default function ProfilePage() {
  const router = useRouter();
  const { isLoggedIn, user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_ADDR);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'profile' | 'addresses'>('profile');

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && !isLoggedIn) router.replace('/login?redirect=/profile');
  }, [mounted, isLoggedIn, router]);

  useEffect(() => {
    if (isLoggedIn) {
      authFetch(`${API}/api/auth/me`).then(r => r.ok ? r.json() : null).then(d => { if (d) setUserInfo(d); });
      loadAddresses();
    }
  }, [isLoggedIn]);

  async function loadAddresses() {
    const res = await authFetch(`${API}/api/addresses`);
    if (res.ok) setAddresses(await res.json());
  }

  function openAdd() {
    setForm({ ...EMPTY_ADDR, name: userInfo?.name || '', phone: userInfo?.phone || '' });
    setEditId(null);
    setShowForm(true);
  }

  function openEdit(a: Address) {
    setForm({ label: a.label || '', name: a.name, phone: a.phone, line1: a.line1, line2: a.line2 || '', city: a.city, state: a.state, pincode: a.pincode });
    setEditId(a.id);
    setShowForm(true);
  }

  async function saveAddress() {
    if (!form.name || !form.phone || !form.line1 || !form.city || !form.pincode) return;
    setSaving(true);
    try {
      const url = editId ? `${API}/api/addresses/${editId}` : `${API}/api/addresses`;
      const method = editId ? 'PUT' : 'POST';
      await authFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      setShowForm(false);
      await loadAddresses();
    } finally { setSaving(false); }
  }

  async function deleteAddress(id: string) {
    if (!confirm('Delete this address?')) return;
    setAddresses(prev => prev.filter(a => a.id !== id));
    await authFetch(`${API}/api/addresses/${id}`, { method: 'DELETE' });
  }

  async function setDefault(id: string) {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
    await authFetch(`${API}/api/addresses/${id}/default`, { method: 'PATCH' });
  }

  if (!mounted || !isLoggedIn) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="animate-pulse"><div className="h-8 bg-cream-deep rounded w-48 mb-8" /><div className="h-64 bg-cream-deep rounded" /></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="font-display text-2xl font-bold text-bark mb-6">My Account</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-cream-deep/40">
        <button onClick={() => setTab('profile')}
          className={`px-4 py-2.5 font-ui text-sm font-medium transition-colors border-b-2 -mb-px ${
            tab === 'profile' ? 'border-maroon text-maroon' : 'border-transparent text-bark-light hover:text-bark'}`}>
          Profile
        </button>
        <button onClick={() => setTab('addresses')}
          className={`px-4 py-2.5 font-ui text-sm font-medium transition-colors border-b-2 -mb-px ${
            tab === 'addresses' ? 'border-maroon text-maroon' : 'border-transparent text-bark-light hover:text-bark'}`}>
          Addresses ({addresses.length})
        </button>
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && userInfo && (
        <div className="bg-white border border-cream-deep/60 p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-maroon/10 flex items-center justify-center text-maroon font-display text-xl font-bold">
              {userInfo.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-bark">{userInfo.name}</p>
              <p className="font-ui text-sm text-bark-light/60">{userInfo.role === 'ADMIN' ? 'Admin' : 'Customer'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-cream-deep/30">
              <span className="font-ui text-sm text-bark-light">Email</span>
              <div className="flex items-center gap-2">
                <span className="font-ui text-sm text-bark">{userInfo.email}</span>
                {userInfo.emailVerified ? (
                  <span className="font-ui text-[10px] px-1.5 py-0.5 bg-green-50 text-green-700 rounded">Verified</span>
                ) : (
                  <span className="font-ui text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded">Unverified</span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-cream-deep/30">
              <span className="font-ui text-sm text-bark-light">Phone</span>
              <span className="font-ui text-sm text-bark">{userInfo.phone || '—'}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="font-ui text-sm text-bark-light">Saved Addresses</span>
              <span className="font-ui text-sm text-bark">{addresses.length}</span>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <Link href="/my-orders" className="btn-outline rounded-lg text-sm">My Orders</Link>
            <button onClick={() => { logout(); router.replace('/'); }} className="px-4 py-2 text-sm font-ui text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Addresses Tab */}
      {tab === 'addresses' && (
        <div>
          {showForm ? (
            <div className="bg-white border border-cream-deep/60 p-6">
              <h3 className="font-display text-lg font-semibold text-bark mb-4">{editId ? 'Edit Address' : 'Add New Address'}</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Label (optional)</label>
                    <input type="text" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} className="input-field" placeholder="Home, Office, etc." />
                  </div>
                  <div>
                    <label className="input-label">Full Name *</label>
                    <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="input-label">Phone *</label>
                  <input type="text" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-field" placeholder="+91..." />
                </div>
                <div>
                  <label className="input-label">Address Line 1 *</label>
                  <input type="text" value={form.line1} onChange={e => setForm(f => ({ ...f, line1: e.target.value }))} className="input-field" placeholder="House/Flat No, Street" />
                </div>
                <div>
                  <label className="input-label">Address Line 2</label>
                  <input type="text" value={form.line2} onChange={e => setForm(f => ({ ...f, line2: e.target.value }))} className="input-field" placeholder="Landmark, Area" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="input-label">City *</label>
                    <input type="text" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label className="input-label">State *</label>
                    <select value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} className="input-field">
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Pincode *</label>
                    <input type="text" value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} className="input-field" maxLength={6} />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-cream-deep/40">
                  <button onClick={() => setShowForm(false)} className="btn-outline rounded-lg">Cancel</button>
                  <button onClick={saveAddress} disabled={saving} className="btn-primary rounded-lg">
                    {saving ? 'Saving...' : editId ? 'Update' : 'Save Address'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-end mb-4">
                <button onClick={openAdd} className="btn-primary rounded-lg text-sm">+ Add Address</button>
              </div>

              {addresses.length === 0 ? (
                <div className="bg-white border border-cream-deep/60 p-12 text-center">
                  <p className="font-body text-bark-light mb-4">No saved addresses. Add one for faster checkout.</p>
                  <button onClick={openAdd} className="btn-primary rounded-lg">Add Address</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map(a => (
                    <div key={a.id} className={`bg-white border p-4 rounded-lg ${a.isDefault ? 'border-maroon/40 ring-1 ring-maroon/20' : 'border-cream-deep/60'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-ui text-sm font-medium text-bark">{a.name}</span>
                            {a.label && <span className="font-ui text-xs px-2 py-0.5 bg-cream-deep rounded-full text-bark-light">{a.label}</span>}
                            {a.isDefault && <span className="font-ui text-xs px-2 py-0.5 bg-gold/10 text-gold rounded-full">Default</span>}
                          </div>
                          <p className="font-body text-sm text-bark-light">{a.line1}{a.line2 ? `, ${a.line2}` : ''}</p>
                          <p className="font-body text-sm text-bark-light">{a.city}, {a.state} - {a.pincode}</p>
                          <p className="font-ui text-xs text-bark-light/50 mt-1">{a.phone}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {!a.isDefault && (
                            <button onClick={() => setDefault(a.id)} className="px-2 py-1 text-xs font-ui text-maroon hover:bg-maroon/5 rounded transition-colors">
                              Set Default
                            </button>
                          )}
                          <button onClick={() => openEdit(a)} className="p-1.5 text-bark-light hover:text-maroon transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => deleteAddress(a.id)} className="p-1.5 text-bark-light hover:text-red-500 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
