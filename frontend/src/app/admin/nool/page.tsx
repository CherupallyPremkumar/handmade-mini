'use client';

import { useState, useRef } from 'react';
import { sampleNool } from '@/lib/nool-data';
import { sampleSarees } from '@/lib/sample-data';
import { formatINR } from '@/lib/format';
import { api } from '@/lib/api';
import type { Nool } from '@/lib/nool-data';

type ModalMode = 'closed' | 'add' | 'edit';

interface NoolForm {
  title: string;
  description: string;
  linkedSareeId: string;
  isActive: boolean;
}

const EMPTY_FORM: NoolForm = {
  title: '',
  description: '',
  linkedSareeId: '',
  isActive: true,
};

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function validateVideoFile(file: File): string | null {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return 'Only .mp4 and .webm video files are allowed';
  }
  if (file.size > MAX_VIDEO_SIZE) {
    return `Video file must be under 50MB (selected: ${(file.size / (1024 * 1024)).toFixed(1)}MB)`;
  }
  return null;
}

export default function AdminNoolPage() {
  const [nool, setNool] = useState<Nool[]>(sampleNool);
  const [modalMode, setModalMode] = useState<ModalMode>('closed');
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<NoolForm>(EMPTY_FORM);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  function openAdd() {
    setForm(EMPTY_FORM);
    setSelectedFile(null);
    setSelectedThumbnail(null);
    setUploadProgress(0);
    setUploadError(null);
    setEditId(null);
    setModalMode('add');
  }

  function openEdit(nool: Nool) {
    setForm({
      title: nool.title,
      description: nool.description,
      linkedSareeId: nool.linkedSareeId || '',
      isActive: nool.isActive,
    });
    setSelectedFile(null);
    setSelectedThumbnail(null);
    setUploadProgress(0);
    setUploadError(null);
    setEditId(nool.id);
    setModalMode('edit');
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateVideoFile(file);
    if (error) {
      setUploadError(error);
      setSelectedFile(null);
      return;
    }

    setUploadError(null);
    setSelectedFile(file);
  }

  function handleThumbnailSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setSelectedThumbnail(file);
  }

  async function handleSave() {
    if (!form.title.trim()) {
      setUploadError('Title is required');
      return;
    }

    const linkedSaree = form.linkedSareeId
      ? sampleSarees.find((s) => s.id === form.linkedSareeId)
      : null;

    if (selectedFile) {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadError(null);

      try {
        // Build FormData for the nool upload
        const formData = new FormData();
        formData.append('video', selectedFile);
        formData.append('title', form.title);
        formData.append('description', form.description);
        if (form.linkedSareeId) {
          formData.append('linkedSareeId', form.linkedSareeId);
        }
        formData.append('isActive', String(form.isActive));
        if (selectedThumbnail) {
          formData.append('thumbnail', selectedThumbnail);
        }

        // Simulate progress while waiting for the upload to complete
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 85) {
              clearInterval(progressInterval);
              return 85;
            }
            return prev + 8;
          });
        }, 300);

        // Also try video-specific upload endpoint for the linked saree
        if (form.linkedSareeId) {
          const videoResult = await api.videos.upload(
            form.linkedSareeId,
            selectedFile
          );
          clearInterval(progressInterval);

          if (videoResult.success) {
            setUploadProgress(100);
            finishSave(linkedSaree, videoResult.data.videoUrl);
          } else {
            // Fall back to nool upload endpoint
            const noolResult = await api.nool.upload(formData);
            if (noolResult.success) {
              setUploadProgress(100);
              finishSave(linkedSaree, noolResult.data.videoUrl);
            } else {
              const errMsg =
                noolResult.errors?.[0]?.description || 'Upload failed';
              setUploadError(errMsg);
            }
          }
        } else {
          // No linked saree - use nool upload endpoint
          const noolResult = await api.nool.upload(formData);
          clearInterval(progressInterval);

          if (noolResult.success) {
            setUploadProgress(100);
            finishSave(linkedSaree, noolResult.data.videoUrl);
          } else {
            const errMsg =
              noolResult.errors?.[0]?.description || 'Upload failed';
            setUploadError(errMsg);
          }
        }
      } catch {
        setUploadError('Upload failed. Please try again.');
      } finally {
        setIsUploading(false);
      }
    } else {
      finishSave(linkedSaree, null);
    }
  }

  function finishSave(
    linkedSaree: (typeof sampleSarees)[number] | null | undefined,
    videoUrl: string | null
  ) {
    if (modalMode === 'add') {
      const newNool: Nool = {
        id: `nool-${Date.now()}`,
        title: form.title,
        description: form.description,
        videoUrl: videoUrl || (selectedFile ? URL.createObjectURL(selectedFile) : null),
        thumbnailGradient:
          'linear-gradient(135deg, #2d1b00 0%, #5c4033 40%, #8B1A1A 70%, #D4A017 100%)',
        linkedSareeId: form.linkedSareeId || null,
        linkedSareeName: linkedSaree?.name || null,
        linkedSareePrice: linkedSaree?.priceInPaisa || null,
        duration: 30,
        views: 0,
        likes: 0,
        isActive: form.isActive,
        createdAt: new Date().toISOString(),
      };
      setNool((prev) => [newNool, ...prev]);
    } else if (modalMode === 'edit' && editId) {
      setNool((prev) =>
        prev.map((d) =>
          d.id === editId
            ? {
                ...d,
                title: form.title,
                description: form.description,
                linkedSareeId: form.linkedSareeId || null,
                linkedSareeName: linkedSaree?.name || null,
                linkedSareePrice: linkedSaree?.priceInPaisa || null,
                isActive: form.isActive,
                ...(videoUrl
                  ? { videoUrl }
                  : selectedFile
                    ? { videoUrl: URL.createObjectURL(selectedFile) }
                    : {}),
              }
            : d
        )
      );
    }
    setModalMode('closed');
    setSelectedFile(null);
    setSelectedThumbnail(null);
    setUploadProgress(0);
    setUploadError(null);
  }

  function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this nool?')) {
      setNool((prev) => prev.filter((d) => d.id !== id));
    }
  }

  function toggleActive(id: string) {
    setNool((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isActive: !d.isActive } : d))
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-bark">
            Manage Nool
          </h1>
          <p className="font-ui text-sm text-bark-light/60 mt-1">
            Short video reels showcasing sarees, weaving, and artisan stories
          </p>
        </div>
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
          Upload New Nool
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-cream-deep/60 p-4">
          <p className="font-ui text-xs tracking-wider uppercase text-bark-light/60 mb-1">
            Total Nool
          </p>
          <p className="font-display text-2xl font-bold text-bark">
            {nool.length}
          </p>
        </div>
        <div className="bg-white border border-cream-deep/60 p-4">
          <p className="font-ui text-xs tracking-wider uppercase text-bark-light/60 mb-1">
            Active
          </p>
          <p className="font-display text-2xl font-bold text-sage">
            {nool.filter((d) => d.isActive).length}
          </p>
        </div>
        <div className="bg-white border border-cream-deep/60 p-4">
          <p className="font-ui text-xs tracking-wider uppercase text-bark-light/60 mb-1">
            Total Views
          </p>
          <p className="font-display text-2xl font-bold text-bark">
            {formatCount(nool.reduce((acc, d) => acc + d.views, 0))}
          </p>
        </div>
        <div className="bg-white border border-cream-deep/60 p-4">
          <p className="font-ui text-xs tracking-wider uppercase text-bark-light/60 mb-1">
            Total Likes
          </p>
          <p className="font-display text-2xl font-bold text-maroon">
            {formatCount(nool.reduce((acc, d) => acc + d.likes, 0))}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-cream-deep/60 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-cream-deep/40">
              <th className="text-left px-4 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">
                Nool
              </th>
              <th className="text-left px-4 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60 hidden sm:table-cell">
                Linked Saree
              </th>
              <th className="text-center px-4 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60 hidden md:table-cell">
                Duration
              </th>
              <th className="text-right px-4 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60 hidden sm:table-cell">
                Views
              </th>
              <th className="text-right px-4 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60 hidden md:table-cell">
                Likes
              </th>
              <th className="text-center px-4 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">
                Status
              </th>
              <th className="text-left px-4 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60 hidden lg:table-cell">
                Date
              </th>
              <th className="text-right px-4 py-3 font-ui text-xs font-semibold tracking-wider uppercase text-bark-light/60">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {nool.map((nool) => (
              <tr
                key={nool.id}
                className="border-b border-cream-deep/20 last:border-0 hover:bg-cream-warm/50 transition-colors"
              >
                {/* Thumbnail + Title */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-16 rounded flex-shrink-0 relative overflow-hidden"
                      style={{ background: nool.thumbnailGradient }}
                    >
                      {/* Play icon overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-white/60"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="font-ui text-sm font-medium text-bark truncate max-w-[200px]">
                        {nool.title}
                      </p>
                      <p className="font-ui text-xs text-bark-light/60 truncate max-w-[200px]">
                        {nool.description.slice(0, 60)}...
                      </p>
                    </div>
                  </div>
                </td>

                {/* Linked Saree */}
                <td className="px-4 py-3 hidden sm:table-cell">
                  {nool.linkedSareeName ? (
                    <div>
                      <p className="font-ui text-sm text-bark">
                        {nool.linkedSareeName}
                      </p>
                      {nool.linkedSareePrice !== null && (
                        <p className="font-ui text-xs text-maroon font-medium">
                          {formatINR(nool.linkedSareePrice)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="font-ui text-xs text-bark-light/40 italic">
                      Brand story
                    </span>
                  )}
                </td>

                {/* Duration */}
                <td className="px-4 py-3 text-center hidden md:table-cell">
                  <span className="font-ui text-sm text-bark">
                    {formatDuration(nool.duration)}
                  </span>
                </td>

                {/* Views */}
                <td className="px-4 py-3 text-right hidden sm:table-cell">
                  <span className="font-ui text-sm text-bark">
                    {formatCount(nool.views)}
                  </span>
                </td>

                {/* Likes */}
                <td className="px-4 py-3 text-right hidden md:table-cell">
                  <span className="font-ui text-sm text-bark">
                    {formatCount(nool.likes)}
                  </span>
                </td>

                {/* Status toggle */}
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggleActive(nool.id)}
                    className={`
                      w-10 h-6 rounded-full relative transition-colors
                      ${nool.isActive ? 'bg-sage' : 'bg-bark-light/20'}
                    `}
                  >
                    <span
                      className={`
                        absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all
                        ${nool.isActive ? 'left-5' : 'left-1'}
                      `}
                    />
                  </button>
                </td>

                {/* Date */}
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="font-ui text-sm text-bark-light/60">
                    {formatDate(nool.createdAt)}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEdit(nool)}
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
                      onClick={() => handleDelete(nool.id)}
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
            onClick={() => {
              if (!isUploading) setModalMode('closed');
            }}
          />
          <div className="relative bg-cream w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-bark">
                {modalMode === 'add' ? 'Upload New Nool' : 'Edit Nool'}
              </h2>
              <button
                onClick={() => {
                  if (!isUploading) setModalMode('closed');
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

            <div className="space-y-5">
              {/* Video Upload */}
              <div>
                <label className="input-label">
                  Video File
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    border-2 border-dashed transition-colors cursor-pointer p-6 text-center
                    ${uploadError ? 'border-red-300 bg-red-50/30' : 'border-cream-deep hover:border-gold'}
                  `}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/webm"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {selectedFile ? (
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
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div className="text-left">
                        <p className="font-ui text-sm font-medium text-bark">
                          {selectedFile.name}
                        </p>
                        <p className="font-ui text-xs text-bark-light/60">
                          {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                          {selectedFile.type === 'video/mp4' ? ' (MP4)' : ' (WebM)'}
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
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="font-ui text-sm text-bark-light/60">
                        Click to upload video
                      </p>
                      <p className="font-ui text-xs text-bark-light/40 mt-1">
                        .mp4 or .webm only, max 50MB
                      </p>
                    </div>
                  )}
                </div>

                {/* Upload error */}
                {uploadError && (
                  <p className="mt-2 font-ui text-xs text-red-600">
                    {uploadError}
                  </p>
                )}

                {/* Upload progress */}
                {isUploading && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-ui text-xs text-bark-light/60">
                        Uploading to server...
                      </span>
                      <span className="font-ui text-xs font-medium text-bark">
                        {uploadProgress}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-cream-deep rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${uploadProgress}%`,
                          background:
                            'linear-gradient(90deg, var(--maroon), var(--gold))',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnail */}
              <div>
                <label className="input-label">
                  Thumbnail Image{' '}
                  <span className="text-bark-light/40 normal-case font-normal">
                    (optional -- auto-generated from video if not provided)
                  </span>
                </label>
                <div
                  onClick={() => thumbnailInputRef.current?.click()}
                  className="border-2 border-dashed border-cream-deep hover:border-gold transition-colors cursor-pointer p-4 text-center"
                >
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailSelect}
                    className="hidden"
                  />
                  {selectedThumbnail ? (
                    <p className="font-ui text-sm text-bark">
                      {selectedThumbnail.name}
                    </p>
                  ) : (
                    <p className="font-ui text-xs text-bark-light/40">
                      Click to upload thumbnail
                    </p>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="input-label">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  className="input-field"
                  placeholder='e.g., "Royal Blue Ikat -- See the weave pattern"'
                />
              </div>

              {/* Description */}
              <div>
                <label className="input-label">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={3}
                  className="input-field resize-y"
                  placeholder="Describe what this nool shows..."
                />
              </div>

              {/* Link to Saree */}
              <div>
                <label className="input-label">
                  Link to Saree{' '}
                  <span className="text-bark-light/40 normal-case font-normal">
                    (optional -- leave empty for brand stories)
                  </span>
                </label>
                <select
                  value={form.linkedSareeId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, linkedSareeId: e.target.value }))
                  }
                  className="input-field"
                >
                  <option value="">No linked saree (brand story)</option>
                  {sampleSarees.map((saree) => (
                    <option key={saree.id} value={saree.id}>
                      {saree.name} -- {formatINR(saree.priceInPaisa)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="nool-active"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isActive: e.target.checked }))
                  }
                  className="w-4 h-4 accent-maroon"
                />
                <label
                  htmlFor="nool-active"
                  className="font-ui text-sm text-bark"
                >
                  Active (visible to customers)
                </label>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  if (!isUploading) setModalMode('closed');
                }}
                className="btn-outline"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn-primary"
                disabled={isUploading}
              >
                {isUploading
                  ? 'Uploading...'
                  : modalMode === 'add'
                    ? 'Upload Nool'
                    : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
