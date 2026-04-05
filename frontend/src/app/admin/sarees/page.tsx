'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { formatINR, formatFabric, formatWeave } from '@/lib/format';
import { api } from '@/lib/api';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8090';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  fabric: string;
  weaveType: string;
  color: string;
  lengthMeters: number;
  blousePiece: boolean;
  mrp: number;
  sellingPrice: number;
  discountPct: number;
  stock: number;
  images: string[];
  videoUrl: string | null;
  hsnCode: string;
  gstPct: number;
  isActive: boolean;
  createdTime: string;
}

interface ProductForm {
  name: string;
  description: string;
  category: string;
  fabric: string;
  weaveType: string;
  color: string;
  lengthMeters: number;
  blousePiece: boolean;
  mrp: number;
  sellingPrice: number;
  stock: number;
  gstPct: number;
  hsnCode: string;
}

const EMPTY_FORM: ProductForm = {
  name: '',
  description: '',
  category: 'SAREE',
  fabric: 'SILK',
  weaveType: 'IKAT',
  color: '',
  lengthMeters: 6.3,
  blousePiece: true,
  mrp: 0,
  sellingPrice: 0,
  stock: 0,
  gstPct: 5,
  hsnCode: '50079090',
};

export default function AdminProductsPage() {
  const { getAuthHeaders } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<'closed' | 'add' | 'edit'>('closed');
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [priceDisplay, setPriceDisplay] = useState('');
  const [mrpDisplay, setMrpDisplay] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Video upload
  const [videoProductId, setVideoProductId] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoError, setVideoError] = useState('');
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/products`);
      if (res.ok) setProducts(await res.json());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setForm(EMPTY_FORM);
    setPriceDisplay('');
    setMrpDisplay('');
    setEditId(null);
    setSaveError('');
    setModalMode('add');
  }

  function openEdit(p: Product) {
    setForm({
      name: p.name,
      description: p.description || '',
      category: p.category,
      fabric: p.fabric,
      weaveType: p.weaveType,
      color: p.color,
      lengthMeters: p.lengthMeters,
      blousePiece: p.blousePiece,
      mrp: p.mrp,
      sellingPrice: p.sellingPrice,
      stock: p.stock,
      gstPct: p.gstPct,
      hsnCode: p.hsnCode,
    });
    setPriceDisplay(String(p.sellingPrice / 100));
    setMrpDisplay(String(p.mrp / 100));
    setEditId(p.id);
    setSaveError('');
    setModalMode('edit');
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setSaveError('Product name is required');
      return;
    }
    if (form.sellingPrice <= 0) {
      setSaveError('Selling price is required');
      return;
    }

    setSaving(true);
    setSaveError('');

    const body = {
      ...form,
      isActive: true,
    };

    try {
      const url = modalMode === 'add'
        ? `${API}/api/admin/products`
        : `${API}/api/admin/products/${editId}`;
      const method = modalMode === 'add' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setModalMode('closed');
        fetchProducts();
      } else {
        const err = await res.json().catch(() => null);
        setSaveError(err?.error || 'Failed to save product');
      }
    } catch {
      setSaveError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await fetch(`${API}/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      fetchProducts();
    } catch {
      // silent
    }
  }

  async function handleVideoUpload() {
    if (!videoFile || !videoProductId) return;
    setVideoUploading(true);
    setVideoError('');

    try {
      const result = await api.videos.upload(videoProductId, videoFile);
      if (result.success) {
        setVideoProductId(null);
        setVideoFile(null);
        fetchProducts();
      } else {
        setVideoError(result.errors?.[0]?.description || 'Upload failed');
      }
    } catch {
      setVideoError('Upload failed. Please try again.');
    } finally {
      setVideoUploading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-bark">Products</h1>
        <button onClick={openAdd} className="btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Product
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-cream-deep/50 h-16 rounded" />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-cream-deep/60 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cream-deep/40">
                <th className="text-left px-4 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">Product</th>
                <th className="text-left px-4 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">Fabric / Weave</th>
                <th className="text-right px-4 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">Price</th>
                <th className="text-center px-4 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">Stock</th>
                <th className="text-center px-4 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">Media</th>
                <th className="text-right px-4 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-cream-deep/20 last:border-0 hover:bg-cream-warm/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-12 bg-cream-warm border border-cream-deep/40 overflow-hidden shrink-0">
                        {p.images?.length > 0 ? (
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-5 h-5 rounded-full opacity-25" style={{ background: 'conic-gradient(from 0deg, var(--maroon), var(--gold), var(--maroon))' }} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-ui text-sm font-medium text-bark">{p.name}</p>
                        <p className="font-ui text-xs text-bark-light/60">
                          {p.color} &middot; {p.lengthMeters}m &middot; GST {p.gstPct}%
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-ui text-sm text-bark">{formatFabric(p.fabric)}</p>
                    <p className="font-ui text-xs text-bark-light/60">{formatWeave(p.weaveType)}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className="font-ui text-sm font-semibold text-maroon">{formatINR(p.sellingPrice)}</p>
                    {p.mrp > p.sellingPrice && (
                      <p className="font-ui text-xs text-bark-light/50 line-through">{formatINR(p.mrp)}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-ui text-sm font-medium ${p.stock <= 3 ? 'text-terracotta' : p.stock <= 10 ? 'text-gold' : 'text-sage'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="font-ui text-xs text-bark-light">
                        {p.images?.length || 0} img
                      </span>
                      <span className={`font-ui text-xs ${p.videoUrl ? 'text-sage' : 'text-bark-light/40'}`}>
                        {p.videoUrl ? '1 vid' : 'no vid'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setVideoProductId(p.id); setVideoFile(null); setVideoError(''); }} className="p-1.5 text-bark-light hover:text-gold transition-colors" title="Upload Video">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button onClick={() => openEdit(p)} className="p-1.5 text-bark-light hover:text-maroon transition-colors" title="Edit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-bark-light hover:text-red-500 transition-colors" title="Delete">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="text-center py-20 bg-white border border-cream-deep/60">
          <p className="font-body text-bark-light">No products yet.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalMode !== 'closed' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-bark/50" onClick={() => setModalMode('closed')} />
          <div className="relative bg-cream w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-bark">
                {modalMode === 'add' ? 'Add Product' : 'Edit Product'}
              </h2>
              <button onClick={() => setModalMode('closed')} className="p-1 text-bark-light hover:text-bark">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="input-label">Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-field" placeholder="e.g., Royal Magenta Ikat Silk" />
              </div>

              <div>
                <label className="input-label">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="input-field resize-y" placeholder="Describe the product..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Selling Price (₹)</label>
                  <input type="number" value={priceDisplay} onChange={(e) => { setPriceDisplay(e.target.value); setForm((f) => ({ ...f, sellingPrice: Math.round(parseFloat(e.target.value || '0') * 100) })); }} className="input-field" placeholder="8500" />
                </div>
                <div>
                  <label className="input-label">MRP (₹)</label>
                  <input type="number" value={mrpDisplay} onChange={(e) => { setMrpDisplay(e.target.value); setForm((f) => ({ ...f, mrp: Math.round(parseFloat(e.target.value || '0') * 100) })); }} className="input-field" placeholder="12000" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Fabric</label>
                  <select value={form.fabric} onChange={(e) => setForm((f) => ({ ...f, fabric: e.target.value }))} className="input-field">
                    <option value="SILK">Pure Silk</option>
                    <option value="COTTON">Handloom Cotton</option>
                    <option value="SILK_COTTON">Silk Cotton Blend</option>
                    <option value="LINEN">Linen</option>
                    <option value="GEORGETTE">Georgette</option>
                    <option value="CHIFFON">Chiffon</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Weave Type</label>
                  <select value={form.weaveType} onChange={(e) => setForm((f) => ({ ...f, weaveType: e.target.value }))} className="input-field">
                    <option value="IKAT">Ikat</option>
                    <option value="TELIA_RUMAL">Telia Rumal</option>
                    <option value="MERCERIZED">Mercerized</option>
                    <option value="HANDLOOM">Handloom</option>
                    <option value="POWERLOOM">Powerloom</option>
                    <option value="JACQUARD">Jacquard</option>
                    <option value="PLAIN">Plain</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="input-label">Color</label>
                  <input type="text" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} className="input-field" placeholder="Magenta" />
                </div>
                <div>
                  <label className="input-label">Length (m)</label>
                  <input type="number" step="0.1" value={form.lengthMeters} onChange={(e) => setForm((f) => ({ ...f, lengthMeters: parseFloat(e.target.value || '0') }))} className="input-field" />
                </div>
                <div>
                  <label className="input-label">Stock</label>
                  <input type="number" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: parseInt(e.target.value || '0', 10) }))} className="input-field" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">GST %</label>
                  <select value={form.gstPct} onChange={(e) => setForm((f) => ({ ...f, gstPct: parseInt(e.target.value, 10) }))} className="input-field">
                    <option value={0}>0% (Exempt)</option>
                    <option value={5}>5% (Handloom / below ₹1000)</option>
                    <option value={12}>12% (Above ₹1000)</option>
                    <option value={18}>18%</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">HSN Code</label>
                  <input type="text" value={form.hsnCode} onChange={(e) => setForm((f) => ({ ...f, hsnCode: e.target.value }))} className="input-field font-mono" placeholder="50079090" />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" id="blouse" checked={form.blousePiece} onChange={(e) => setForm((f) => ({ ...f, blousePiece: e.target.checked }))} className="w-4 h-4 accent-maroon" />
                <label htmlFor="blouse" className="font-ui text-sm text-bark">Blouse piece included</label>
              </div>
            </div>

            {saveError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200">
                <p className="text-sm text-red-700">{saveError}</p>
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button onClick={() => setModalMode('closed')} className="btn-outline">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : modalMode === 'add' ? 'Add Product' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Upload Modal */}
      {videoProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-bark/50" onClick={() => !videoUploading && setVideoProductId(null)} />
          <div className="relative bg-cream w-full max-w-lg p-6 sm:p-8 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-xl font-bold text-bark">Upload Video</h2>
                <p className="font-ui text-xs text-bark-light/60 mt-1">
                  For: {products.find((p) => p.id === videoProductId)?.name}
                </p>
              </div>
              <button onClick={() => !videoUploading && setVideoProductId(null)} className="p-1 text-bark-light hover:text-bark">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div onClick={() => videoInputRef.current?.click()} className={`border-2 border-dashed transition-colors cursor-pointer p-6 text-center ${videoError ? 'border-red-300 bg-red-50/30' : 'border-cream-deep hover:border-gold'}`}>
              <input ref={videoInputRef} type="file" accept="video/mp4,video/webm" onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.type !== 'video/mp4' && file.type !== 'video/webm') { setVideoError('Only .mp4 and .webm allowed'); return; }
                if (file.size > 50 * 1024 * 1024) { setVideoError('Max 50MB'); return; }
                setVideoError('');
                setVideoFile(file);
              }} className="hidden" />
              {videoFile ? (
                <p className="font-ui text-sm text-bark">{videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(1)} MB)</p>
              ) : (
                <p className="font-ui text-sm text-bark-light/60">Click to select video (.mp4 or .webm, max 50MB)</p>
              )}
            </div>

            {videoError && <p className="mt-2 font-ui text-xs text-red-600">{videoError}</p>}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button onClick={() => !videoUploading && setVideoProductId(null)} className="btn-outline" disabled={videoUploading}>Cancel</button>
              <button onClick={handleVideoUpload} className="btn-primary" disabled={!videoFile || videoUploading}>
                {videoUploading ? 'Uploading...' : 'Upload Video'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
