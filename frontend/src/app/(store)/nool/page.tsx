'use client';

import Link from 'next/link';
import NoolFeed from '@/components/NoolFeed';
import { sampleNool } from '@/lib/nool-data';

const activeNool = sampleNool.filter((d) => d.isActive);

export default function NoolPage() {
  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Desktop: phone-shaped container. Mobile: full screen */}
      <div className="h-full w-full flex items-center justify-center">
        {/* Phone frame wrapper — max-w on desktop, full on mobile */}
        <div className="relative h-full w-full md:max-w-[430px] md:max-h-[932px] md:rounded-[2rem] md:overflow-hidden md:border-2 md:border-white/10 md:shadow-2xl md:shadow-black/50">
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-4 pt-3 pb-2">
            <Link
              href="/"
              className="flex items-center gap-2 group"
            >
              <div className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center border border-white/10 transition-all group-hover:bg-black/50">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </div>
            </Link>

            <h1 className="font-display text-lg font-bold text-white drop-shadow-lg tracking-wide">
              Nool
            </h1>

            {/* Spacer for centering */}
            <div className="w-8" />
          </div>

          {/* Feed */}
          <NoolFeed initialNool={activeNool} />
        </div>
      </div>

      {/* Desktop dark surround hint */}
      <div className="hidden md:block absolute top-6 left-6 z-50">
        <Link
          href="/"
          className="flex items-center gap-2 font-ui text-sm text-white/40 hover:text-white/70 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
          Back to store
        </Link>
      </div>

      {/* Desktop keyboard hints */}
      <div className="hidden md:flex absolute bottom-6 left-6 z-50 flex-col gap-1">
        <p className="font-ui text-[11px] text-white/25">
          Scroll or arrow keys to navigate
        </p>
      </div>
    </div>
  );
}
