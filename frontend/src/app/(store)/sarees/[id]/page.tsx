import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetail from './ProductDetail';
import { getSareeById } from '@/lib/server-fetch';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://dhanunjaiah.com';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const saree = await getSareeById(id);
  if (!saree) return { title: 'Saree Not Found' };

  const price = (saree.priceInPaisa / 100).toFixed(0);
  const desc =
    saree.description ||
    `Handwoven ${saree.fabric || ''} ${saree.weave || ''} saree`;

  return {
    title: saree.name,
    description: `${desc.substring(0, 155)}. From ₹${price}. Free shipping above ₹999.`,
    alternates: { canonical: `/sarees/${saree.id}` },
    openGraph: {
      title: saree.name,
      description: desc.substring(0, 200),
      type: 'website',
      url: `${SITE}/sarees/${saree.id}`,
      images:
        saree.images?.length > 0
          ? [{ url: saree.images[0], width: 800, height: 1200, alt: saree.name }]
          : [],
    },
  };
}

export default async function SareeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const saree = await getSareeById(id);

  if (!saree) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: saree.name,
    description: saree.description || '',
    image: saree.images || [],
    brand: { '@type': 'Brand', name: 'Dhanunjaiah Handlooms' },
    offers: {
      '@type': 'Offer',
      price: (saree.priceInPaisa / 100).toFixed(2),
      priceCurrency: 'INR',
      availability:
        saree.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      url: `${SITE}/sarees/${saree.id}`,
      seller: { '@type': 'Organization', name: 'Dhanunjaiah Handlooms' },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail saree={saree} />
    </>
  );
}
