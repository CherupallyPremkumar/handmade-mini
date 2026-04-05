import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-bark text-cream/80 mt-auto">
      {/* Gold accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="font-display text-xl font-semibold text-gold mb-3">
              Dhanunjaiah Handlooms
            </h3>
            <p className="font-body text-sm text-cream/60 leading-relaxed max-w-xs">
              Authentic handwoven sarees directly from the weavers of
              Pochampally, Telangana. Preserving 400 years of Ikat tradition.
            </p>
            <div className="flex items-center gap-1.5 mt-4">
              <div className="w-6 h-px bg-gold/40" />
              <span className="font-ui text-[10px] tracking-[0.2em] uppercase text-gold/70">
                GI Tag Certified
              </span>
              <div className="w-6 h-px bg-gold/40" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-ui text-xs font-semibold tracking-[0.14em] uppercase text-cream/40 mb-4">
              Shop
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/sarees"
                  className="font-ui text-sm text-cream/60 hover:text-gold transition-colors"
                >
                  All Sarees
                </Link>
              </li>
              <li>
                <Link
                  href="/sarees?weave=IKAT"
                  className="font-ui text-sm text-cream/60 hover:text-gold transition-colors"
                >
                  Ikat Collection
                </Link>
              </li>
              <li>
                <Link
                  href="/sarees?weave=TELIA_RUMAL"
                  className="font-ui text-sm text-cream/60 hover:text-gold transition-colors"
                >
                  Telia Rumal
                </Link>
              </li>
              <li>
                <Link
                  href="/sarees?fabric=SILK"
                  className="font-ui text-sm text-cream/60 hover:text-gold transition-colors"
                >
                  Pure Silk
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-ui text-xs font-semibold tracking-[0.14em] uppercase text-cream/40 mb-4">
              Help
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/track"
                  className="font-ui text-sm text-cream/60 hover:text-gold transition-colors"
                >
                  Track Order
                </Link>
              </li>
              <li>
                <span className="font-ui text-sm text-cream/60">
                  Shipping & Returns
                </span>
              </li>
              <li>
                <span className="font-ui text-sm text-cream/60">
                  Care Instructions
                </span>
              </li>
              <li>
                <span className="font-ui text-sm text-cream/60">FAQs</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-ui text-xs font-semibold tracking-[0.14em] uppercase text-cream/40 mb-4">
              Contact
            </h4>
            <ul className="space-y-2.5">
              <li className="font-ui text-sm text-cream/60">
                Pochampally Village, Yadadri Bhuvanagiri
              </li>
              <li className="font-ui text-sm text-cream/60">
                Telangana 508284
              </li>
              <li>
                <a
                  href="tel:+919876543210"
                  className="font-ui text-sm text-cream/60 hover:text-gold transition-colors"
                >
                  +91 98765 43210
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@pochampallyhandlooms.in"
                  className="font-ui text-sm text-cream/60 hover:text-gold transition-colors"
                >
                  hello@pochampallyhandlooms.in
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="font-ui text-xs text-cream/40">
              &copy; {new Date().getFullYear()} Dhanunjaiah Handlooms. All
              rights reserved.
            </p>
            <p className="font-ui text-xs text-cream/30">
              GST: 36XXXXX1234X1ZX &middot; HSN: 50079090
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
