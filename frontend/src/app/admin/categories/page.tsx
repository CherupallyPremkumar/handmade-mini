'use client';

import { useState, useEffect } from 'react';
import { authFetch } from '@/lib/auth-store';

const API = process.env.NEXT_PUBLIC_API_URL || '';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  filterKey: string;
  filterValue: string;
  position: number;
  showOnHome: boolean;
  isActive: boolean;
}

const EMPTY: Omit<Category, 'id'> = {
  name: '', slug: '', description: '', imageUrl: '',
  filterKey: 'fabric', filterValue: '', position: 0, showOnHome: false, isActive: true,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [mode, setMode] = useState<'list' | 'form'>('list');
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await authFetch(`${API}/api/admin/categories`);
    if (res.ok) setCategories(await res.json());
  }

  function openAdd() { setForm(EMPTY); setEditing(null); setMode('form'); }

  function openEdit(c: Category) { setForm(c); setEditing(c); setMode('form'); }

  function autoSlug(name: string) {
    return name.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  async function save() {
    if (!form.name) return;
    if (!form.slug) form.slug = autoSlug(form.name);
    setSaving(true);
    try {
      const url = editing ? `${API}/api/admin/categories/${editing.id}` : `${API}/api/admin/categories`;
      const method = editing ? 'PUT' : 'POST';
      await authFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      setMode('list');
      await load();
    } finally { setSaving(false); }
  }

  async function toggle(id: string) {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
    await authFetch(`${API}/api/admin/categories/${id}/toggle`, { method: 'PATCH' });
  }

  async function remove(id: string) {
    if (!confirm('Delete this category?')) return;
    setCategories(prev => prev.filter(c => c.id !== id));
    await authFetch(`${API}/api/admin/categories/${id}`, { method: 'DELETE' });
  }

  if (mode === 'form') {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold text-bark">{editing ? 'Edit Category' : 'Add Category'}</h1>
          <button onClick={() => setMode('list')} className="btn-outline rounded-lg">Cancel</button>
        </div>
        <div className="bg-white border border-cream-deep/60 p-6 space-y-4">
          {form.imageUrl && (
            <div className="rounded-lg overflow-hidden h-40 w-40 bg-cream-warm">
              <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Name *</label>
              <input type="text" value={form.name} onChange={e => {
                const name = e.target.value;
                setForm(f => ({ ...f, name, slug: editing ? f.slug : autoSlug(name) }));
              }} className="input-field" placeholder="Pure Silk Sarees" />
            </div>
            <div>
              <label className="input-label">Slug</label>
              <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="input-field font-mono" placeholder="pure-silk-sarees" />
            </div>
          </div>
          <div>
            <label className="input-label">Description</label>
            <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-field" placeholder="Handwoven pure silk sarees from Pochampally" />
          </div>
          <div>
            <label className="input-label">Image URL</label>
            <input type="text" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} className="input-field" placeholder="https://..." />
            <p className="font-ui text-[10px] text-bark-light/50 mt-1">Paste any image URL. Recommended: square or 4:3 ratio.</p>
          </div>

          <div className="border-t border-cream-deep pt-4">
            <p className="font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60 mb-3">Product Filter</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Filter Key</label>
                <select value={form.filterKey} onChange={e => setForm(f => ({ ...f, filterKey: e.target.value }))} className="input-field">
                  <option value="fabric">Fabric</option>
                  <option value="weaveType">Weave Type</option>
                  <option value="occasion">Occasion</option>
                  <option value="workType">Work Type</option>
                  <option value="">None (custom page)</option>
                </select>
              </div>
              <div>
                <label className="input-label">Filter Value</label>
                <input type="text" value={form.filterValue} onChange={e => setForm(f => ({ ...f, filterValue: e.target.value }))} className="input-field" placeholder="SILK, IKAT, Wedding..." />
              </div>
            </div>
            <p className="font-ui text-[10px] text-bark-light/50 mt-1">Links category to products. E.g., fabric=SILK shows all silk sarees.</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="input-label">Position</label>
              <input type="number" value={form.position} onChange={e => setForm(f => ({ ...f, position: parseInt(e.target.value || '0') }))} className="input-field" />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 font-ui text-sm text-bark cursor-pointer">
                <input type="checkbox" checked={form.showOnHome} onChange={e => setForm(f => ({ ...f, showOnHome: e.target.checked }))} className="w-4 h-4 accent-maroon" />
                Show on Homepage
              </label>
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 font-ui text-sm text-bark cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 accent-maroon" />
                Active
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-cream-deep/40">
            <button onClick={() => setMode('list')} className="btn-outline rounded-lg">Cancel</button>
            <button onClick={save} disabled={saving || !form.name} className="btn-primary rounded-lg">
              {saving ? 'Saving...' : editing ? 'Update Category' : 'Create Category'}
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
          <h1 className="font-display text-2xl font-bold text-bark">Categories</h1>
          <p className="font-ui text-sm text-bark-light/60 mt-0.5">{categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}</p>
        </div>
        <button onClick={openAdd} className="btn-primary rounded-lg">+ Add Category</button>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white border border-cream-deep/60 p-12 text-center">
          <p className="font-body text-bark-light mb-4">No categories yet. Create categories to organize your sarees.</p>
          <button onClick={openAdd} className="btn-primary rounded-lg">Add Category</button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-cream-deep/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cream-deep/40 bg-cream-warm/30">
                  <th className="text-left px-4 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">Category</th>
                  <th className="text-left px-4 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">Filter</th>
                  <th className="text-center px-4 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">Home</th>
                  <th className="text-center px-4 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">Pos</th>
                  <th className="text-center px-4 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">Status</th>
                  <th className="text-right px-4 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c.id} className={`border-b border-cream-deep/20 last:border-0 hover:bg-cream-warm/50 ${!c.isActive ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cream-warm rounded-lg border border-cream-deep/40 overflow-hidden shrink-0">
                          {c.imageUrl ? <img src={c.imageUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-bark-light/20 text-xs">No img</div>}
                        </div>
                        <div>
                          <p className="font-ui text-sm font-medium text-bark">{c.name}</p>
                          <p className="font-ui text-xs text-bark-light/50 font-mono">/{c.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {c.filterKey ? (
                        <span className="font-ui text-xs px-2 py-0.5 bg-cream-deep rounded-full text-bark-light">{c.filterKey}={c.filterValue}</span>
                      ) : <span className="font-ui text-xs text-bark-light/40">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.showOnHome ? <span className="text-sage text-xs">Yes</span> : <span className="text-bark-light/40 text-xs">No</span>}
                    </td>
                    <td className="px-4 py-3 text-center font-ui text-sm text-bark-light">{c.position}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggle(c.id)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${c.isActive ? 'bg-sage' : 'bg-bark-light/30'}`}>
                        <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${c.isActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
