import HomeContent from './HomeContent';
import { getBanners, getCategories, getAllSarees } from '@/lib/server-fetch';

export const revalidate = 60; // ISR: rebuild every 60s

export default async function HomePage() {
  const [bannerData, categories, allSarees] = await Promise.all([
    getBanners(),
    getCategories(),
    getAllSarees(),
  ]);

  const featured = allSarees.filter((s) => s.active).slice(0, 4);

  return (
    <HomeContent
      banners={bannerData.banners}
      scrollSeconds={bannerData.scrollSeconds}
      categories={categories}
      featured={featured}
    />
  );
}
