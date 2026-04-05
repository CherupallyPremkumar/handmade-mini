'use client';

import { useState } from 'react';

interface FilterSidebarProps {
  selectedFabric: string;
  selectedWeave: string;
  selectedColor: string;
  selectedSort: string;
  onFabricChange: (fabric: string) => void;
  onWeaveChange: (weave: string) => void;
  onColorChange: (color: string) => void;
  onSortChange: (sort: string) => void;
  onClearAll: () => void;
}

const FABRICS = [
  { value: '', label: 'All Fabrics' },
  { value: 'SILK', label: 'Pure Silk' },
  { value: 'COTTON', label: 'Handloom Cotton' },
  { value: 'SILK_COTTON', label: 'Silk Cotton Blend' },
];

const WEAVES = [
  { value: '', label: 'All Weaves' },
  { value: 'IKAT', label: 'Ikat' },
  { value: 'TELIA_RUMAL', label: 'Telia Rumal' },
  { value: 'MERCERIZED', label: 'Mercerized' },
];

const COLORS = [
  { value: '', label: 'All Colors' },
  { value: 'Magenta', label: 'Magenta' },
  { value: 'Indigo', label: 'Indigo' },
  { value: 'Green', label: 'Green' },
  { value: 'Coral', label: 'Coral' },
  { value: 'Blue', label: 'Blue' },
  { value: 'Yellow', label: 'Yellow' },
  { value: 'Maroon', label: 'Maroon' },
  { value: 'Ivory', label: 'Ivory' },
];

const SORT_OPTIONS = [
  { value: '', label: 'Recommended' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
];

const COLOR_SWATCHES: Record<string, string> = {
  Magenta: '#c2185b',
  Indigo: '#283593',
  Green: '#2e7d32',
  Coral: '#e57373',
  Blue: '#1a237e',
  Yellow: '#f9a825',
  Maroon: '#8B1A1A',
  Ivory: '#fdf5e6',
};

export default function FilterSidebar({
  selectedFabric,
  selectedWeave,
  selectedColor,
  selectedSort,
  onFabricChange,
  onWeaveChange,
  onColorChange,
  onSortChange,
  onClearAll,
}: FilterSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const hasFilters = selectedFabric || selectedWeave || selectedColor;

  const filterContent = (
    <>
      {/* Sort (mobile only shows in sidebar) */}
      <div className="mb-8">
        <h4 className="font-ui text-xs font-semibold tracking-[0.14em] uppercase text-bark mb-3">
          Sort By
        </h4>
        <div className="space-y-1.5">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSortChange(opt.value)}
              className={`
                block w-full text-left px-3 py-2 font-ui text-sm transition-colors
                ${
                  selectedSort === opt.value
                    ? 'bg-maroon/5 text-maroon font-medium'
                    : 'text-bark-light hover:text-bark hover:bg-cream-warm'
                }
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Fabric */}
      <div className="mb-8">
        <h4 className="font-ui text-xs font-semibold tracking-[0.14em] uppercase text-bark mb-3">
          Fabric
        </h4>
        <div className="space-y-1.5">
          {FABRICS.map((f) => (
            <button
              key={f.value}
              onClick={() => onFabricChange(f.value)}
              className={`
                block w-full text-left px-3 py-2 font-ui text-sm transition-colors
                ${
                  selectedFabric === f.value
                    ? 'bg-maroon/5 text-maroon font-medium'
                    : 'text-bark-light hover:text-bark hover:bg-cream-warm'
                }
              `}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Weave */}
      <div className="mb-8">
        <h4 className="font-ui text-xs font-semibold tracking-[0.14em] uppercase text-bark mb-3">
          Weave Technique
        </h4>
        <div className="space-y-1.5">
          {WEAVES.map((w) => (
            <button
              key={w.value}
              onClick={() => onWeaveChange(w.value)}
              className={`
                block w-full text-left px-3 py-2 font-ui text-sm transition-colors
                ${
                  selectedWeave === w.value
                    ? 'bg-maroon/5 text-maroon font-medium'
                    : 'text-bark-light hover:text-bark hover:bg-cream-warm'
                }
              `}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div className="mb-8">
        <h4 className="font-ui text-xs font-semibold tracking-[0.14em] uppercase text-bark mb-3">
          Color
        </h4>
        <div className="flex flex-wrap gap-2">
          {COLORS.filter((c) => c.value).map((c) => (
            <button
              key={c.value}
              onClick={() =>
                onColorChange(selectedColor === c.value ? '' : c.value)
              }
              title={c.label}
              className={`
                w-8 h-8 rounded-full border-2 transition-all
                ${
                  selectedColor === c.value
                    ? 'border-maroon scale-110 ring-2 ring-maroon/20'
                    : 'border-cream-deep hover:border-bark-light/40'
                }
              `}
              style={{ backgroundColor: COLOR_SWATCHES[c.value] || '#ccc' }}
            />
          ))}
        </div>
      </div>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={onClearAll}
          className="font-ui text-sm text-maroon hover:text-maroon-deep underline underline-offset-2"
        >
          Clear all filters
        </button>
      )}
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="btn-outline w-full flex items-center justify-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filters & Sort
          {hasFilters && (
            <span className="inline-flex items-center justify-center w-5 h-5 bg-maroon text-cream text-xs rounded-full">
              !
            </span>
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-bark/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative ml-auto w-80 max-w-[85vw] bg-cream h-full overflow-y-auto p-6 animate-slide-in-left">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-semibold text-bark">
                Filters
              </h3>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 hover:bg-cream-warm rounded"
              >
                <svg
                  className="w-6 h-6 text-bark"
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
            </div>
            {filterContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block">{filterContent}</div>
    </>
  );
}
