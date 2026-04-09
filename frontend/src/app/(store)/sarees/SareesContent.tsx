'use client';

import { Suspense, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import SareeCard from '@/components/SareeCard';
import FilterSidebar from '@/components/FilterSidebar';
import type { Saree } from '@/lib/types';

interface SareesContentProps {
  initialSarees: Saree[];
}

export default function SareesContent({ initialSarees }: SareesContentProps) {
  return (
    <Suspense fallback={null}>
      <SareesInner initialSarees={initialSarees} />
    </Suspense>
  );
}

function SareesInner({ initialSarees }: SareesContentProps) {
  const searchParams = useSearchParams();
  const sarees = initialSarees;
  const [fabric, setFabric] = useState(searchParams.get('fabric') || '');
  const [weave, setWeave] = useState(searchParams.get('weaveType') || searchParams.get('weave') || '');
  const [color, setColor] = useState(searchParams.get('color') || '');
  const [sort, setSort] = useState('');

  const availableColors = useMemo(() => {
    const colors = sarees.filter((s) => s.active && s.color).map((s) => s.color);
    return [...new Set(colors)].sort();
  }, [sarees]);

  const filtered = useMemo(() => {
    let result = sarees.filter((s) => s.active);

    if (fabric) result = result.filter((s) => s.fabric === fabric);
    if (weave) result = result.filter((s) => s.weave === weave);
    if (color) result = result.filter((s) => s.color === color);

    switch (sort) {
      case 'price_asc':
        result = [...result].sort((a, b) => a.priceInPaisa - b.priceInPaisa);
        break;
      case 'price_desc':
        result = [...result].sort((a, b) => b.priceInPaisa - a.priceInPaisa);
        break;
      case 'newest':
        result = [...result].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'popular':
        // In production this would use view/sales data
        break;
    }

    return result;
  }, [sarees, fabric, weave, color, sort]);

  function clearAll() {
    setFabric('');
    setWeave('');
    setColor('');
    setSort('');
  }

  return (
    <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-10">
          {/* Sidebar */}
          <aside>
            <FilterSidebar
              selectedFabric={fabric}
              selectedWeave={weave}
              selectedColor={color}
              selectedSort={sort}
              availableColors={availableColors}
              onFabricChange={setFabric}
              onWeaveChange={setWeave}
              onColorChange={setColor}
              onSortChange={setSort}
              onClearAll={clearAll}
            />
          </aside>

          {/* Grid */}
          <div>
            {/* Results count + desktop sort */}
            <div className="flex items-center justify-between mb-6">
              <p className="font-ui text-sm text-bark-light">
                {filtered.length} saree{filtered.length !== 1 ? 's' : ''}
              </p>

              <div className="hidden lg:flex items-center gap-2">
                <label className="font-ui text-xs text-bark-light">
                  Sort:
                </label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="input-field !w-auto !py-1.5 !px-3 !text-xs"
                >
                  <option value="">Recommended</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cream-warm mb-4">
                  <svg
                    className="w-8 h-8 text-bark-light/40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-display text-xl font-semibold text-bark mb-2">
                  No sarees found
                </h3>
                <p className="font-body text-bark-light mb-4">
                  Try adjusting your filters to find what you&apos;re looking
                  for
                </p>
                <button onClick={clearAll} className="btn-outline">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((saree) => (
                  <div key={saree.id} className="animate-fade-in-up">
                    <SareeCard saree={saree} />
                  </div>
                ))}
              </div>
            )}
          </div>
    </div>
  );
}
