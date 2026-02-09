'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

const DEFAULT_BANNERS = [
  { image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=1000&auto=format&fit=crop', title: 'YENİ SEZON', buttonText: 'ALIŞVERİŞE BAŞLA', buttonLink: '/' },
  { image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1000&auto=format&fit=crop', title: 'AKSESUARLAR', buttonText: 'GÖZ AT', buttonLink: '/?category=Aksesuar' }
];

function HomeContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [heroBanners, setHeroBanners] = useState(DEFAULT_BANNERS);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get('category') || '';

  const filteredProducts = categoryFilter
    ? products.filter(p => p.category?.toLowerCase() === categoryFilter.toLowerCase())
    : products;

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/site-config').then(r => r.json())
    ]).then(([productsData, siteData]) => {
      setProducts(productsData);
      if (siteData.hero_banners?.length) setHeroBanners(siteData.hero_banners);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Yükleniyor...</div>;

  return (
    <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* Hero Section */}
      <div className="pt-8 pb-12 px-6">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {heroBanners.map((banner, i) => (
            <div key={i} className="relative aspect-[4/3] bg-neutral-900 group overflow-hidden">
              <img
                src={banner.image || ''}
                alt={banner.title}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute bottom-6 left-6">
                <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">{banner.title}</h2>
                <Link href={banner.buttonLink || '/'} className="inline-block bg-white text-black px-6 py-2 font-bold text-sm uppercase hover:bg-neutral-200 transition-colors">
                  {banner.buttonText}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-[1400px] mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
          <h3 className="text-xl font-bold uppercase tracking-widest">
            {categoryFilter ? `${categoryFilter.toUpperCase()} / ` : 'TÜM ÜRÜNLER / '}{filteredProducts.length}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12">
          {filteredProducts.map((product) => (
            <div key={product.id} className="group cursor-pointer" onClick={() => router.push(`/product/${product.id}`)}>
              <div className="aspect-square bg-neutral-900 overflow-hidden mb-4 relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-white text-black px-4 py-2 text-xs font-bold uppercase">İNCELE</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="font-bold text-sm uppercase tracking-wide group-hover:underline decoration-1 underline-offset-4">{product.name}</h4>
                <span className="text-sm text-gray-400 font-mono">${product.price.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Yükleniyor...</div>}>
      <HomeContent />
    </Suspense>
  );
}
