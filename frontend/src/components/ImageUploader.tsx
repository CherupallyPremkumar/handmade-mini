'use client';

import { useState, useRef, useCallback } from 'react';
import { authHeaders } from '@/lib/auth-store';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES = 6;

interface ImageUploaderProps {
  sareeId: string;
  images: string[];
  onImagesChange: (images: string[]) => void;
  /** @deprecated Auth headers are now read from the auth store automatically. */
  token?: string;
}

interface UploadProgress {
  file: File;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
  url?: string;
}

export default function ImageUploader({
  sareeId,
  images,
  onImagesChange,
  token,
}: ImageUploaderProps) {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableSlots = MAX_IMAGES - images.length;

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `${file.name}: Only JPEG, PNG, and WebP files are allowed`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: File exceeds 5MB limit`;
    }
    return null;
  }, []);

  const uploadFile = useCallback(
    async (file: File, index: number) => {
      setUploads((prev) =>
        prev.map((u, i) =>
          i === index ? { ...u, status: 'uploading' as const, progress: 10 } : u
        )
      );

      const formData = new FormData();
      formData.append('file', file);

      try {
        // Simulate progress increments since fetch doesn't support upload progress natively
        const progressInterval = setInterval(() => {
          setUploads((prev) =>
            prev.map((u, i) =>
              i === index && u.status === 'uploading'
                ? { ...u, progress: Math.min(u.progress + 15, 85) }
                : u
            )
          );
        }, 200);

        const headers: Record<string, string> = {
          ...authHeaders(),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        const res = await fetch(
          `${API}/api/admin/images/upload?sareeId=${encodeURIComponent(sareeId)}`,
          {
            method: 'POST',
            headers,
            body: formData,
          }
        );

        clearInterval(progressInterval);

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Upload failed' }));
          throw new Error(err.error || `Upload failed (${res.status})`);
        }

        const data = await res.json();
        const imageUrl = data.imageUrl as string;

        setUploads((prev) =>
          prev.map((u, i) =>
            i === index
              ? { ...u, status: 'done' as const, progress: 100, url: imageUrl }
              : u
          )
        );

        onImagesChange([...images, imageUrl]);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        setUploads((prev) =>
          prev.map((u, i) =>
            i === index
              ? { ...u, status: 'error' as const, progress: 0, error: message }
              : u
          )
        );
      }
    },
    [sareeId, token, images, onImagesChange]
  );

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);

      if (fileArray.length > availableSlots) {
        alert(
          `Can only upload ${availableSlots} more image(s). Maximum ${MAX_IMAGES} per saree.`
        );
        return;
      }

      // Validate all files first
      const errors: string[] = [];
      fileArray.forEach((file) => {
        const error = validateFile(file);
        if (error) errors.push(error);
      });

      if (errors.length > 0) {
        alert(errors.join('\n'));
        return;
      }

      // Create upload entries
      const newUploads: UploadProgress[] = fileArray.map((file) => ({
        file,
        progress: 0,
        status: 'pending' as const,
      }));

      setUploads((prev) => [...prev, ...newUploads]);

      // Start uploads sequentially to avoid overwhelming the server
      const startIndex = uploads.length;
      fileArray.forEach((file, i) => {
        uploadFile(file, startIndex + i);
      });
    },
    [availableSlots, validateFile, uploadFile, uploads.length]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
        e.target.value = ''; // Reset so same file can be re-selected
      }
    },
    [handleFiles]
  );

  const handleDeleteImage = useCallback(
    async (imageUrl: string) => {
      const headers: Record<string, string> = {
        ...authHeaders(),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      try {
        const res = await fetch(
          `${API}/api/admin/images?sareeId=${encodeURIComponent(sareeId)}&imageUrl=${encodeURIComponent(imageUrl)}`,
          {
            method: 'DELETE',
            headers,
          }
        );

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Delete failed' }));
          alert(err.error || 'Failed to delete image');
          return;
        }

        onImagesChange(images.filter((url) => url !== imageUrl));
      } catch {
        alert('Failed to delete image. Please try again.');
      }
    },
    [sareeId, token, images, onImagesChange]
  );

  const clearCompletedUploads = useCallback(() => {
    setUploads((prev) => prev.filter((u) => u.status !== 'done' && u.status !== 'error'));
  }, []);

  const activeUploads = uploads.filter(
    (u) => u.status === 'pending' || u.status === 'uploading'
  );
  const hasFinishedUploads = uploads.some(
    (u) => u.status === 'done' || u.status === 'error'
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="input-label">
          Images ({images.length}/{MAX_IMAGES})
        </label>
        {hasFinishedUploads && (
          <button
            type="button"
            onClick={clearCompletedUploads}
            className="font-ui text-xs text-bark-light hover:text-maroon transition-colors"
          >
            Clear upload log
          </button>
        )}
      </div>

      {/* Existing images grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((url, i) => (
            <div
              key={url}
              className="relative group aspect-[3/4] bg-cream-warm border border-cream-deep/60 overflow-hidden"
            >
              <img
                src={url}
                alt={`Saree image ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleDeleteImage(url)}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full
                           flex items-center justify-center opacity-0 group-hover:opacity-100
                           transition-opacity shadow-md hover:bg-red-600"
                title="Remove image"
              >
                <svg
                  className="w-3.5 h-3.5"
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
              <div className="absolute bottom-0 left-0 right-0 bg-bark/60 py-0.5 px-2">
                <span className="font-ui text-[10px] text-cream">{i + 1}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {availableSlots > 0 && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            transition-colors duration-200
            ${
              isDragging
                ? 'border-maroon bg-maroon/5'
                : 'border-cream-deep/60 hover:border-maroon/40 hover:bg-cream-warm/50'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          <svg
            className="mx-auto w-10 h-10 text-bark-light/40 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>

          <p className="font-ui text-sm text-bark-light mb-1">
            {isDragging
              ? 'Drop saree images here'
              : 'Drop saree images here or click to browse'}
          </p>
          <p className="font-ui text-xs text-bark-light/50">
            JPEG, PNG, WebP up to 5MB each. {availableSlots} slot
            {availableSlots !== 1 ? 's' : ''} remaining.
          </p>
        </div>
      )}

      {/* Upload progress */}
      {uploads.length > 0 && (
        <div className="space-y-2">
          {uploads.map((upload, i) => (
            <div
              key={`upload-${i}`}
              className="flex items-center gap-3 p-2 bg-cream-warm/50 border border-cream-deep/30 rounded"
            >
              <div className="w-8 h-8 bg-cream-warm rounded flex items-center justify-center shrink-0">
                {upload.status === 'done' ? (
                  <svg
                    className="w-4 h-4 text-sage"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : upload.status === 'error' ? (
                  <svg
                    className="w-4 h-4 text-red-500"
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
                ) : (
                  <svg
                    className="w-4 h-4 text-bark-light/40 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-ui text-xs text-bark truncate">
                  {upload.file.name}
                </p>
                {upload.status === 'error' ? (
                  <p className="font-ui text-[10px] text-red-500">
                    {upload.error}
                  </p>
                ) : upload.status === 'done' ? (
                  <p className="font-ui text-[10px] text-sage">Uploaded</p>
                ) : (
                  <div className="mt-1 h-1.5 bg-cream-deep/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-maroon rounded-full transition-all duration-300"
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No images placeholder message */}
      {images.length === 0 && activeUploads.length === 0 && (
        <p className="font-ui text-xs text-bark-light/50 italic">
          No images uploaded yet. Add images to showcase this saree.
        </p>
      )}
    </div>
  );
}
