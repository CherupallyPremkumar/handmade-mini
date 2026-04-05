'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/lib/cart-store';
import { useAuthStore } from '@/lib/auth-store';
import { useState, useEffect } from 'react';

export default function Header() {
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.itemCount());
  const { isLoggedIn, isAdmin, user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Hydration safety for cart count and auth state
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isHome = pathname === '/';

  return (
    <>
      <header
        className={`
          sticky top-0 z-50 transition-all duration-300
          ${
            scrolled || !isHome
              ? 'bg-cream/95 backdrop-blur-md shadow-sm border-b border-gold-pale/50'
              : 'bg-transparent'
          }
        `}
      >
        {/* Top accent bar */}
        <div className="h-0.5 bg-gradient-to-r from-maroon via-gold to-maroon" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10">
                <div
                  className="absolute inset-0 rounded-full border-2 border-gold group-hover:border-maroon transition-colors duration-300"
                  style={{
                    background:
                      'conic-gradient(from 180deg, var(--maroon), var(--gold), var(--maroon))',
                    mask: 'radial-gradient(circle, transparent 55%, black 56%)',
                    WebkitMask:
                      'radial-gradient(circle, transparent 55%, black 56%)',
                  }}
                />
                <span className="absolute inset-0 flex items-center justify-center font-display text-sm sm:text-base font-bold text-maroon">
                  D
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="font-display text-lg font-semibold text-bark leading-none tracking-tight">
                  Dhanunjaiah
                </p>
                <p className="font-ui text-[10px] tracking-[0.2em] uppercase text-gold mt-0.5">
                  Handlooms
                </p>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/"
                className={`
                  font-ui text-sm tracking-wide transition-colors duration-200
                  ${pathname === '/' ? 'text-maroon font-medium' : 'text-bark-light hover:text-maroon'}
                `}
              >
                Home
              </Link>
              <Link
                href="/sarees"
                className={`
                  font-ui text-sm tracking-wide transition-colors duration-200
                  ${pathname.startsWith('/sarees') ? 'text-maroon font-medium' : 'text-bark-light hover:text-maroon'}
                `}
              >
                Collection
              </Link>
              <Link
                href="/track"
                className={`
                  font-ui text-sm tracking-wide transition-colors duration-200
                  ${pathname === '/track' ? 'text-maroon font-medium' : 'text-bark-light hover:text-maroon'}
                `}
              >
                Track Order
              </Link>
              <Link
                href="/nool"
                className={`
                  font-ui text-sm tracking-wide transition-colors duration-200 flex items-center gap-1.5
                  ${pathname === '/nool' ? 'text-maroon font-medium' : 'text-bark-light hover:text-maroon'}
                `}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Nool
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Auth links (desktop) */}
              {mounted && (
                <div className="hidden md:flex items-center gap-3">
                  {isLoggedIn ? (
                    <>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="font-ui text-sm text-gold font-medium hover:text-maroon transition-colors flex items-center gap-1"
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
                              strokeWidth={1.5}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          Admin
                        </Link>
                      )}
                      <span className="font-ui text-sm text-bark-light/60">
                        {user?.name}
                      </span>
                      <button
                        onClick={logout}
                        className="font-ui text-sm text-bark-light hover:text-maroon transition-colors"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="font-ui text-sm text-bark-light hover:text-maroon transition-colors flex items-center gap-1.5"
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
                          strokeWidth={1.5}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Login
                    </Link>
                  )}
                </div>
              )}

              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2 group"
                aria-label="Cart"
              >
                <svg
                  className="w-6 h-6 text-bark group-hover:text-maroon transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                {mounted && itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center bg-maroon text-cream font-ui text-[10px] font-bold rounded-full">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2"
                aria-label="Menu"
              >
                <svg
                  className="w-6 h-6 text-bark"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 pt-[4.5rem]">
          <div
            className="absolute inset-0 bg-bark/30"
            onClick={() => setMobileMenuOpen(false)}
          />
          <nav className="relative bg-cream border-b border-gold-pale/50 shadow-lg animate-fade-in">
            <div className="px-6 py-4 space-y-1">
              <Link
                href="/"
                className="block py-3 font-ui text-base text-bark hover:text-maroon transition-colors border-b border-cream-deep/40"
              >
                Home
              </Link>
              <Link
                href="/sarees"
                className="block py-3 font-ui text-base text-bark hover:text-maroon transition-colors border-b border-cream-deep/40"
              >
                Collection
              </Link>
              <Link
                href="/track"
                className="block py-3 font-ui text-base text-bark hover:text-maroon transition-colors border-b border-cream-deep/40"
              >
                Track Order
              </Link>
              <Link
                href="/nool"
                className="flex items-center gap-2 py-3 font-ui text-base text-bark hover:text-maroon transition-colors border-b border-cream-deep/40"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Nool
              </Link>
              <Link
                href="/cart"
                className="block py-3 font-ui text-base text-bark hover:text-maroon transition-colors border-b border-cream-deep/40"
              >
                Cart
                {mounted && itemCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-maroon text-cream text-xs font-bold rounded-full">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Auth links in mobile menu */}
              {mounted && (
                <>
                  {isLoggedIn ? (
                    <>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 py-3 font-ui text-base text-gold font-medium hover:text-maroon transition-colors border-b border-cream-deep/40"
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
                              strokeWidth={1.5}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          Admin Panel
                        </Link>
                      )}
                      <div className="py-3 border-b border-cream-deep/40">
                        <p className="font-ui text-sm text-bark-light/60 mb-1">
                          Signed in as
                        </p>
                        <p className="font-ui text-base font-medium text-bark">
                          {user?.name}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}
                        className="block w-full text-left py-3 font-ui text-base text-maroon hover:text-maroon-deep transition-colors"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="flex items-center gap-2 py-3 font-ui text-base text-bark hover:text-maroon transition-colors"
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
                          strokeWidth={1.5}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Login / Register
                    </Link>
                  )}
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
