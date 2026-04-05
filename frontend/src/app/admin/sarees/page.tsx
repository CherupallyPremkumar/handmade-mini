'use client';

import { useState, useRef } from 'react';
import { sampleSarees } from '@/lib/sample-data';
import { formatINR, formatFabric, formatWeave } from '@/lib/format';
import { api } from '@/lib/api';
import ImageUploader from '@/components/ImageUploader';
import type { Saree } from '@/lib/types';

type ModalMode = 'closed' | 'add' | 'edit';

interface SareeForm {
  name: string;
  description: string;
  priceInPaisa: number;
  mrpInPaisa: number;
  fabric: Saree['fabric'];
  weave: Saree['weave'];
  color: string;
  lengthInMeters: number;
  blousePieceIncluded: boolean;
  stock: number;
  active: boolean;
  gstPct: number;
  hsnCode: string;
}

const EMPTY_FORM: SareeForm = {
  name: '',
  description: '',
  priceInPaisa: 0,
  mrpInPaisa: 0,
  fabric: 'SILK',
  weave: 'IKAT',
  color: '',
  lengthInMeters: 6.3,
  blousePieceIncluded: true,
  stock: 0,
  active: true,
  gstPct: 5,
  hsnCode: '50079090',
};

export default function AdminSareesPage() {
  const [sarees, setSarees] = useState<Saree[]>(sampleSarees);
  const [modalMode, setModalMode] = useState<ModalMode>('closed');
  const [editId, setEditId] = useState<string | null>(null);
  const [editImages, setEditImages] = useState<string[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [priceDisplay, setPriceDisplay] = useState('');
  const [mrpDisplay, setMrpDisplay] = useState('');

  // Video upload state
  const [videoModalSareeId, setVideoModalSareeId] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoError, setVideoError] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  function openAdd() {
    setForm(EMPTY_FORM);
    setPriceDisplay('');
    setMrpDisplay('');
    setEditId(null);
    setEditImages([]);
    setModalMode('add');
  }

  function openEdit(saree: Saree) {
    setForm({
      name: saree.name,
      description: saree.description,
      priceInPaisa: saree.priceInPaisa,
      mrpInPaisa: saree.mrpInPaisa,
      fabric: saree.fabric,
      weave: saree.weave,
      color: saree.color,
      lengthInMeters: saree.lengthInMeters,
      blousePieceIncluded: saree.blousePieceIncluded,
      stock: saree.stock,
      active: saree.active,
      gstPct: 5,
      hsnCode: '50079090',
    });
    setPriceDisplay(String(saree.priceInPaisa / 100));
    setMrpDisplay(String(saree.mrpInPaisa / 100));
    setEditId(saree.id);
    setEditImages(saree.images || []);
    setModalMode('edit');
  }

  const [saveErrors, setSaveErrors] = useState<string[]>([]);

  function handleSave() {
    // Validation: minimum 3 images + 1 video required
    const errors: string[] = [];
    if (!form.name.trim()) errors.push('Product name is required');
    if (form.priceInPaisa <= 0) errors.push('Selling price is required');
    if (editImages.length < 3) errors.push(`Minimum 3 images required (you have ${editImages.length})`);

    // Check video — find if this saree has a video
    const existingSaree = sarees.find((s) => s.id === editId);
    const hasVideo = existingSaree?.videoUrl || false;
    if (modalMode === 'edit' && !hasVideo) {
      errors.push('Video is required — upload a Nool video for this product');
    }
    if (modalMode === 'add') {
      errors.push('Save first, then add 3 images + 1 video via edit');
    }

    if (errors.length > 0 && modalMode === 'edit') {
      setSaveErrors(errors);
      return;
    }

    setSaveErrors([]);

    if (modalMode === 'add') {
      const newSaree: Saree = {
        id: `saree-${Date.now()}`,
        ...form,
        images: editImages,
        createdAt: new Date().toISOString(),
      };
      setSarees((prev) => [newSaree, ...prev]);
    } else if (modalMode === 'edit' && editId) {
      setSarees((prev) =>
        prev.map((s) =>
          s.id === editId ? { ...s, ...form, images: editImages } : s
        )
      );
    }
    setModalMode('closed');
  }

  function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this saree?')) {
      setSarees((prev) => prev.filter((s) => s.id !== id));
    }
  }

  function toggleActive(id: string) {
    setSarees((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  }

  function openVideoUpload(sareeId: string) {
    setVideoModalSareeId(sareeId);
    setVideoFile(null);
    setVideoUploading(false);
    setVideoProgress(0);
    setVideoError(null);
  }

  function handleVideoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (file.type !== 'video/mp4' && file.type !== 'video/webm') {
      setVideoError('Only .mp4 and .webm video files are allowed');
      setVideoFile(null);
      return;
    }

    // Validate size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      setVideoError(`Video must be under 50MB (selected: ${(file.size / (1024 * 1024)).toFixed(1)}MB)`);
      setVideoFile(null);
      return;
    }

    setVideoError(null);
    setVideoFile(file);
  }

  async function handleVideoUpload() {
    if (!videoFile || !videoModalSareeId) return;

    setVideoUploading(true);
    setVideoProgress(0);
    setVideoError(null);

    // Simulate progress while waiting
    const progressInterval = setInterval(() => {
      setVideoProgress((prev) => (prev >= 85 ? 85 : prev + 8));
    }, 300);

    try {
      const result = await api.videos.upload(videoModalSareeId, videoFile);
      clearInterval(progressInterval);

      if (result.success) {
        setVideoProgress(100);
        // Close modal after brief delay
        setTimeout(() => {
          setVideoModalSareeId(null);
          setVideoFile(null);
          setVideoProgress(0);
        }, 600);
      } else {
        setVideoError(result.errors?.[0]?.description || 'Upload failed');
      }
    } catch {
      clearInterval(progressInterval);
      setVideoError('Upload failed. Please try again.');
    } finally {
      setVideoUploading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-bark">
          Manage Sarees
        </h1>
        <button onClick={openAdd} className="btn-primary">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add New Saree
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-cream-deep/60 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-cream-deep/40">
              <th className="text-left px-4 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">
                Saree
              </th>
              <th className="text-left px-4 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">
                Fabric / Weave
              </th>
              <th className="text-right px-4 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">
                Price
              </th>
              <th className="text-center px-4 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">
                Stock
              </th>
              <th className="text-center px-4 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">
                Active
              </th>
              <th className="text-right px-4 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sarees.map((saree) => (
              <tr
                key={saree.id}
                className="border-b border-cream-deep/20 last:border-0 hover:bg-cream-warm/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {/* Thumbnail */}
                    <div className="w-10 h-12 bg-cream-warm border border-cream-deep/40 overflow-hidden shrink-0">
                      {saree.images && saree.images.length > 0 ? (
                        <img
                          src={saree.images[0]}
                          alt={saree.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div
                            className="w-5 h-5 rounded-full opacity-25"
                            style={{
                              background: `conic-gradient(from 0deg, var(--maroon), var(--gold), var(--maroon))`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-ui text-sm font-medium text-bark">
                        {saree.name}
                      </p>
                      <p className="font-ui text-xs text-bark-light/60">
                        {saree.color} &middot; {saree.lengthInMeters}m
                        {saree.images && saree.images.length > 0 && (
                          <span className="ml-1 text-sage">
                            &middot; {saree.images.length} img
                            {saree.images.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-ui text-sm text-bark">
                    {formatFabric(saree.fabric)}
                  </p>
                  <p className="font-ui text-xs text-bark-light/60">
                    {formatWeave(saree.weave)}
                  </p>
                </td>
                <td className="px-4 py-3 text-right">
                  <p className="font-ui text-sm font-semibold text-maroon">
                    {formatINR(saree.priceInPaisa)}
                  </p>
                  {saree.mrpInPaisa > saree.priceInPaisa && (
                    <p className="font-ui text-xs text-bark-light/50 line-through">
                      {formatINR(saree.mrpInPaisa)}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`font-ui text-sm font-medium ${
                      saree.stock <= 3
                        ? 'text-terracotta'
                        : saree.stock <= 10
                          ? 'text-gold'
                          : 'text-sage'
                    }`}
                  >
                    {saree.stock}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggleActive(saree.id)}
                    className={`
                      w-10 h-6 rounded-full relative transition-colors
                      ${saree.active ? 'bg-sage' : 'bg-bark-light/20'}
                    `}
                  >
                    <span
                      className={`
                        absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all
                        ${saree.active ? 'left-5' : 'left-1'}
                      `}
                    />
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openVideoUpload(saree.id)}
                      className="p-1.5 text-bark-light hover:text-gold transition-colors"
                      title="Upload Nool Video"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => openEdit(saree)}
                      className="p-1.5 text-bark-light hover:text-maroon transition-colors"
                      title="Edit"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(saree.id)}
                      className="p-1.5 text-bark-light hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {modalMode !== 'closed' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-bark/50"
            onClick={() => setModalMode('closed')}
          />
          <div className="relative bg-cream w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-bark">
                {modalMode === 'add' ? 'Add New Saree' : 'Edit Saree'}
              </h2>
              <button
                onClick={() => setModalMode('closed')}
                className="p-1 text-bark-light hover:text-bark"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="input-label">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="input-field"
                  placeholder="e.g., Royal Magenta Ikat Silk"
                />
              </div>

              <div>
                <label className="input-label">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={3}
                  className="input-field resize-y"
                  placeholder="Describe the saree..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">
                    Price ({'\u20B9'})
                  </label>
                  <input
                    type="number"
                    value={priceDisplay}
                    onChange={(e) => {
                      setPriceDisplay(e.target.value);
                      setForm((f) => ({
                        ...f,
                        priceInPaisa: Math.round(
                          parseFloat(e.target.value || '0') * 100
                        ),
                      }));
                    }}
                    className="input-field"
                    placeholder="8500"
                  />
                </div>
                <div>
                  <label className="input-label">
                    MRP ({'\u20B9'})
                  </label>
                  <input
                    type="number"
                    value={mrpDisplay}
                    onChange={(e) => {
                      setMrpDisplay(e.target.value);
                      setForm((f) => ({
                        ...f,
                        mrpInPaisa: Math.round(
                          parseFloat(e.target.value || '0') * 100
                        ),
                      }));
                    }}
                    className="input-field"
                    placeholder="12000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Fabric</label>
                  <select
                    value={form.fabric}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        fabric: e.target.value as Saree['fabric'],
                      }))
                    }
                    className="input-field"
                  >
                    <option value="SILK">Pure Silk</option>
                    <option value="COTTON">Handloom Cotton</option>
                    <option value="SILK_COTTON">Silk Cotton Blend</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Weave</label>
                  <select
                    value={form.weave}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        weave: e.target.value as Saree['weave'],
                      }))
                    }
                    className="input-field"
                  >
                    <option value="IKAT">Ikat</option>
                    <option value="TELIA_RUMAL">Telia Rumal</option>
                    <option value="MERCERIZED">Mercerized</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="input-label">Color</label>
                  <input
                    type="text"
                    value={form.color}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, color: e.target.value }))
                    }
                    className="input-field"
                    placeholder="Magenta"
                  />
                </div>
                <div>
                  <label className="input-label">Length (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.lengthInMeters}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        lengthInMeters: parseFloat(e.target.value || '0'),
                      }))
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="input-label">Stock</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        stock: parseInt(e.target.value || '0', 10),
                      }))
                    }
                    className="input-field"
                  />
                </div>
              </div>

              {/* GST & HSN */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">GST %</label>
                  <select
                    value={form.gstPct}
                    onChange={(e) => setForm((f) => ({ ...f, gstPct: parseInt(e.target.value, 10) }))}
                    className="input-field"
                  >
                    <option value={0}>0% (Exempt)</option>
                    <option value={5}>5% (Handloom / below ₹1000)</option>
                    <option value={12}>12% (Above ₹1000)</option>
                    <option value={18}>18%</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">HSN Code</label>
                  <input
                    type="text"
                    value={form.hsnCode}
                    onChange={(e) => setForm((f) => ({ ...f, hsnCode: e.target.value }))}
                    className="input-field font-mono"
                    placeholder="50079090"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="blouse"
                  checked={form.blousePieceIncluded}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      blousePieceIncluded: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 accent-maroon"
                />
                <label htmlFor="blouse" className="font-ui text-sm text-bark">
                  Blouse piece included
                </label>
              </div>

              {/* Image Upload Section */}
              <div className="border-t border-cream-deep/40 pt-5">
                {editId ? (
                  <ImageUploader
                    sareeId={editId}
                    images={editImages}
                    onImagesChange={setEditImages}
                  />
                ) : (
                  <div>
                    <label className="input-label">Images</label>
                    <p className="font-ui text-xs text-bark-light/50 italic">
                      Save the saree first, then add images via the edit form.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Validation errors */}
            {saveErrors.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-semibold text-red-800 mb-1">Cannot save — requirements not met:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {saveErrors.map((err, i) => (
                    <li key={i} className="text-xs text-red-700">{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements hint */}
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs font-semibold text-amber-800 mb-1">Product requirements:</p>
              <div className="flex items-center gap-4 text-xs text-amber-700">
                <span className={editImages.length >= 3 ? 'text-green-700' : ''}>
                  {editImages.length >= 3 ? '✅' : '❌'} Min 3 images ({editImages.length}/3)
                </span>
                <span>
                  {sarees.find(s => s.id === editId)?.videoUrl ? '✅' : '❌'} 1 video required
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                onClick={() => { setModalMode('closed'); setSaveErrors([]); }}
                className="btn-outline"
              >
                Cancel
              </button>
              <button onClick={handleSave} className="btn-primary">
                {modalMode === 'add' ? 'Add Saree' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Upload Modal */}
      {videoModalSareeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-bark/50"
            onClick={() => {
              if (!videoUploading) setVideoModalSareeId(null);
            }}
          />
          <div className="relative bg-cream w-full max-w-lg p-6 sm:p-8 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-xl font-bold text-bark">
                  Upload Nool Video
                </h2>
                <p className="font-ui text-xs text-bark-light/60 mt-1">
                  For: {sarees.find((s) => s.id === videoModalSareeId)?.name || videoModalSareeId}
                </p>
              </div>
              <button
                onClick={() => {
                  if (!videoUploading) setVideoModalSareeId(null);
                }}
                className="p-1 text-bark-light hover:text-bark"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div
                onClick={() => videoInputRef.current?.click()}
                className={`
                  border-2 border-dashed transition-colors cursor-pointer p-6 text-center
                  ${videoError ? 'border-red-300 bg-red-50/30' : 'border-cream-deep hover:border-gold'}
                `}
              >
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/webm"
                  onChange={handleVideoSelect}
                  className="hidden"
                />
                {videoFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <svg
                      className="w-8 h-8 text-sage"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <div className="text-left">
                      <p className="font-ui text-sm font-medium text-bark">
                        {videoFile.name}
                      </p>
                      <p className="font-ui text-xs text-bark-light/60">
                        {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                        {videoFile.type === 'video/mp4' ? ' (MP4)' : ' (WebM)'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <svg
                      className="w-10 h-10 text-bark-light/30 mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="font-ui text-sm text-bark-light/60">
                      Click to select video
                    </p>
                    <p className="font-ui text-xs text-bark-light/40 mt-1">
                      .mp4 or .webm only, max 50MB
                    </p>
                  </div>
                )}
              </div>

              {videoError && (
                <p className="font-ui text-xs text-red-600">{videoError}</p>
              )}

              {videoUploading && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-ui text-xs text-bark-light/60">
                      Uploading to server...
                    </span>
                    <span className="font-ui text-xs font-medium text-bark">
                      {videoProgress}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-cream-deep rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${videoProgress}%`,
                        background:
                          'linear-gradient(90deg, var(--maroon), var(--gold))',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  if (!videoUploading) setVideoModalSareeId(null);
                }}
                className="btn-outline"
                disabled={videoUploading}
              >
                Cancel
              </button>
              <button
                onClick={handleVideoUpload}
                className="btn-primary"
                disabled={!videoFile || videoUploading}
              >
                {videoUploading ? 'Uploading...' : 'Upload Video'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
