import type { Metadata } from 'next';
import SareesContent from './SareesContent';
import { getAllSarees } from '@/lib/server-fetch';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'All Sarees',
  description:
    'Browse our complete collection of authentic handwoven Pochampally Ikat sarees. Pure silk, cotton, and silk-cotton blends from master weavers of Telangana.',
  alternates: { canonical: '/sarees' },
};

export default async function SareesPage() {
  const sarees = await getAllSarees();
  const activeSarees = sarees.filter((s) => s.active);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* SEO H1 — visible to crawlers */}
        <header className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-bark">
            Authentic Pochampally Ikat Sarees
          </h1>
          <p className="mt-3 font-body text-bark-light max-w-2xl">
            Browse {activeSarees.length} handwoven{' '}
            {activeSarees.length === 1 ? 'saree' : 'sarees'} crafted by master weavers from Telangana.
            Pure silk, cotton, and silk-cotton blends with GI tag certification.
          </p>
        </header>

        <SareesContent initialSarees={activeSarees} />
      </div>
    </div>
  );
}
