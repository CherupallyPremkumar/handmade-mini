'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import SareeCard from '@/components/SareeCard';
import { api } from '@/lib/api';
import type { Saree } from '@/lib/types';

const API = process.env.NEXT_PUBLIC_API_URL || '';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  mobileImageUrl: string;
  linkUrl: string;
  linkText: string;
  textColor: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  filterKey: string;
  filterValue: string;
}

const USP_ITEMS = [
  {
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    title: 'GI Tag Certified',
    description: 'Every saree comes with a Geographical Indication certificate, guaranteeing authentic Pochampally origin.',
  },
  {
    icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
    title: 'Master Weavers',
    description: 'Handwoven by skilled artisans whose families have practiced Ikat for generations. Each saree takes 15-45 days.',
  },
  {
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    title: 'Direct from Weavers',
    description: 'We work directly with weaver cooperatives, ensuring fair wages for artisans and the best prices for you.',
  },
];

export default function HomePage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Saree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeBanner, setActiveBanner] = useState(0);

  const loadAll = useCallback(() => {
    setLoading(true);
    setError(false);

    Promise.all([
      fetch(`${API}/api/cms/banners`).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(`${API}/api/cms/categories/home`).then(r => r.ok ? r.json() : []).catch(() => []),
      api.sarees.list(),
    ]).then(([bannerData, catData, sareeRes]) => {
      setBanners(bannerData);
      setCategories(catData);
      if (sareeRes.success && sareeRes.data?.length > 0) {
        setFeatured(sareeRes.data.slice(0, 4));
      } else {
        setError(true);
      }
    }).catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => setActiveBanner(prev => (prev + 1) % banners.length), 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const currentBanner = banners[activeBanner];

  return (
    <>
      {/* ════════════ HERO BANNER (CMS) ════════════ */}
      {banners.length > 0 ? (
        <section className="relative overflow-hidden min-h-[40vh] sm:min-h-[55vh] flex items-center">
          {/* Banner image */}
          <div className="absolute inset-0 transition-opacity duration-700">
            <img
              src={currentBanner.imageUrl}
              alt={currentBanner.title || 'Banner'}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="max-w-2xl" style={{ color: currentBanner.textColor || '#FFFFFF' }}>
              {currentBanner.title && (
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight animate-fade-in-up">
                  {currentBanner.title}
                </h1>
              )}
              {currentBanner.subtitle && (
                <p className="mt-4 sm:mt-6 font-body text-lg sm:text-xl opacity-80 max-w-lg leading-relaxed animate-fade-in-up stagger-1">
                  {currentBanner.subtitle}
                </p>
              )}
              {currentBanner.linkUrl && (
                <div className="mt-8 animate-fade-in-up stagger-2">
                  <Link href={currentBanner.linkUrl} className="btn-gold">
                    {currentBanner.linkText || 'Shop Now'}
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Banner dots */}
          {banners.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveBanner(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === activeBanner ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        /* Fallback hero if no banners in CMS */
        <section className="relative overflow-hidden bg-bark min-h-[40vh] sm:min-h-[50vh] flex items-center">
          <div className="absolute inset-0">
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: `repeating-linear-gradient(45deg,transparent,transparent 10px,rgba(212,160,23,0.5) 10px,rgba(212,160,23,0.5) 11px),repeating-linear-gradient(-45deg,transparent,transparent 10px,rgba(212,160,23,0.5) 10px,rgba(212,160,23,0.5) 11px)`,
            }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-maroon/20 rounded-full blur-[200px]" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
            <div className="max-w-3xl">
              <h1 className="animate-fade-in-up">
                <span className="block font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-cream leading-[1.1] tracking-tight">Authentic</span>
                <span className="block font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mt-1">
                  <span className="text-gold">Pochampally</span> <span className="text-cream">Ikat</span>
                </span>
                <span className="block font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-cream leading-[1.1] tracking-tight mt-1">Sarees</span>
              </h1>
              <p className="mt-6 font-body text-lg sm:text-xl text-cream/60 max-w-lg animate-fade-in-up stagger-1">
                Handwoven with 400 years of tradition from the master weavers of Pochampally village, Telangana.
              </p>
              <div className="mt-8 flex flex-wrap gap-4 animate-fade-in-up stagger-2">
                <Link href="/sarees" className="btn-gold">Shop Collection</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ════════════ CATEGORIES (CMS) ════════════ */}
      {categories.length > 0 && (
        <section className="py-12 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-14">
              <span className="font-ui text-xs tracking-[0.2em] uppercase text-gold">Browse by</span>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-bark">Shop by Category</h2>
              <div className="gold-divider mt-4" />
            </div>

            <div className={`grid gap-6 ${
              categories.length <= 3 ? 'grid-cols-1 sm:grid-cols-3' :
              categories.length === 4 ? 'grid-cols-2 lg:grid-cols-4' :
              'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
            }`}>
              {categories.map((cat) => {
                const href = cat.filterKey && cat.filterValue
                  ? `/sarees?${cat.filterKey}=${cat.filterValue}`
                  : `/sarees`;
                return (
                  <Link key={cat.id} href={href} className="group text-center">
                    <div className="aspect-square rounded-2xl overflow-hidden bg-cream-warm border border-cream-deep/40 mb-3 transition-transform group-hover:scale-[1.02] group-hover:shadow-lg">
                      {cat.imageUrl ? (
                        <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="font-display text-4xl text-bark-light/20">{cat.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-display text-base font-semibold text-bark group-hover:text-maroon transition-colors">{cat.name}</h3>
                    {cat.description && (
                      <p className="font-body text-xs text-bark-light/60 mt-1 line-clamp-2">{cat.description}</p>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ════════════ FEATURED SAREES ════════════ */}
      <section className="py-16 sm:py-24 ikat-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <span className="font-ui text-xs tracking-[0.2em] uppercase text-gold">Curated Selection</span>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-bark">Featured Sarees</h2>
            <div className="gold-divider mt-4" />
            <p className="mt-4 font-body text-lg text-bark-light max-w-xl mx-auto">
              Hand-picked from our latest collection of exquisite Pochampally weaves
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-cream-deep rounded-lg h-72 mb-3" />
                  <div className="bg-cream-deep rounded h-5 w-3/4 mb-2" />
                  <div className="bg-cream-deep rounded h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="font-body text-bark-light mb-4">Couldn&apos;t load sarees. Please try again.</p>
              <button onClick={loadAll} className="btn-primary">Retry</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((saree) => (
                <div key={saree.id} className="animate-fade-in-up">
                  <SareeCard saree={saree} />
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/sarees" className="btn-outline">
              View All Sarees
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════ WHY US ════════════ */}
      <section className="py-16 sm:py-24 bg-white silk-texture">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <span className="font-ui text-xs tracking-[0.2em] uppercase text-gold">Our Promise</span>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-bark">Why Pochampally?</h2>
            <div className="gold-divider mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {USP_ITEMS.map((item, i) => (
              <div key={item.title} className={`text-center px-4 opacity-0 animate-fade-in-up stagger-${i + 1}`}>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cream-warm text-maroon mb-5 ring-1 ring-gold-pale">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                  </svg>
                </div>
                <h3 className="font-display text-xl font-semibold text-bark mb-3">{item.title}</h3>
                <p className="font-body text-base text-bark-light leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ CTA ════════════ */}
      <section className="py-16 sm:py-20 bg-maroon relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(212,160,23,0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 50%, rgba(212,160,23,0.2) 0%, transparent 50%)`,
          }} />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-cream mb-4">Every Saree Tells a Story</h2>
          <p className="font-body text-lg text-cream/70 mb-8 max-w-xl mx-auto">
            From the hands of master weavers to your wardrobe. Each piece carries the legacy of centuries of craftsmanship.
          </p>
          <Link href="/sarees" className="btn-gold">Explore the Collection</Link>
        </div>
      </section>
    </>
  );
}
