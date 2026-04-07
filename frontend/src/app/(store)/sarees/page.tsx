'use client';

import { useState, useEffect, useMemo } from 'react';
import SareeCard from '@/components/SareeCard';
import FilterSidebar from '@/components/FilterSidebar';
import { api } from '@/lib/api';
import type { Saree } from '@/lib/types';

export default function SareesPage() {
  const [sarees, setSarees] = useState<Saree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [fabric, setFabric] = useState('');
  const [weave, setWeave] = useState('');
  const [color, setColor] = useState('');
  const [sort, setSort] = useState('');

  const loadSarees = () => {
    setLoading(true);
    setError(false);
    api.sarees.list().then(res => {
      if (res.success && res.data && res.data.length > 0) {
        setSarees(res.data);
      } else {
        setError(true);
      }
    }).catch(() => {
      setError(true);
    }).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    loadSarees();
  }, []);

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
    <div className="min-h-screen">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-10">
          {/* Sidebar */}
          <aside>
            <FilterSidebar
              selectedFabric={fabric}
              selectedWeave={weave}
              selectedColor={color}
              selectedSort={sort}
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

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-cream-deep rounded-lg h-72 mb-3" />
                    <div className="bg-cream-deep rounded h-5 w-3/4 mb-2" />
                    <div className="bg-cream-deep rounded h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="font-display text-xl font-semibold text-bark mb-2">
                  Couldn&apos;t load sarees
                </h3>
                <p className="font-body text-bark-light mb-4">
                  Please check your connection and try again
                </p>
                <button onClick={loadSarees} className="btn-primary">
                  Try Again
                </button>
              </div>
            ) : filtered.length === 0 ? (
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
      </div>
    </div>
  );
}
