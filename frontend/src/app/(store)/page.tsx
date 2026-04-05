'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import SareeCard from '@/components/SareeCard';
import { sampleSarees } from '@/lib/sample-data';
import { api } from '@/lib/api';
import type { Saree } from '@/lib/types';

const WEAVING_TECHNIQUES = [
  {
    name: 'Ikat',
    telugu: '\u0C07\u0C15\u0C4D\u0C15\u0C24\u0C4D',
    description:
      'The resist-dyeing technique where patterns are created by tying and dyeing threads before weaving. Both warp and weft threads can be dyed, creating the distinctive blurred-edge patterns Pochampally is famous for.',
    detail: 'Double Ikat \u2014 where both warp and weft are pre-dyed \u2014 is among the most complex weaving techniques in the world.',
  },
  {
    name: 'Telia Rumal',
    telugu: '\u0C24\u0C47\u0C32\u0C3F\u0C2F \u0C30\u0C41\u0C2E\u0C3E\u0C32\u0C4D',
    description:
      'An ancient technique where cotton threads are treated with oil before dyeing, giving the fabric a distinctive sheen and making the colors extraordinarily vibrant and permanent.',
    detail: 'Traditionally exported to the Arabian Peninsula, these sarees are recognized by UNESCO for their cultural significance.',
  },
  {
    name: 'Mercerized',
    telugu: '\u0C2E\u0C46\u0C30\u0C4D\u0C38\u0C30\u0C48\u0C1C\u0C4D\u0C21\u0C4D',
    description:
      'Cotton threads are treated with sodium hydroxide, giving them a silk-like lustre while retaining the breathability and comfort of cotton. The perfect blend of elegance and practicality.',
    detail: 'The mercerization process also makes the fabric more receptive to dyes, resulting in richer, more vivid colors.',
  },
];

const USP_ITEMS = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'GI Tag Certified',
    description: 'Every saree comes with a Geographical Indication certificate, guaranteeing authentic Pochampally origin and traditional craftsmanship.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
    title: 'Master Weavers',
    description: 'Handwoven by skilled artisans whose families have practiced the art of Ikat for generations. Each saree takes 15\u201345 days to complete.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Direct from Weavers',
    description: 'We work directly with weaver cooperatives in Pochampally village, ensuring fair wages for artisans and the best prices for you.',
  },
];

export default function HomePage() {
  const [featured, setFeatured] = useState<Saree[]>(sampleSarees.slice(0, 4));

  useEffect(() => {
    api.sarees.list().then(res => {
      if (res.success && res.data && res.data.length > 0) {
        setFeatured(res.data.slice(0, 4));
      }
    }).catch(() => {});
  }, []);

  return (
    <>
      {/* ════════════ HERO ════════════ */}
      <section className="relative overflow-hidden bg-bark min-h-[55vh] flex items-center">
        {/* Background texture layers */}
        <div className="absolute inset-0">
          {/* Diagonal silk weave pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(212,160,23,0.5) 10px,
                rgba(212,160,23,0.5) 11px
              ), repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 10px,
                rgba(212,160,23,0.5) 10px,
                rgba(212,160,23,0.5) 11px
              )`,
            }}
          />
          {/* Radial glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-maroon/20 rounded-full blur-[200px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gold/10 rounded-full blur-[150px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-3xl">
            {/* Overline */}
            <div className="flex items-center gap-3 mb-6 opacity-0 animate-fade-in-up">
              <div className="w-10 h-px bg-gold" />
              <span className="font-ui text-xs tracking-[0.25em] uppercase text-gold">
                Since 1600 AD &middot; Telangana
              </span>
            </div>

            {/* Heading */}
            <h1 className="opacity-0 animate-fade-in-up stagger-1">
              <span className="block font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-cream leading-[1.1] tracking-tight">
                Authentic
              </span>
              <span className="block font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mt-1">
                <span className="text-gold">Pochampally</span>{' '}
                <span className="text-cream">Ikat</span>
              </span>
              <span className="block font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-cream leading-[1.1] tracking-tight mt-1">
                Sarees
              </span>
            </h1>

            {/* Tagline */}
            <p className="mt-6 sm:mt-8 font-body text-lg sm:text-xl text-cream/60 max-w-lg leading-relaxed opacity-0 animate-fade-in-up stagger-2">
              Handwoven with 400 years of tradition from the master weavers of
              Pochampally village, Telangana. Each saree is a work of art.
            </p>

            {/* CTA */}
            <div className="mt-8 sm:mt-10 flex flex-wrap gap-4 opacity-0 animate-fade-in-up stagger-3">
              <Link href="/sarees" className="btn-gold">
                Shop Collection
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link href="/sarees?fabric=SILK" className="btn-outline border-cream/30 text-cream hover:bg-cream hover:text-bark">
                Pure Silk
              </Link>
            </div>

            {/* Trust signals */}
            <div className="mt-12 sm:mt-16 flex flex-wrap items-center gap-6 sm:gap-10 opacity-0 animate-fade-in-up stagger-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gold" />
                <span className="font-ui text-xs tracking-wider uppercase text-cream/40">
                  GI Tag Certified
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gold" />
                <span className="font-ui text-xs tracking-wider uppercase text-cream/40">
                  Free Shipping Above ₹999
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gold" />
                <span className="font-ui text-xs tracking-wider uppercase text-cream/40">
                  Secure Payments
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative right panel - desktop only */}
        <div className="hidden xl:block absolute right-0 top-0 bottom-0 w-[420px]">
          <div className="absolute inset-0 opacity-30">
            {/* Abstract geometric ikat pattern */}
            <div className="absolute top-[15%] right-[10%] w-48 h-48 border border-gold/20 rotate-45" />
            <div className="absolute top-[20%] right-[15%] w-36 h-36 border border-gold/15 rotate-45" />
            <div className="absolute bottom-[20%] right-[5%] w-56 h-56 border border-maroon-light/20 rotate-12" />
            <div className="absolute top-[50%] right-[25%] w-3 h-3 bg-gold/40 rotate-45" />
            <div className="absolute top-[40%] right-[8%] w-3 h-3 bg-gold/30 rotate-45" />
            <div className="absolute top-[65%] right-[20%] w-2 h-2 bg-gold/25 rotate-45" />
          </div>
        </div>
      </section>

      {/* ════════════ FEATURED SAREES ════════════ */}
      <section className="py-16 sm:py-24 ikat-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-12 sm:mb-16">
            <span className="font-ui text-xs tracking-[0.2em] uppercase text-gold">
              Curated Selection
            </span>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-bark">
              Featured Sarees
            </h2>
            <div className="gold-divider mt-4" />
            <p className="mt-4 font-body text-lg text-bark-light max-w-xl mx-auto">
              Hand-picked from our latest collection of exquisite Pochampally
              weaves
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((saree, i) => (
              <div
                key={saree.id}
                className={`opacity-0 animate-fade-in-up stagger-${i + 1}`}
              >
                <SareeCard saree={saree} />
              </div>
            ))}
          </div>

          {/* CTA */}
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

      {/* ════════════ WHY POCHAMPALLY ════════════ */}
      <section className="py-16 sm:py-24 bg-white silk-texture">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <span className="font-ui text-xs tracking-[0.2em] uppercase text-gold">
              Our Promise
            </span>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-bark">
              Why Pochampally?
            </h2>
            <div className="gold-divider mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {USP_ITEMS.map((item, i) => (
              <div
                key={item.title}
                className={`text-center px-4 opacity-0 animate-fade-in-up stagger-${i + 1}`}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cream-warm text-maroon mb-5 ring-1 ring-gold-pale">
                  {item.icon}
                </div>
                <h3 className="font-display text-xl font-semibold text-bark mb-3">
                  {item.title}
                </h3>
                <p className="font-body text-base text-bark-light leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ WEAVING TECHNIQUES ════════════ */}
      <section className="py-16 sm:py-24 bg-bark text-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <span className="font-ui text-xs tracking-[0.2em] uppercase text-gold">
              The Art of Pochampally
            </span>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-cream">
              Our Weaving Techniques
            </h2>
            <div className="gold-divider mt-4" />
          </div>

          <div className="space-y-12 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-8 lg:gap-12">
            {WEAVING_TECHNIQUES.map((tech, i) => (
              <div
                key={tech.name}
                className={`relative p-6 sm:p-8 border border-cream/10 bg-cream/[0.03] opacity-0 animate-fade-in-up stagger-${i + 1}`}
              >
                {/* Number accent */}
                <span className="font-display text-6xl font-bold text-gold/10 absolute top-3 right-5 leading-none">
                  {String(i + 1).padStart(2, '0')}
                </span>

                <p className="font-body text-sm text-gold/70 italic mb-1">
                  {tech.telugu}
                </p>
                <h3 className="font-display text-2xl font-bold text-gold mb-4">
                  {tech.name}
                </h3>
                <p className="font-body text-base text-cream/70 leading-relaxed mb-4">
                  {tech.description}
                </p>
                <p className="font-ui text-xs text-cream/40 leading-relaxed border-t border-cream/10 pt-4">
                  {tech.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ CTA BANNER ════════════ */}
      <section className="py-16 sm:py-20 bg-maroon relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(212,160,23,0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 50%, rgba(212,160,23,0.2) 0%, transparent 50%)`,
            }}
          />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-cream mb-4">
            Every Saree Tells a Story
          </h2>
          <p className="font-body text-lg text-cream/70 mb-8 max-w-xl mx-auto">
            From the hands of master weavers to your wardrobe. Each piece
            carries the legacy of centuries of craftsmanship.
          </p>
          <Link href="/sarees" className="btn-gold">
            Explore the Collection
          </Link>
        </div>
      </section>
    </>
  );
}
