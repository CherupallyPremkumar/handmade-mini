import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Dhanunjaiah Handlooms \u2014 Authentic Ikat Sarees',
    template: '%s | Dhanunjaiah Handlooms',
  },
  description:
    'Authentic handwoven Pochampally Ikat sarees directly from master weavers of Telangana. GI Tag certified. Pure silk, cotton, and silk-cotton blends with 400 years of tradition.',
  keywords: [
    'Pochampally sarees',
    'Ikat sarees',
    'handwoven sarees',
    'Telangana sarees',
    'silk sarees',
    'Telia Rumal',
    'GI Tag sarees',
  ],
  openGraph: {
    title: 'Dhanunjaiah Handlooms \u2014 Authentic Ikat Sarees',
    description:
      'Handwoven with 400 years of tradition from Telangana. Shop GI Tag certified Pochampally Ikat sarees.',
    type: 'website',
    locale: 'en_IN',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
