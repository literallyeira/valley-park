'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../components/Toast';
import Link from 'next/link';

interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
    category: string;
    description?: string;
}

export default function ProductDetailPage() {
    const { id } = useParams();
    const { addToCart } = useCart();
    const { toast } = useToast();

    const [product, setProduct] = useState<Product | null>(null);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            // Ideally should fetch single product by ID
            // For now, fetching all and filtering (simple)
            // Or better: Implement /api/products/[id]
            fetch(`/api/products`)
                .then(res => res.json())
                .then(data => {
                    setAllProducts(data);
                    const found = data.find((p: any) => p.id == id);
                    setProduct(found || null);
                    setIsLoading(false);
                });
        }
    }, [id]);

    const handleAddToCart = () => {
        if (product) {
            addToCart(product.id);
            toast('Sepete eklendi');
        }
    };

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center">Yükleniyor...</div>;
    if (!product) return <div className="min-h-screen bg-black flex items-center justify-center">Ürün bulunamadı.</div>;

    return (
        <main className="min-h-screen bg-black pt-8 pb-20 px-6">
            <div className="max-w-[1200px] mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 uppercase text-xs font-bold tracking-widest">
                    <i className="fa-solid fa-arrow-left"></i>
                    MAĞAZAYA DÖN
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Image */}
                    <div className="aspect-square bg-neutral-900 overflow-hidden relative group">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Details */}
                    <div>
                        <span className="text-[var(--primary)] font-bold uppercase tracking-widest text-xs block mb-2">{product.category}</span>
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 leading-none">{product.name}</h1>
                        <p className="text-2xl font-mono text-gray-300 mb-8">${product.price}</p>

                        <div className="prose prose-invert mb-8">
                            <p className="text-gray-400 leading-relaxed">
                                {product.description || "Bu ürün için henüz bir açıklama girilmemiş. Ancak kalitesi ve tasarımıyla öne çıkan bu parça, koleksiyonumuzun en sevilenlerinden biri."}
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-white text-black py-4 font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors"
                            >
                                SEPETE EKLE
                            </button>
                            <button className="w-14 h-14 border border-white/20 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-all">
                                <i className="fa-regular fa-heart"></i>
                            </button>
                        </div>

                        <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
                            <div>
                                <i className="fa-solid fa-truck text-gray-500 text-xl mb-2"></i>
                                <p className="text-xs uppercase font-bold text-gray-400">HIZLI KARGO</p>
                            </div>
                            <div>
                                <i className="fa-solid fa-shield-halved text-gray-500 text-xl mb-2"></i>
                                <p className="text-xs uppercase font-bold text-gray-400">GÜVENLİ ÖDEME</p>
                            </div>
                            <div>
                                <i className="fa-solid fa-rotate-left text-gray-500 text-xl mb-2"></i>
                                <p className="text-xs uppercase font-bold text-gray-400">KOLAY İADE</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {allProducts.filter(p => p.category === product.category && p.id !== product.id).length > 0 && (
                    <div className="mt-20">
                        <h2 className="text-xl font-bold uppercase tracking-widest mb-8 border-b border-white/10 pb-4">BENZER ÜRÜNLER</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 gap-y-12">
                            {allProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4).map((p) => (
                                <Link href={`/product/${p.id}`} key={p.id} className="group cursor-pointer block">
                                    <div className="aspect-square bg-neutral-900 overflow-hidden mb-4 relative">
                                        <img src={p.image} alt={p.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="bg-white text-black px-4 py-2 text-xs font-bold uppercase">İNCELE</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h4 className="font-bold text-sm uppercase tracking-wide group-hover:underline decoration-1 underline-offset-4">{p.name}</h4>
                                        <span className="text-sm text-gray-400 font-mono">${p.price.toFixed(2)}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
