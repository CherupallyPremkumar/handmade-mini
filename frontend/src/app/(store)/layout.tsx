'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isNool = pathname === '/nool';

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      {!isNool && <Footer />}
    </>
  );
}
