'use client';

import { useState, useEffect, useRef } from 'react';
import { formatINR } from '@/lib/format';

const API = process.env.NEXT_PUBLIC_API_URL || '';

interface Product {
  id: string;
  name: string;
  sellingPrice: number;
  videoUrl: string | null;
  images: string[];
  isActive: boolean;
}

interface UploadState {
  productId: string;
  productName: string;
  fileName: string;
  fileSize: number;
  progress: number;
  status: 'selecting' | 'uploading' | 'confirming' | 'done' | 'error';
  error?: string;
}

export default function AdminNoolPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [upload, setUpload] = useState<UploadState | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchProducts(); }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/products`);
      if (res.ok) setProducts(await res.json());
    } catch {} finally { setLoading(false); }
  }

  const withVideo = products.filter((p) => p.videoUrl);
  const withoutVideo = products.filter((p) => !p.videoUrl);

  function openUpload(product: Product) {
    setUpload({
      productId: product.id,
      productName: product.name,
      fileName: '',
      fileSize: 0,
      progress: 0,
      status: 'selecting',
    });
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !upload) return;

    if (file.type !== 'video/mp4' && file.type !== 'video/webm') {
      setUpload({ ...upload, status: 'error', error: 'Only .mp4 and .webm allowed' });
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setUpload({ ...upload, status: 'error', error: 'Max 100MB' });
      return;
    }

    setUpload({
      ...upload,
      fileName: file.name,
      fileSize: file.size,
      status: 'uploading',
      progress: 0,
    });

    doUpload(file, upload.productId);
  }

  async function doUpload(file: File, productId: string) {
    try {
      // Step 1: Get presigned URL
      setUpload((u) => u ? { ...u, progress: 5, status: 'uploading' } : u);

      const presignRes = await fetch(`${API}/api/admin/media/presign-video`, {
        method: 'POST',
        credentials: 'include' as RequestCredentials,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, contentType: file.type, filename: file.name }),
      });

      if (!presignRes.ok) {
        setUpload((u) => u ? { ...u, status: 'error', error: 'Failed to prepare upload' } : u);
        return;
      }

      const { uploadUrl, cdnUrl } = await presignRes.json();

      // Step 2: Upload to R2 with XMLHttpRequest for progress
      setUpload((u) => u ? { ...u, progress: 10 } : u);

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 85) + 10; // 10-95%
            setUpload((u) => u ? { ...u, progress: pct } : u);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed: ${xhr.status}`));
        };

        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(file);
      });

      // Step 3: Confirm
      setUpload((u) => u ? { ...u, progress: 96, status: 'confirming' } : u);

      await fetch(`${API}/api/admin/media/confirm-video`, {
        method: 'POST',
        credentials: 'include' as RequestCredentials,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, cdnUrl }),
      });

      setUpload((u) => u ? { ...u, progress: 100, status: 'done' } : u);

      // Auto-close after 2s
      setTimeout(() => {
        setUpload(null);
        fetchProducts();
      }, 2000);

    } catch (err) {
      setUpload((u) => u ? {
        ...u,
        status: 'error',
        error: err instanceof Error ? err.message : 'Upload failed',
      } : u);
    }
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-bark">Nool Videos</h1>
          <p className="font-ui text-xs text-bark-light mt-1">
            {withVideo.length} with video &middot; {withoutVideo.length} without
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm"
        onChange={handleFileSelect}
        className="hidden"
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="animate-pulse bg-cream-deep/50 h-20 rounded-xl" />)}
        </div>
      ) : (
        <>
          {/* Stats summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-cream-deep/60 shadow-sm">
              <p className="font-ui text-[10px] uppercase tracking-wider text-bark-light/60 mb-1">Total Products</p>
              <p className="font-display text-xl font-bold text-bark">{products.length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-cream-deep/60 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <p className="font-ui text-[10px] uppercase tracking-wider text-bark-light/60">With Video</p>
                <div className="w-6 h-6 rounded-md bg-sage/10 flex items-center justify-center">
                  <svg className="w-3 h-3 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
              </div>
              <p className="font-display text-xl font-bold text-sage">{withVideo.length}</p>
            </div>
            <div className={`rounded-xl p-4 border shadow-sm ${withoutVideo.length > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-cream-deep/60'}`}>
              <div className="flex items-center justify-between mb-1">
                <p className="font-ui text-[10px] uppercase tracking-wider text-bark-light/60">Missing Video</p>
                {withoutVideo.length > 0 && <div className="w-6 h-6 rounded-md bg-red-100 flex items-center justify-center"><svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg></div>}
              </div>
              <p className={`font-display text-xl font-bold ${withoutVideo.length > 0 ? 'text-red-600' : 'text-bark'}`}>{withoutVideo.length}</p>
            </div>
          </div>

          {withVideo.length > 0 && (
            <div className="mb-8">
              <h2 className="font-ui text-xs font-semibold tracking-wider uppercase text-sage mb-3">
                Products with Nool Video ({withVideo.length})
              </h2>
              <div className="space-y-3">
                {withVideo.map((p) => (
                  <div key={p.id} className="bg-white rounded-xl border border-cream-deep/60 shadow-sm p-4 flex items-center gap-4">
                    <div className="w-16 h-20 bg-bark rounded-lg overflow-hidden shrink-0">
                      <video src={p.videoUrl!} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-ui text-sm font-medium text-bark truncate">{p.name}</p>
                      <p className="font-ui text-xs text-bark-light mt-0.5">{formatINR(p.sellingPrice)}</p>
                    </div>
                    <button onClick={() => { openUpload(p); setTimeout(() => fileInputRef.current?.click(), 100); }} className="px-3 py-1.5 font-ui text-xs font-medium text-bark-light border border-cream-deep hover:border-maroon hover:text-maroon transition-colors rounded-lg">
                      Replace
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {withoutVideo.length > 0 && (
            <div>
              <h2 className="font-ui text-xs font-semibold tracking-wider uppercase text-terracotta mb-3">
                Missing Nool Video ({withoutVideo.length})
              </h2>
              <div className="space-y-3">
                {withoutVideo.map((p) => (
                  <div key={p.id} className="bg-white rounded-xl border border-red-100 shadow-sm p-4 flex items-center gap-4">
                    <div className="w-16 h-20 bg-cream-warm rounded-lg border border-cream-deep/40 flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-bark-light/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-ui text-sm font-medium text-bark truncate">{p.name}</p>
                      <p className="font-ui text-xs text-bark-light mt-0.5">{formatINR(p.sellingPrice)}</p>
                      <p className="font-ui text-xs text-terracotta mt-0.5">No video uploaded</p>
                    </div>
                    <button onClick={() => { openUpload(p); setTimeout(() => fileInputRef.current?.click(), 100); }} className="px-3 py-1.5 font-ui text-xs font-medium bg-maroon/5 text-maroon border border-maroon/20 hover:bg-maroon/10 transition-colors rounded-lg">
                      Upload Video
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══ Upload Progress Popup ═══ */}
      {upload && upload.status !== 'selecting' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-bark/60 backdrop-blur-sm" />
          <div className="relative bg-cream w-full max-w-md p-6 rounded-2xl shadow-2xl animate-fade-in-up">

            {/* Header */}
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-maroon/10 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-maroon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display text-base font-semibold text-bark">
                  {upload.status === 'done' ? 'Upload Complete!' : upload.status === 'error' ? 'Upload Failed' : 'Uploading Video'}
                </p>
                <p className="font-ui text-xs text-bark-light truncate mt-0.5">{upload.productName}</p>
              </div>
              {(upload.status === 'done' || upload.status === 'error') && (
                <button onClick={() => { setUpload(null); fetchProducts(); }} className="p-1 text-bark-light hover:text-bark rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* File info */}
            <div className="flex items-center gap-3 p-3 bg-cream-warm rounded-lg mb-4">
              <svg className="w-8 h-8 text-bark-light/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="font-ui text-sm text-bark truncate">{upload.fileName}</p>
                <p className="font-ui text-xs text-bark-light">{formatSize(upload.fileSize)}</p>
              </div>
            </div>

            {/* Progress */}
            {upload.status === 'uploading' || upload.status === 'confirming' ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-ui text-xs text-bark-light">
                    {upload.status === 'confirming' ? 'Saving...' : 'Uploading to cloud...'}
                  </span>
                  <span className="font-ui text-sm font-bold text-maroon">{upload.progress}%</span>
                </div>
                <div className="w-full h-3 bg-cream-deep rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300 ease-out"
                    style={{
                      width: `${upload.progress}%`,
                      background: 'linear-gradient(90deg, var(--maroon), var(--gold))',
                    }}
                  />
                </div>
                <p className="font-ui text-[10px] text-bark-light/50 mt-2 text-center">
                  Please do not close this page
                </p>
              </div>
            ) : upload.status === 'done' ? (
              <div className="text-center py-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-sage/20 flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-ui text-sm text-sage font-medium">Video uploaded successfully!</p>
              </div>
            ) : upload.status === 'error' ? (
              <div className="text-center py-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="font-ui text-sm text-red-600">{upload.error}</p>
                <button
                  onClick={() => { setUpload(null); }}
                  className="mt-3 px-4 py-1.5 font-ui text-xs bg-bark text-cream rounded-lg hover:bg-bark/80"
                >
                  Close
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
