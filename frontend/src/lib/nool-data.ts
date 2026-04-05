export interface Nool {
  id: string;
  title: string;
  description: string;
  videoUrl: string | null;
  thumbnailGradient: string;
  linkedSareeId: string | null;
  linkedSareeName: string | null;
  linkedSareePrice: number | null;
  duration: number;
  views: number;
  likes: number;
  isActive: boolean;
  createdAt: string;
}

/**
 * Mock nool data for frontend development.
 * In production, videoUrl will point to Cloudflare R2 CDN URLs.
 * thumbnailGradient is used as a placeholder when no video/thumbnail exists.
 */
export const sampleNool: Nool[] = [
  {
    id: 'nool-001',
    title: 'Watch the Ikat magic unfold',
    description:
      'See how the resist-dyeing technique creates mesmerizing geometric patterns on pure silk. Each thread is hand-tied before dyeing to create these perfect mirror images.',
    videoUrl: '/sarees/weaving-loom.mp4',
    thumbnailGradient:
      'linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #533483 100%)',
    linkedSareeId: 'saree-005',
    linkedSareeName: 'Midnight Blue Double Ikat',
    linkedSareePrice: 1500000,
    duration: 28,
    views: 12400,
    likes: 1840,
    isActive: true,
    createdAt: '2026-03-25T10:00:00Z',
  },
  {
    id: 'nool-002',
    title: 'Telia Rumal — 400 years of tradition',
    description:
      'The ancient Telia Rumal technique uses oil-treated threads to create a fabric with unmatched lustre and nool. Watch the centuries-old process come alive.',
    videoUrl: '/sarees/fabric-texture.mp4',
    thumbnailGradient:
      'linear-gradient(135deg, #4a0e0e 0%, #8B1A1A 35%, #a52a2a 65%, #D4A017 100%)',
    linkedSareeId: 'saree-007',
    linkedSareeName: 'Maroon Telia Rumal Silk',
    linkedSareePrice: 920000,
    duration: 30,
    views: 8920,
    likes: 1350,
    isActive: true,
    createdAt: '2026-03-28T10:00:00Z',
  },
  {
    id: 'nool-003',
    title: 'How our weavers create double ikat',
    description:
      'A rare glimpse into the most complex weaving technique in the world. Both warp and weft threads are resist-dyed before weaving — a skill mastered by only a handful of artisans.',
    videoUrl: null,
    thumbnailGradient:
      'linear-gradient(135deg, #2d1b00 0%, #5c4033 30%, #8B6914 60%, #c49b30 100%)',
    linkedSareeId: null,
    linkedSareeName: null,
    linkedSareePrice: null,
    duration: 30,
    views: 21300,
    likes: 3200,
    isActive: true,
    createdAt: '2026-03-30T10:00:00Z',
  },
  {
    id: 'nool-004',
    title: 'Silk vs Cotton — feel the difference',
    description:
      'Our master weaver shows the distinct nool, texture, and sheen of pure silk versus handloom cotton Pochampally sarees. Which one suits your style?',
    videoUrl: null,
    thumbnailGradient:
      'linear-gradient(135deg, #0d7377 0%, #14a3a8 30%, #44c8ab 60%, #e8c547 100%)',
    linkedSareeId: 'saree-004',
    linkedSareeName: 'Coral Mercerized Cotton',
    linkedSareePrice: 280000,
    duration: 24,
    views: 6700,
    likes: 890,
    isActive: true,
    createdAt: '2026-04-01T10:00:00Z',
  },
  {
    id: 'nool-005',
    title: 'Festival collection 2026 preview',
    description:
      'First look at our exclusive festival collection — turmeric yellows, auspicious magentas, and bridal ivories woven with gold zari. Pre-order now.',
    videoUrl: null,
    thumbnailGradient:
      'linear-gradient(135deg, #6B1010 0%, #8B1A1A 25%, #D4A017 50%, #E8C547 75%, #FFF8F0 100%)',
    linkedSareeId: 'saree-006',
    linkedSareeName: 'Turmeric Yellow Silk',
    linkedSareePrice: 780000,
    duration: 26,
    views: 15800,
    likes: 2650,
    isActive: true,
    createdAt: '2026-04-02T10:00:00Z',
  },
  {
    id: 'nool-006',
    title: 'Behind the loom — meet our artisan',
    description:
      'Meet Ramaiah, a third-generation Pochampally weaver who has spent 40 years perfecting the art of ikat. His hands tell the story of a 400-year-old tradition.',
    videoUrl: null,
    thumbnailGradient:
      'linear-gradient(135deg, #1a0a00 0%, #3D2B1F 30%, #6b4226 55%, #a0522d 80%, #d2691e 100%)',
    linkedSareeId: null,
    linkedSareeName: null,
    linkedSareePrice: null,
    duration: 30,
    views: 19600,
    likes: 4100,
    isActive: true,
    createdAt: '2026-04-03T10:00:00Z',
  },
];
