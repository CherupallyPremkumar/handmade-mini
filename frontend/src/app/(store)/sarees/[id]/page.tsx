import type { Metadata } from 'next';
import ProductDetail from './ProductDetail';

const API = process.env.NEXT_PUBLIC_API_URL || '';
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://dhanunjaiah.com';

interface ProductData {
  id: string;
  name: string;
  description: string;
  secondaryDescription: string;
  sellingPrice: number;
  mrp: number;
  stock: number;
  images: string[];
  fabric: string;
  weaveType: string;
  bodyColor: string;
  sku: string;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;

  try {
    const res = await fetch(`${API}/api/products/${id}`, { next: { revalidate: 3600 } });
    if (!res.ok) return { title: 'Saree Not Found' };

    const p: ProductData = await res.json();
    const price = (p.sellingPrice / 100).toFixed(0);
    const desc = p.description || p.secondaryDescription || `Handwoven ${p.fabric || ''} ${p.weaveType || ''} saree`;

    return {
      title: p.name,
      description: `${desc.substring(0, 155)}. From ₹${price}. Free shipping above ₹999.`,
      openGraph: {
        title: p.name,
        description: desc.substring(0, 200),
        type: 'website',
        url: `${SITE}/sarees/${p.id}`,
        images: p.images?.length > 0 ? [{ url: p.images[0], width: 800, height: 1200, alt: p.name }] : [],
      },
    };
  } catch {
    return { title: 'Saree | Dhanunjaiah Handlooms' };
  }
}

async function ProductJsonLd({ id }: { id: string }) {
  try {
    const res = await fetch(`${API}/api/products/${id}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const p: ProductData = await res.json();

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.name,
      description: p.description || '',
      image: p.images || [],
      sku: p.sku || '',
      brand: { '@type': 'Brand', name: 'Dhanunjaiah Handlooms' },
      offers: {
        '@type': 'Offer',
        price: (p.sellingPrice / 100).toFixed(2),
        priceCurrency: 'INR',
        availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: `${SITE}/sarees/${p.id}`,
        seller: { '@type': 'Organization', name: 'Dhanunjaiah Handlooms' },
      },
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    );
  } catch {
    return null;
  }
}

export default async function SareeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <ProductJsonLd id={id} />
      <ProductDetail />
    </>
  );
}
