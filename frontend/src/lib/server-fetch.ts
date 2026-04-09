import type { Saree } from './types';

const API = process.env.NEXT_PUBLIC_API_URL || '';

export interface ServerBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  mobileImageUrl: string;
  linkUrl: string;
  linkText: string;
  textColor: string;
}

export interface ServerCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  filterKey: string;
  filterValue: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProduct(p: any): Saree {
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

export async function getBanners(): Promise<{ banners: ServerBanner[]; scrollSeconds: number }> {
  try {
    const res = await fetch(`${API}/api/cms/banners`, { next: { revalidate: 300 } });
    if (!res.ok) return { banners: [], scrollSeconds: 5 };
    return await res.json();
  } catch {
    return { banners: [], scrollSeconds: 5 };
  }
}

export async function getCategories(): Promise<ServerCategory[]> {
  try {
    const res = await fetch(`${API}/api/cms/categories`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getAllSarees(): Promise<Saree[]> {
  try {
    const res = await fetch(`${API}/api/products`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data.map(mapProduct) : [];
  } catch {
    return [];
  }
}

export async function getSareeById(id: string): Promise<Saree | null> {
  try {
    const res = await fetch(`${API}/api/products/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const p = await res.json();
    return mapProduct(p);
  } catch {
    return null;
  }
}
