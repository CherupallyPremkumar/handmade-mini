'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { formatINR, formatFabric, formatWeave } from '@/lib/format';

const API = process.env.NEXT_PUBLIC_API_URL || '';

interface Product {
  id: string;
  name: string;
  description: string;
  secondaryDescription: string;
  category: string;
  fabric: string;
  weaveType: string;
  color: string;
  lengthMeters: number;
  blousePiece: boolean;
  mrp: number;
  sellingPrice: number;
  stock: number;
  images: string[];
  videoUrl: string | null;
  hsnCode: string;
  gstPct: number;
  isActive: boolean;
  weightGrams: number | null;
  widthInches: number | null;
  blouseLengthMeters: number | null;
  occasion: string;
  workType: string;
  pattern: string;
  bodyColor: string;
  borderColor: string;
  palluColor: string;
  careInstructions: string;
  certification: string;
  sku: string;
  tags: string;
}

interface ProductForm {
  name: string;
  description: string;
  secondaryDescription: string;
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
  weightGrams: number;
  widthInches: number;
  blouseLengthMeters: number;
  occasion: string;
  workType: string;
  pattern: string;
  bodyColor: string;
  borderColor: string;
  palluColor: string;
  careInstructions: string;
  certification: string;
  sku: string;
  tags: string;
}

interface ProductRules {
  minImages: number;
  minVideos: number;
  requireDescription: boolean;
  requireSecondaryDescription: boolean;
}

const EMPTY_FORM: ProductForm = {
  name: '', description: '', secondaryDescription: '', category: 'SAREE', fabric: 'SILK', weaveType: 'IKAT',
  color: '', lengthMeters: 6.3, blousePiece: true, mrp: 0, sellingPrice: 0,
  stock: 0, gstPct: 5, hsnCode: '50079090',
  weightGrams: 0, widthInches: 44, blouseLengthMeters: 0.8,
  occasion: '', workType: '', pattern: '',
  bodyColor: '', borderColor: '', palluColor: '',
  careInstructions: 'Dry clean recommended', certification: '', sku: '', tags: '',
};

export default function AdminProductsPage() {
  const { getAuthHeaders } = useAuthStore();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<'closed' | 'add' | 'edit'>('closed');
  const [editId, setEditId] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [priceDisplay, setPriceDisplay] = useState('');
  const [mrpDisplay, setMrpDisplay] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Image upload
  const [imageUploading, setImageUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Video upload
  const [videoProductId, setVideoProductId] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoError, setVideoError] = useState('');
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [rules, setRules] = useState<ProductRules>({ minImages: 3, minVideos: 1, requireDescription: true, requireSecondaryDescription: true });

  useEffect(() => {
    fetchProducts();
    fetch(`${API}/api/admin/settings/product-rules`, { credentials: 'include' as RequestCredentials })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setRules(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (searchParams.get('action') === 'add' && modalMode === 'closed' && !loading) {
      openAdd();
    }
  }, [searchParams, loading]);

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/products`, { credentials: 'include' as RequestCredentials });
      if (res.ok) setProducts(await res.json());
    } catch {} finally { setLoading(false); }
  }

  function openAdd() {
    setForm(EMPTY_FORM); setPriceDisplay(''); setMrpDisplay('');
    setEditId(null); setEditProduct(null); setSaveError(''); setModalMode('add');
  }

  function openEdit(p: Product) {
    setForm({
      name: p.name, description: p.description || '', secondaryDescription: p.secondaryDescription || '',
      category: p.category, fabric: p.fabric, weaveType: p.weaveType, color: p.color,
      lengthMeters: p.lengthMeters, blousePiece: p.blousePiece,
      mrp: p.mrp, sellingPrice: p.sellingPrice, stock: p.stock,
      gstPct: p.gstPct, hsnCode: p.hsnCode,
      weightGrams: p.weightGrams || 0, widthInches: p.widthInches || 44,
      blouseLengthMeters: p.blouseLengthMeters || 0.8,
      occasion: p.occasion || '', workType: p.workType || '', pattern: p.pattern || '',
      bodyColor: p.bodyColor || '', borderColor: p.borderColor || '', palluColor: p.palluColor || '',
      careInstructions: p.careInstructions || '', certification: p.certification || '',
      sku: p.sku || '', tags: p.tags || '',
    });
    setPriceDisplay(String(p.sellingPrice / 100));
    setMrpDisplay(String(p.mrp / 100));
    setEditId(p.id); setEditProduct(p); setSaveError(''); setModalMode('edit');
  }

  async function handleSave() {
    if (!form.name.trim()) { setSaveError('Product name is required'); return; }
    if (form.sellingPrice <= 0) { setSaveError('Selling price is required'); return; }
    if (rules.requireDescription && !form.description.trim()) { setSaveError('Product description is required'); return; }
    if (rules.requireSecondaryDescription && !form.secondaryDescription.trim()) { setSaveError('Secondary description is required (helps customers decide)'); return; }

    // Media validation for edit mode
    if (modalMode === 'edit' && editProduct) {
      const imgCount = editProduct.images?.length || 0;
      if (imgCount < rules.minImages) { setSaveError(`Minimum ${rules.minImages} images required (you have ${imgCount}). Upload images first.`); return; }
      if (rules.minVideos > 0 && !editProduct.videoUrl) { setSaveError(`${rules.minVideos} video required. Upload video first.`); return; }
    }

    setSaving(true); setSaveError('');
    try {
      const url = modalMode === 'add' ? `${API}/api/admin/products` : `${API}/api/admin/products/${editId}`;
      const method = modalMode === 'add' ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method, credentials: 'include' as RequestCredentials,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, isActive: true }),
      });
      if (res.ok) { setModalMode('closed'); fetchProducts(); }
      else { const err = await res.json().catch(() => null); setSaveError(err?.error || 'Failed to save'); }
    } catch { setSaveError('Network error'); } finally { setSaving(false); }
  }

  async function handleToggleActive(id: string) {
    // Optimistic update — toggle immediately in UI
    setProducts(prev => prev.map(p =>
      p.id === id ? { ...p, isActive: !p.isActive } : p
    ));
    try {
      const res = await fetch(`${API}/api/admin/products/${id}/toggle-active`, {
        method: 'PATCH', credentials: 'include' as RequestCredentials,
      });
      if (!res.ok) {
        // Revert on failure
        setProducts(prev => prev.map(p =>
          p.id === id ? { ...p, isActive: !p.isActive } : p
        ));
      }
    } catch {
      // Revert on network error
      setProducts(prev => prev.map(p =>
        p.id === id ? { ...p, isActive: !p.isActive } : p
      ));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this product?')) return;
    const backup = products;
    setProducts(prev => prev.filter(p => p.id !== id));
    try {
      const res = await fetch(`${API}/api/admin/products/${id}`, { method: "DELETE", credentials: "include" as RequestCredentials });
      if (!res.ok) setProducts(backup);
    } catch {
      setProducts(backup);
    }
  }

  async function handleImageUpload(files: FileList) {
    if (!editId) return;
    setImageUploading(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 5 * 1024 * 1024) { setSaveError('Each image must be under 5MB'); continue; }

      try {
        // 1. Get presigned URL from backend
        const presignRes = await fetch(`${API}/api/admin/media/presign-image`, {
          method: 'POST', credentials: 'include' as RequestCredentials,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: editId, contentType: file.type, filename: file.name }),
        });
        if (!presignRes.ok) continue;
        const { uploadUrl, cdnUrl } = await presignRes.json();

        // 2. Upload directly to R2 (browser → R2, bypasses backend)
        await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });

        // 3. Confirm upload to backend
        await fetch(`${API}/api/admin/media/confirm-image`, {
          method: 'POST', credentials: 'include' as RequestCredentials,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: editId, cdnUrl }),
        });

        setEditProduct((prev) => prev ? { ...prev, images: [...(prev.images || []), cdnUrl] } : prev);
      } catch { setSaveError('Image upload failed'); }
    }
    setImageUploading(false);
    fetchProducts();
  }

  async function handleImageDelete(imageUrl: string) {
    if (!editId) return;
    await fetch(`${API}/api/admin/media/image?productId=${editId}&imageUrl=${encodeURIComponent(imageUrl)}`, {
      method: 'DELETE', credentials: 'include' as RequestCredentials,
    });
    setEditProduct((prev) => prev ? { ...prev, images: prev.images.filter((u) => u !== imageUrl) } : prev);
    fetchProducts();
  }

  async function handleVideoUpload() {
    if (!videoFile || !videoProductId) return;
    setVideoUploading(true); setVideoError('');
    try {
      // 1. Get presigned URL
      const presignRes = await fetch(`${API}/api/admin/media/presign-video`, {
        method: 'POST', credentials: 'include' as RequestCredentials,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: videoProductId, contentType: videoFile.type, filename: videoFile.name }),
      });
      if (!presignRes.ok) { setVideoError('Failed to prepare upload'); return; }
      const { uploadUrl, cdnUrl } = await presignRes.json();

      // 2. Upload directly to R2
      await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': videoFile.type }, body: videoFile });

      // 3. Confirm
      await fetch(`${API}/api/admin/media/confirm-video`, {
        method: 'POST', credentials: 'include' as RequestCredentials,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: videoProductId, cdnUrl }),
      });

      setVideoProductId(null); setVideoFile(null); fetchProducts();
    } catch { setVideoError('Upload failed'); } finally { setVideoUploading(false); }
  }

  const currentImages = editProduct?.images || [];
  const currentVideo = editProduct?.videoUrl;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-bark">Products</h1>
          <p className="font-ui text-sm text-bark-light/60 mt-0.5">{products.length} product{products.length !== 1 ? 's' : ''} in catalog</p>
        </div>
        <button onClick={openAdd} className="btn-primary rounded-lg">+ Add Product</button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="animate-pulse bg-cream-deep/50 h-16 rounded-xl" />)}</div>
      ) : (
        <div className="bg-white rounded-xl border border-cream-deep/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cream-deep/40 bg-cream-warm/30">
                  <th className="text-left px-4 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">Product</th>
                  <th className="text-left px-4 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">Type</th>
                  <th className="text-right px-4 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">Price</th>
                  <th className="text-center px-4 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">Stock</th>
                  <th className="text-center px-4 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">Media</th>
                  <th className="text-center px-4 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">Status</th>
                  <th className="text-right px-4 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const imgCount = p.images?.length || 0;
                  const hasVideo = !!p.videoUrl;
                  const mediaOk = imgCount >= rules.minImages && (rules.minVideos === 0 || hasVideo);
                  return (
                    <tr key={p.id} className={`border-b border-cream-deep/20 last:border-0 hover:bg-cream-warm/50 ${!p.isActive ? 'opacity-60' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-12 bg-cream-warm rounded-lg border border-cream-deep/40 overflow-hidden shrink-0">
                            {imgCount > 0 ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-bark-light/20 text-xs">No img</div>}
                          </div>
                          <div>
                            <p className="font-ui text-sm font-medium text-bark">{p.name}</p>
                            <p className="font-ui text-xs text-bark-light/60">{p.color} &middot; {p.lengthMeters}m</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-ui text-sm text-bark">{formatFabric(p.fabric)}</p>
                        <p className="font-ui text-xs text-bark-light/60">{formatWeave(p.weaveType)}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="font-ui text-sm font-semibold text-maroon">{formatINR(p.sellingPrice)}</p>
                        {p.mrp > p.sellingPrice && <p className="font-ui text-xs text-bark-light/50 line-through">{formatINR(p.mrp)}</p>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${p.stock <= 3 ? 'bg-red-50 text-terracotta' : 'bg-sage/10 text-sage'}`}>{p.stock}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${mediaOk ? 'bg-sage/10 text-sage' : 'bg-red-50 text-terracotta'}`}>
                          {imgCount}/{rules.minImages} img &middot; {hasVideo ? '1 vid' : '0 vid'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleActive(p.id)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${p.isActive ? 'bg-sage' : 'bg-bark-light/30'}`}
                          title={p.isActive ? 'Active — click to deactivate' : 'Inactive — click to activate'}
                        >
                          <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${p.isActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-bark-light hover:text-maroon hover:bg-maroon/5 transition-colors" title="Edit">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg text-bark-light hover:text-red-500 hover:bg-red-500/5 transition-colors" title="Delete">
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

      {/* ═══ Add/Edit Modal ═══ */}
      {modalMode !== 'closed' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-bark/50" onClick={() => setModalMode('closed')} />
          <div className="relative bg-cream rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-bark">{modalMode === 'add' ? 'Add Product' : 'Edit Product'}</h2>
              <button onClick={() => setModalMode('closed')} className="p-1 rounded-full text-bark-light hover:text-bark hover:bg-cream-deep/30 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-5">
              {/* Name + Description */}
              <div>
                <label className="input-label">Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-field" placeholder="e.g., Royal Magenta Ikat Silk Saree" />
              </div>
              <div>
                <label className="input-label">Description {rules.requireDescription && '*'}</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="input-field resize-y" placeholder="Body color, pallu, blouse, fabric details..." />
              </div>
              <div>
                <label className="input-label">Secondary Description {rules.requireSecondaryDescription && '*'}</label>
                <textarea value={form.secondaryDescription} onChange={(e) => setForm((f) => ({ ...f, secondaryDescription: e.target.value }))} rows={2} className="input-field resize-y" placeholder="Why buy this saree? What makes it special? Care instructions..." />
                <p className="font-ui text-[10px] text-bark-light/50 mt-1">Helps customers decide. E.g., styling tips, occasion, care instructions.</p>
              </div>

              {/* Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Selling Price (₹) *</label>
                  <input type="number" value={priceDisplay} onChange={(e) => { setPriceDisplay(e.target.value); setForm((f) => ({ ...f, sellingPrice: Math.round(parseFloat(e.target.value || '0') * 100) })); }} className="input-field" placeholder="9900" />
                </div>
                <div>
                  <label className="input-label">MRP (₹)</label>
                  <input type="number" value={mrpDisplay} onChange={(e) => { setMrpDisplay(e.target.value); setForm((f) => ({ ...f, mrp: Math.round(parseFloat(e.target.value || '0') * 100) })); }} className="input-field" placeholder="12000" />
                </div>
              </div>

              {/* Fabric + Weave */}
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
                  </select>
                </div>
              </div>

              {/* Color + Length + Stock */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="input-label">Color</label>
                  <input type="text" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} className="input-field" placeholder="Blue" />
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

              {/* GST + HSN + Blouse */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="input-label">GST %</label>
                  <select value={form.gstPct} onChange={(e) => setForm((f) => ({ ...f, gstPct: parseInt(e.target.value, 10) }))} className="input-field">
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={0}>0%</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">HSN Code</label>
                  <input type="text" value={form.hsnCode} onChange={(e) => setForm((f) => ({ ...f, hsnCode: e.target.value }))} className="input-field font-mono" />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 font-ui text-sm text-bark cursor-pointer">
                    <input type="checkbox" checked={form.blousePiece} onChange={(e) => setForm((f) => ({ ...f, blousePiece: e.target.checked }))} className="w-4 h-4 accent-maroon" />
                    Blouse included
                  </label>
                </div>
              </div>

              {/* ═══ Physical Details ═══ */}
              <div className="border-t border-cream-deep pt-5 mt-2">
                <p className="font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60 mb-4">Physical Details</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="input-label">Weight (grams)</label>
                    <input type="number" value={form.weightGrams || ''} onChange={(e) => setForm((f) => ({ ...f, weightGrams: parseInt(e.target.value || '0', 10) }))} className="input-field" placeholder="450" />
                  </div>
                  <div>
                    <label className="input-label">Width (inches)</label>
                    <input type="number" step="0.5" value={form.widthInches || ''} onChange={(e) => setForm((f) => ({ ...f, widthInches: parseFloat(e.target.value || '0') }))} className="input-field" placeholder="44" />
                  </div>
                  <div>
                    <label className="input-label">Blouse Length (m)</label>
                    <input type="number" step="0.1" value={form.blouseLengthMeters || ''} onChange={(e) => setForm((f) => ({ ...f, blouseLengthMeters: parseFloat(e.target.value || '0') }))} className="input-field" placeholder="0.8" />
                  </div>
                </div>
              </div>

              {/* ═══ Colors Breakdown ═══ */}
              <div className="border-t border-cream-deep pt-5">
                <p className="font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60 mb-4">Color Details</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="input-label">Body Color</label>
                    <input type="text" value={form.bodyColor} onChange={(e) => setForm((f) => ({ ...f, bodyColor: e.target.value }))} className="input-field" placeholder="Royal Blue" />
                  </div>
                  <div>
                    <label className="input-label">Border Color</label>
                    <input type="text" value={form.borderColor} onChange={(e) => setForm((f) => ({ ...f, borderColor: e.target.value }))} className="input-field" placeholder="Gold Zari" />
                  </div>
                  <div>
                    <label className="input-label">Pallu Color</label>
                    <input type="text" value={form.palluColor} onChange={(e) => setForm((f) => ({ ...f, palluColor: e.target.value }))} className="input-field" placeholder="Magenta" />
                  </div>
                </div>
              </div>

              {/* ═══ Classification ═══ */}
              <div className="border-t border-cream-deep pt-5">
                <p className="font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60 mb-4">Classification</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="input-label">Occasion</label>
                    <select value={form.occasion} onChange={(e) => setForm((f) => ({ ...f, occasion: e.target.value }))} className="input-field">
                      <option value="">Select</option>
                      <option value="Wedding">Wedding</option>
                      <option value="Festive">Festive</option>
                      <option value="Party">Party Wear</option>
                      <option value="Casual">Casual</option>
                      <option value="Daily">Daily Wear</option>
                      <option value="Bridal">Bridal</option>
                      <option value="Religious">Religious / Pooja</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Work Type</label>
                    <select value={form.workType} onChange={(e) => setForm((f) => ({ ...f, workType: e.target.value }))} className="input-field">
                      <option value="">Select</option>
                      <option value="Zari">Zari / Gold Thread</option>
                      <option value="Silver Zari">Silver Zari</option>
                      <option value="Butta">Butta / Motifs</option>
                      <option value="Temple Border">Temple Border</option>
                      <option value="Checks">Checks / Kattam</option>
                      <option value="Plain">Plain</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Pattern</label>
                    <select value={form.pattern} onChange={(e) => setForm((f) => ({ ...f, pattern: e.target.value }))} className="input-field">
                      <option value="">Select</option>
                      <option value="Geometric">Geometric</option>
                      <option value="Floral">Floral</option>
                      <option value="Paisley">Paisley / Mango</option>
                      <option value="Peacock">Peacock</option>
                      <option value="Stripes">Stripes</option>
                      <option value="Diamond">Diamond</option>
                      <option value="Abstract">Abstract</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ═══ Care & Certification ═══ */}
              <div className="border-t border-cream-deep pt-5">
                <p className="font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60 mb-4">Care & Certification</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Care Instructions</label>
                    <input type="text" value={form.careInstructions} onChange={(e) => setForm((f) => ({ ...f, careInstructions: e.target.value }))} className="input-field" placeholder="Dry clean recommended" />
                  </div>
                  <div>
                    <label className="input-label">Certification</label>
                    <input type="text" value={form.certification} onChange={(e) => setForm((f) => ({ ...f, certification: e.target.value }))} className="input-field" placeholder="Silk Mark Certified, GI Tagged" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="input-label">SKU</label>
                    <input type="text" value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} className="input-field font-mono" placeholder="DHN-SILK-001" />
                  </div>
                  <div>
                    <label className="input-label">Tags (comma-separated)</label>
                    <input type="text" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} className="input-field" placeholder="wedding, silk, ikat, pochampally" />
                  </div>
                </div>
              </div>

              {/* ═══ Images Section (edit mode only) ═══ */}
              {modalMode === 'edit' && editId && (
                <div className="border-t border-cream-deep pt-5">
                  <div className="flex items-center justify-between mb-3">
                    <label className="input-label !mb-0">
                      Images * <span className={`text-xs ${currentImages.length >= rules.minImages ? 'text-sage' : 'text-terracotta'}`}>({currentImages.length}/{rules.minImages} min, 6 max)</span>
                    </label>
                    <button
                      onClick={() => imageInputRef.current?.click()}
                      disabled={imageUploading || currentImages.length >= 6}
                      className="font-ui text-xs text-maroon hover:underline disabled:opacity-50"
                    >
                      {imageUploading ? 'Uploading...' : '+ Add Images'}
                    </button>
                  </div>

                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                    className="hidden"
                  />

                  {/* Image grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
                    {currentImages.map((url, i) => (
                      <div key={url} className="relative group aspect-[3/4] bg-cream-warm rounded-lg border border-cream-deep/40 overflow-hidden">
                        <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => handleImageDelete(url)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                        >
                          ×
                        </button>
                        {i === 0 && <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] text-center py-0.5">Main</span>}
                      </div>
                    ))}
                    {currentImages.length < 6 && (
                      <button
                        onClick={() => imageInputRef.current?.click()}
                        className="aspect-[3/4] border-2 border-dashed border-cream-deep hover:border-gold rounded-lg flex items-center justify-center transition-colors"
                      >
                        <span className="text-bark-light/40 text-2xl">+</span>
                      </button>
                    )}
                  </div>
                  <p className="font-ui text-[10px] text-bark-light/50">JPG, PNG, or WebP. Max 5MB each. Recommended: 800×1200px (3:4 ratio). First image is the main display.</p>

                  {/* Video */}
                  <div className="mt-4 flex items-center justify-between">
                    <label className="input-label !mb-0">
                      Video * <span className={`text-xs ${currentVideo ? 'text-sage' : 'text-terracotta'}`}>({currentVideo ? '1/1' : '0/1'})</span>
                    </label>
                    <button
                      onClick={() => { setVideoProductId(editId); setVideoFile(null); setVideoError(''); }}
                      className="font-ui text-xs text-maroon hover:underline"
                    >
                      {currentVideo ? 'Replace Video' : '+ Upload Video'}
                    </button>
                  </div>
                  {currentVideo && (
                    <div className="mt-2 flex items-center gap-3 p-2 bg-cream-warm rounded-lg">
                      <video src={currentVideo} className="w-16 h-20 object-cover rounded" muted />
                      <p className="font-ui text-xs text-bark-light truncate flex-1">{currentVideo}</p>
                    </div>
                  )}
                </div>
              )}

              {modalMode === 'add' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="font-ui text-xs text-amber-800">Save the product first, then edit to add images (min 3) and video (min 1).</p>
                </div>
              )}
            </div>

            {/* Requirements */}
            {modalMode === 'edit' && (
              <div className="mt-4 p-3 bg-cream-warm border border-cream-deep/40 rounded-lg">
                <p className="font-ui text-xs font-semibold text-bark mb-1">Requirements:</p>
                <div className="flex gap-4 font-ui text-xs">
                  <span className={currentImages.length >= rules.minImages ? 'text-sage' : 'text-terracotta'}>
                    {currentImages.length >= rules.minImages ? '✓' : '✗'} Min {rules.minImages} images
                  </span>
                  {rules.minVideos > 0 && (
                    <span className={currentVideo ? 'text-sage' : 'text-terracotta'}>
                      {currentVideo ? '✓' : '✗'} {rules.minVideos} video
                    </span>
                  )}
                </div>
              </div>
            )}

            {saveError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{saveError}</p>
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button onClick={() => setModalMode('closed')} className="btn-outline rounded-lg">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary rounded-lg">
                {saving ? 'Saving...' : modalMode === 'add' ? 'Create Product' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Video Upload Modal ═══ */}
      {videoProductId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-bark/50" onClick={() => !videoUploading && setVideoProductId(null)} />
          <div className="relative bg-cream rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h2 className="font-display text-lg font-bold text-bark mb-4">Upload Video</h2>
            <div onClick={() => videoInputRef.current?.click()} className="border-2 border-dashed border-cream-deep hover:border-gold rounded-xl cursor-pointer p-6 text-center">
              <input ref={videoInputRef} type="file" accept="video/mp4,video/webm" onChange={(e) => {
                const file = e.target.files?.[0]; if (!file) return;
                if (file.type !== 'video/mp4' && file.type !== 'video/webm') { setVideoError('Only .mp4/.webm'); return; }
                if (file.size > 50 * 1024 * 1024) { setVideoError('Max 50MB'); return; }
                setVideoError(''); setVideoFile(file);
              }} className="hidden" />
              {videoFile ? (
                <p className="font-ui text-sm text-bark">{videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(1)} MB)</p>
              ) : (
                <p className="font-ui text-sm text-bark-light/60">Click to select video (.mp4/.webm, max 50MB, vertical 9:16 recommended)</p>
              )}
            </div>
            {videoError && <p className="mt-2 font-ui text-xs text-red-600">{videoError}</p>}
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setVideoProductId(null)} className="btn-outline rounded-lg" disabled={videoUploading}>Cancel</button>
              <button onClick={handleVideoUpload} className="btn-primary rounded-lg" disabled={!videoFile || videoUploading}>
                {videoUploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
