'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { formatINR } from '@/lib/format';
import { api } from '@/lib/api';

const API = process.env.NEXT_PUBLIC_API_URL || '';

interface Product {
  id: string;
  name: string;
  sellingPrice: number;
  videoUrl: string | null;
  images: string[];
  isActive: boolean;
}

export default function AdminNoolPage() {
  const { getAuthHeaders } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/products`);
      if (res.ok) setProducts(await res.json());
    } catch (e) {
      // Log for debugging
    } finally {
      setLoading(false);
    }
  }

  const withVideo = products.filter((p) => p.videoUrl);
  const withoutVideo = products.filter((p) => !p.videoUrl);

  function openUpload(productId: string) {
    setSelectedProductId(productId);
    setUploadError('');
    fileInputRef.current?.click();
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedProductId) return;

    if (file.type !== 'video/mp4' && file.type !== 'video/webm') {
      setUploadError('Only .mp4 and .webm allowed');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setUploadError('Max 50MB');
      return;
    }

    setUploadingId(selectedProductId);
    setUploadError('');

    try {
      const result = await api.videos.upload(selectedProductId, file);
      if (result.success) {
        fetchProducts();
      } else {
        setUploadError(result.errors?.[0]?.description || 'Upload failed');
      }
    } catch (e) {
      setUploadError('Upload failed');
    } finally {
      setUploadingId(null);
      setSelectedProductId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-bark">Nool Videos</h1>
          <p className="font-ui text-xs text-bark-light mt-1">
            {withVideo.length} products with video &middot; {withoutVideo.length} without
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

      {uploadError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 font-ui text-sm">
          {uploadError}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-cream-deep/50 h-20 rounded" />
          ))}
        </div>
      ) : (
        <>
          {/* Products WITH video */}
          {withVideo.length > 0 && (
            <div className="mb-8">
              <h2 className="font-ui text-xs font-semibold tracking-wider uppercase text-sage mb-3">
                Products with Nool Video ({withVideo.length})
              </h2>
              <div className="space-y-2">
                {withVideo.map((p) => (
                  <div key={p.id} className="bg-white border border-cream-deep/60 p-4 flex items-center gap-4">
                    {/* Video preview */}
                    <div className="w-16 h-20 bg-bark rounded overflow-hidden shrink-0">
                      <video
                        src={p.videoUrl!}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-ui text-sm font-medium text-bark truncate">{p.name}</p>
                      <p className="font-ui text-xs text-bark-light mt-0.5">{formatINR(p.sellingPrice)}</p>
                      <p className="font-ui text-[10px] text-bark-light/50 mt-0.5 truncate">{p.videoUrl}</p>
                    </div>

                    <button
                      onClick={() => openUpload(p.id)}
                      disabled={uploadingId === p.id}
                      className="px-3 py-1.5 font-ui text-xs font-medium text-bark-light border border-cream-deep hover:border-maroon hover:text-maroon transition-colors rounded disabled:opacity-50"
                    >
                      {uploadingId === p.id ? 'Uploading...' : 'Replace'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products WITHOUT video */}
          {withoutVideo.length > 0 && (
            <div>
              <h2 className="font-ui text-xs font-semibold tracking-wider uppercase text-terracotta mb-3">
                Missing Nool Video ({withoutVideo.length})
              </h2>
              <div className="space-y-2">
                {withoutVideo.map((p) => (
                  <div key={p.id} className="bg-white border border-red-100 p-4 flex items-center gap-4">
                    <div className="w-16 h-20 bg-cream-warm border border-cream-deep/40 flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-bark-light/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-ui text-sm font-medium text-bark truncate">{p.name}</p>
                      <p className="font-ui text-xs text-bark-light mt-0.5">{formatINR(p.sellingPrice)}</p>
                      <p className="font-ui text-xs text-terracotta mt-0.5">No video uploaded</p>
                    </div>

                    <button
                      onClick={() => openUpload(p.id)}
                      disabled={uploadingId === p.id}
                      className="px-3 py-1.5 font-ui text-xs font-medium bg-maroon/5 text-maroon border border-maroon/20 hover:bg-maroon/10 transition-colors rounded disabled:opacity-50"
                    >
                      {uploadingId === p.id ? 'Uploading...' : 'Upload Video'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {products.length === 0 && (
            <div className="text-center py-20 bg-white border border-cream-deep/60">
              <p className="font-body text-bark-light">No products found.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
