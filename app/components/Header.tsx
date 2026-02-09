'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User } from '../lib/auth';
import { useCart } from '../context/CartContext';
import LoginModal from './LoginModal';
import CartModal from './CartModal';

interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
    category: string;
}

export default function Header() {
    const [user, setUser] = useState<User | null>(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);

    // We need products for CartModal to render details. 
    // In a real app, cart items should probably contain their own basic details or fetch them.
    // For now, fetching products here to pass to CartModal is acceptable.
    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => setProducts(data));
    }, []);

    const { items: cartItems, clearCart } = useCart();

    useEffect(() => {
        const checkAuth = () => {
            const savedUser = localStorage.getItem('vp_user');
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
        };
        checkAuth();

        // Listen for storage events (in case login happens in another tab/window, though less critical here)
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, [isLoginOpen]); // Re-check when login modal closes

    const handleLogin = (loggedInUser: User) => {
        setUser(loggedInUser);
        localStorage.setItem('vp_user', JSON.stringify(loggedInUser));
        setIsLoginOpen(false);
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('vp_user');
        clearCart();
    };

    return (
        <>
            <nav className="fixed w-full top-0 z-50 bg-black/90 backdrop-blur-sm border-b border-white/10">
                <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-12">
                        <Link href="/" className="block">
                            <img src="/logo.png" alt="Valley Park" className="h-12 w-auto" />
                        </Link>
                        <div className="hidden md:flex items-center gap-8 text-sm font-bold tracking-widest text-gray-400">
                            <Link href="/" className="hover:text-white transition-colors">TÜM ÜRÜNLER</Link>
                            <Link href="#" className="hover:text-white transition-colors">GİYİM</Link>
                            <Link href="#" className="hover:text-white transition-colors">AKSESUAR</Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link href="/orders" className="text-xs font-bold uppercase hover:text-[var(--primary)] text-gray-400">
                                    Siparişlerim
                                </Link>
                                <span className="text-xs font-bold text-white border border-white px-2 py-1">
                                    {user.ucpName}
                                </span>
                                <button onClick={handleLogout} className="text-gray-400 hover:text-white" title="Çıkış Yap">
                                    <i className="fa-solid fa-right-from-bracket"></i>
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsLoginOpen(true)}
                                className="text-sm font-bold tracking-wider hover:text-gray-300 uppercase"
                            >
                                GİRİŞ YAP
                            </button>
                        )}

                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative flex items-center gap-2 hover:opacity-70 transition-opacity"
                        >
                            <span className="text-sm font-bold">SEPET</span>
                            <span className="bg-white text-black text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                {cartItems.length}
                            </span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Login Modal */}
            {isLoginOpen && <LoginModal onLogin={handleLogin} onClose={() => setIsLoginOpen(false)} />}

            {/* Cart Modal */}
            {isCartOpen && (
                <CartModal
                    items={cartItems}
                    products={products}
                    user={user}
                    onLoginRequest={() => { setIsCartOpen(false); setIsLoginOpen(true); }}
                    onClose={() => setIsCartOpen(false)}
                    onClear={clearCart}
                />
            )}
        </>
    );
}
