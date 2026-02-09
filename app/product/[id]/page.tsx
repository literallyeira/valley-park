'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
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
    const router = useRouter();
    const { addToCart } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            // Ideally should fetch single product by ID
            // For now, fetching all and filtering (simple)
            // Or better: Implement /api/products/[id]
            fetch(`/api/products`)
                .then(res => res.json())
                .then(data => {
                    const found = data.find((p: any) => p.id == id);
                    setProduct(found || null);
                    setIsLoading(false);
                });
        }
    }, [id]);

    const handleAddToCart = () => {
        if (product) {
            addToCart(product.id);
            alert('Sepete Eklendi');
        }
    };

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center">Yükleniyor...</div>;
    if (!product) return <div className="min-h-screen bg-black flex items-center justify-center">Ürün bulunamadı.</div>;

    return (
        <main className="min-h-screen bg-black pt-24 pb-20 px-6">
            <div className="max-w-[1200px] mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 uppercase text-xs font-bold tracking-widest">
                    <i className="fa-solid fa-arrow-left"></i>
                    Back to Store
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
                                Add to Cart
                            </button>
                            <button className="w-14 h-14 border border-white/20 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-all">
                                <i className="fa-regular fa-heart"></i>
                            </button>
                        </div>

                        <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
                            <div>
                                <i className="fa-solid fa-truck text-gray-500 text-xl mb-2"></i>
                                <p className="text-xs uppercase font-bold text-gray-400">Fast Shipping</p>
                            </div>
                            <div>
                                <i className="fa-solid fa-shield-halved text-gray-500 text-xl mb-2"></i>
                                <p className="text-xs uppercase font-bold text-gray-400">Secure Payment</p>
                            </div>
                            <div>
                                <i className="fa-solid fa-rotate-left text-gray-500 text-xl mb-2"></i>
                                <p className="text-xs uppercase font-bold text-gray-400">Easy Returns</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
