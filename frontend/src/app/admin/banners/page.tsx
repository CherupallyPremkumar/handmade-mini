'use client';

import { useState, useEffect } from 'react';
import { authFetch } from '@/lib/auth-store';

const API = process.env.NEXT_PUBLIC_API_URL || '';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  mobileImageUrl: string;
  linkUrl: string;
  linkText: string;
  textColor: string;
  position: number;
  isActive: boolean;
}

const EMPTY: Omit<Banner, 'id'> = {
  title: '', subtitle: '', imageUrl: '', mobileImageUrl: '',
  linkUrl: '/sarees', linkText: 'Shop Now', textColor: '#FFFFFF', position: 0, isActive: true,
};

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [mode, setMode] = useState<'list' | 'form'>('list');
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await authFetch(`${API}/api/admin/banners`);
    if (res.ok) setBanners(await res.json());
  }

  function openAdd() {
    setForm(EMPTY);
    setEditing(null);
    setMode('form');
  }

  function openEdit(b: Banner) {
    setForm(b);
    setEditing(b);
    setMode('form');
  }

  async function save() {
    if (!form.imageUrl) return;
    setSaving(true);
    try {
      const url = editing ? `${API}/api/admin/banners/${editing.id}` : `${API}/api/admin/banners`;
      const method = editing ? 'PUT' : 'POST';
      await authFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      setMode('list');
      await load();
    } finally { setSaving(false); }
  }

  async function toggle(id: string) {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b));
    await authFetch(`${API}/api/admin/banners/${id}/toggle`, { method: 'PATCH' });
  }

  async function remove(id: string) {
    if (!confirm('Delete this banner?')) return;
    setBanners(prev => prev.filter(b => b.id !== id));
    await authFetch(`${API}/api/admin/banners/${id}`, { method: 'DELETE' });
  }

  if (mode === 'form') {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold text-bark">{editing ? 'Edit Banner' : 'Add Banner'}</h1>
          <button onClick={() => setMode('list')} className="btn-outline rounded-lg">Cancel</button>
        </div>
        <div className="bg-white border border-cream-deep/60 p-6 space-y-4">
          {form.imageUrl && (
            <div className="rounded-lg overflow-hidden h-48 bg-bark">
              <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Image URL *</label>
              <input type="text" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} className="input-field" placeholder="https://..." />
            </div>
            <div>
              <label className="input-label">Mobile Image URL</label>
              <input type="text" value={form.mobileImageUrl} onChange={e => setForm(f => ({ ...f, mobileImageUrl: e.target.value }))} className="input-field" placeholder="Optional — for small screens" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Title</label>
              <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-field" placeholder="Summer Collection" />
            </div>
            <div>
              <label className="input-label">Subtitle</label>
              <input type="text" value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} className="input-field" placeholder="Handwoven with love" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="input-label">Link URL</label>
              <input type="text" value={form.linkUrl} onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))} className="input-field" placeholder="/sarees?fabric=SILK" />
            </div>
            <div>
              <label className="input-label">Button Text</label>
              <input type="text" value={form.linkText} onChange={e => setForm(f => ({ ...f, linkText: e.target.value }))} className="input-field" placeholder="Shop Now" />
            </div>
            <div>
              <label className="input-label">Position</label>
              <input type="number" value={form.position} onChange={e => setForm(f => ({ ...f, position: parseInt(e.target.value || '0') }))} className="input-field" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <label className="input-label">Text Color</label>
              <input type="color" value={form.textColor} onChange={e => setForm(f => ({ ...f, textColor: e.target.value }))} className="w-10 h-10 rounded border cursor-pointer" />
            </div>
            <label className="flex items-center gap-2 font-ui text-sm text-bark cursor-pointer mt-4">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 accent-maroon" />
              Active
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-cream-deep/40">
            <button onClick={() => setMode('list')} className="btn-outline rounded-lg">Cancel</button>
            <button onClick={save} disabled={saving || !form.imageUrl} className="btn-primary rounded-lg">
              {saving ? 'Saving...' : editing ? 'Update Banner' : 'Create Banner'}
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
          <h1 className="font-display text-2xl font-bold text-bark">Banners</h1>
          <p className="font-ui text-sm text-bark-light/60 mt-0.5">{banners.length} banner{banners.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openAdd} className="btn-primary rounded-lg">+ Add Banner</button>
      </div>

      {banners.length === 0 ? (
        <div className="bg-white border border-cream-deep/60 p-12 text-center">
          <p className="font-body text-bark-light mb-4">No banners yet. Add your first banner to display on the storefront.</p>
          <button onClick={openAdd} className="btn-primary rounded-lg">Add Banner</button>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map(b => (
            <div key={b.id} className={`bg-white border border-cream-deep/60 overflow-hidden flex ${!b.isActive ? 'opacity-60' : ''}`}>
              <div className="w-48 h-28 shrink-0 bg-bark">
                <img src={b.imageUrl} alt={b.title || 'Banner'} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-ui text-sm font-medium text-bark">{b.title || '(No title)'}</p>
                  <p className="font-ui text-xs text-bark-light/60 mt-0.5">{b.subtitle || ''}</p>
                  <p className="font-ui text-xs text-bark-light/40 mt-1">Position: {b.position} &middot; {b.linkUrl || 'No link'}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggle(b.id)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${b.isActive ? 'bg-sage' : 'bg-bark-light/30'}`}>
                    <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${b.isActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>
                  <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg text-bark-light hover:text-maroon hover:bg-maroon/5 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => remove(b.id)} className="p-1.5 rounded-lg text-bark-light hover:text-red-500 hover:bg-red-500/5 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
