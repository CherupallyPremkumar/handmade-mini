import type {
  Saree,
  SareeFilters,
  Order,
  OrderAddress,
  CartItem,
  Address,
  GenericResponse,
  PaginatedResponse,
  AdminStats,
  OrderStatus,
} from './types';
import { authHeaders } from './auth-store';

const API = process.env.NEXT_PUBLIC_API_URL || '';

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<GenericResponse<T>> {
  const url = `${API}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  try {
    const res = await fetch(url, { ...options, headers, credentials: 'include' });
    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);
      return {
        success: false,
        data: null as T,
        errors: errorBody?.errors || [
          {
            errorNum: res.status,
            subErrorNum: 0,
            description: errorBody?.error || res.statusText || 'Request failed',
          },
        ],
      };
    }
    const body = await res.json();
    // Backend returns raw data, not GenericResponse. Wrap it.
    if (body !== null && typeof body === 'object' && 'success' in body) {
      return body as GenericResponse<T>;
    }
    return { success: true, data: body as T };
  } catch {
    return {
      success: false,
      data: null as T,
      errors: [
        {
          errorNum: 0,
          subErrorNum: 0,
          description: 'Network error. Please check your connection.',
        },
      ],
    };
  }
}

/**
 * Like request(), but merges in auth headers automatically.
 */
async function authRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<GenericResponse<T>> {
  const auth = authHeaders();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
    ...auth,
  };
  return request<T>(path, { ...options, headers });
}

/**
 * Maps a backend Product JSON to the frontend Saree type.
 * Backend uses sellingPrice, mrp, weaveType, etc.
 * Frontend uses priceInPaisa, mrpInPaisa, weave, etc.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProductToSaree(p: any): Saree {
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? '',
    priceInPaisa: p.sellingPrice ?? p.priceInPaisa ?? 0,
    mrpInPaisa: p.mrp ?? p.mrpInPaisa ?? 0,
    fabric: p.fabric ?? 'SILK',
    weave: p.weaveType ?? p.weave ?? 'IKAT',
    color: p.bodyColor ?? p.color ?? '',
    lengthInMeters: p.lengthMeters ?? p.lengthInMeters ?? 6.0,
    blousePieceIncluded: p.blousePiece ?? p.blousePieceIncluded ?? false,
    images: p.images ?? [],
    videoUrl: p.videoUrl,
    stock: p.stock ?? 0,
    active: p.isActive ?? p.active ?? true,
    gstPct: p.gstPct ?? 5,
    createdAt: p.createdTime ?? p.createdAt ?? new Date().toISOString(),
  };
}

export const api = {
  /* ─── Auth ─── */
  auth: {
    login: async (email: string, password: string) => {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || err?.message || 'Invalid credentials');
      }
      return res.json();
    },

    register: async (
      name: string,
      email: string,
      phone: string,
      password: string
    ) => {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || err?.message || 'Registration failed');
      }
      return res.json();
    },

    me: () => authRequest<{ name: string; email: string; role: string }>('/api/auth/me'),
  },

  /* ─── Public: Sarees ─── */
  sarees: {
    list: async (filters?: SareeFilters): Promise<GenericResponse<Saree[]>> => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.set(key, String(value));
          }
        });
      }
      const qs = params.toString();
      // Backend returns List<Product> directly (not paginated)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await request<any>(
        `/api/products${qs ? `?${qs}` : ''}`
      );
      if (!res.success || !res.data) return { success: false, data: [] as Saree[], errors: res.errors };
      const raw = Array.isArray(res.data) ? res.data : (res.data.content ?? []);
      return { success: true, data: raw.map(mapProductToSaree) };
    },

    getById: async (id: string): Promise<GenericResponse<Saree>> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await request<any>(`/api/products/${id}`);
      if (!res.success || !res.data) return { success: false, data: null as unknown as Saree, errors: res.errors };
      return { success: true, data: mapProductToSaree(res.data) };
    },

    create: (saree: Partial<Saree>) =>
      authRequest<Saree>('/api/products', {
        method: 'POST',
        body: JSON.stringify(saree),
      }),

    update: (id: string, saree: Partial<Saree>) =>
      authRequest<Saree>(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(saree),
      }),

    delete: (id: string) =>
      authRequest<void>(`/api/products/${id}`, { method: 'DELETE' }),
  },

  /* ─── Public: Cart ─── */
  cart: {
    get: () => request<CartItem[]>('/api/cart'),

    addItem: (sareeId: string, quantity: number) =>
      request<CartItem[]>('/api/cart/items', {
        method: 'POST',
        body: JSON.stringify({ sareeId, quantity }),
      }),

    removeItem: (sareeId: string) =>
      request<CartItem[]>(`/api/cart/items/${sareeId}`, {
        method: 'DELETE',
      }),
  },

  /* ─── Addresses (authenticated) ─── */
  addresses: {
    list: () => authRequest<Address[]>('/api/addresses'),

    create: (address: Omit<Address, 'id' | 'createdAt'>) =>
      authRequest<Address>('/api/addresses', {
        method: 'POST',
        body: JSON.stringify(address),
      }),

    update: (id: string, address: Partial<Address>) =>
      authRequest<Address>(`/api/addresses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(address),
      }),

    delete: (id: string) =>
      authRequest<void>(`/api/addresses/${id}`, { method: 'DELETE' }),

    setDefault: (id: string) =>
      authRequest<Address>(`/api/addresses/${id}/default`, { method: 'PATCH' }),
  },

  /* ─── Public: Checkout ─── */
  checkout: {
    createOrder: (address: OrderAddress, items: CartItem[]) =>
      request<Order>('/api/checkout/create-order', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: `session-${Date.now()}`,
          customerName: address.name,
          customerPhone: address.phone,
          customerEmail: address.email,
          shippingAddress: {
            line1: address.addressLine1,
            line2: address.addressLine2 || '',
            city: address.city,
            state: address.state,
            pincode: address.pincode,
          },
        }),
      }),

    verifyPayment: (
      orderId: string,
      razorpayPaymentId: string,
      razorpayOrderId: string,
      razorpaySignature: string
    ) =>
      request<Order>('/api/checkout/verify-payment', {
        method: 'POST',
        body: JSON.stringify({
          orderId,
          razorpayPaymentId,
          razorpayOrderId,
          razorpaySignature,
        }),
      }),
  },

  /* ─── Orders (admin calls use auth) ─── */
  orders: {
    track: (orderNumber: string) =>
      request<Order>(`/api/orders/${orderNumber}`),

    list: (page = 0, size = 20) =>
      authRequest<PaginatedResponse<Order>>(
        `/api/admin/orders?page=${page}&size=${size}`
      ),

    updateStatus: (
      orderId: string,
      status: OrderStatus,
      trackingNumber?: string
    ) =>
      authRequest<Order>(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, trackingNumber }),
      }),
  },

  /* ─── Admin ─── */
  admin: {
    stats: () => authRequest<AdminStats>('/api/admin/stats'),
  },

  /* ─── Images ─── */
  images: {
    upload: async (
      sareeId: string,
      file: File
    ): Promise<GenericResponse<{ imageUrl: string; totalImages: number }>> => {
      const formData = new FormData();
      formData.append('file', file);
      const auth = authHeaders();

      try {
        const res = await fetch(
          `${API}/api/admin/images/upload?productId=${encodeURIComponent(sareeId)}`,
          { method: 'POST', headers: { ...auth }, body: formData }
        );
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          return {
            success: false,
            data: null as unknown as { imageUrl: string; totalImages: number },
            errors: [
              {
                errorNum: res.status,
                subErrorNum: 0,
                description: err?.error || 'Upload failed',
              },
            ],
          };
        }
        const data = await res.json();
        return { success: true, data };
      } catch {
        return {
          success: false,
          data: null as unknown as { imageUrl: string; totalImages: number },
          errors: [
            {
              errorNum: 0,
              subErrorNum: 0,
              description: 'Network error during upload',
            },
          ],
        };
      }
    },

    uploadMultiple: async (
      sareeId: string,
      files: File[]
    ): Promise<
      GenericResponse<{ imageUrls: string[]; totalImages: number }>
    > => {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      const auth = authHeaders();

      try {
        const res = await fetch(
          `${API}/api/admin/images/upload-multiple?productId=${encodeURIComponent(sareeId)}`,
          { method: 'POST', headers: { ...auth }, body: formData }
        );
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          return {
            success: false,
            data: null as unknown as {
              imageUrls: string[];
              totalImages: number;
            },
            errors: [
              {
                errorNum: res.status,
                subErrorNum: 0,
                description: err?.error || 'Upload failed',
              },
            ],
          };
        }
        const data = await res.json();
        return { success: true, data };
      } catch {
        return {
          success: false,
          data: null as unknown as {
            imageUrls: string[];
            totalImages: number;
          },
          errors: [
            {
              errorNum: 0,
              subErrorNum: 0,
              description: 'Network error during upload',
            },
          ],
        };
      }
    },

    delete: async (
      sareeId: string,
      imageUrl: string
    ): Promise<
      GenericResponse<{ deleted: string; totalImages: number }>
    > => {
      const auth = authHeaders();

      try {
        const res = await fetch(
          `${API}/api/admin/images?productId=${encodeURIComponent(sareeId)}&imageUrl=${encodeURIComponent(imageUrl)}`,
          { method: 'DELETE', headers: { ...auth } }
        );
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          return {
            success: false,
            data: null as unknown as {
              deleted: string;
              totalImages: number;
            },
            errors: [
              {
                errorNum: res.status,
                subErrorNum: 0,
                description: err?.error || 'Delete failed',
              },
            ],
          };
        }
        const data = await res.json();
        return { success: true, data };
      } catch {
        return {
          success: false,
          data: null as unknown as {
            deleted: string;
            totalImages: number;
          },
          errors: [
            {
              errorNum: 0,
              subErrorNum: 0,
              description: 'Network error during delete',
            },
          ],
        };
      }
    },
  },

  /* ─── Videos ─── */
  videos: {
    upload: async (
      productId: string,
      file: File
    ): Promise<GenericResponse<{ videoUrl: string }>> => {
      const formData = new FormData();
      formData.append('file', file);
      const auth = authHeaders();

      try {
        const res = await fetch(
          `${API}/api/admin/videos/upload?productId=${encodeURIComponent(productId)}`,
          { method: 'POST', headers: { ...auth }, body: formData }
        );
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          return {
            success: false,
            data: null as unknown as { videoUrl: string },
            errors: [
              {
                errorNum: res.status,
                subErrorNum: 0,
                description: err?.error || 'Video upload failed',
              },
            ],
          };
        }
        const data = await res.json();
        return { success: true, data };
      } catch {
        return {
          success: false,
          data: null as unknown as { videoUrl: string },
          errors: [
            {
              errorNum: 0,
              subErrorNum: 0,
              description: 'Network error during video upload',
            },
          ],
        };
      }
    },
  },
};
