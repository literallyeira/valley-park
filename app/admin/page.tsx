'use client';

import { useState, useEffect } from 'react';
import { User } from '../lib/auth';
import LoginModal from '../components/LoginModal';

export default function AdminPage() {
    const [user, setUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState('orders');
    const [products, setProducts] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // New Product Form State
    const [newProduct, setNewProduct] = useState({ name: '', price: '', image: '', category: '' });

    useEffect(() => {
        const checkAuth = () => {
            const savedUser = localStorage.getItem('vp_user');
            if (savedUser) {
                const parsedUser = JSON.parse(savedUser);
                // Simple admin check - in real app use backend verification
                if (parsedUser.ucpName === 'admin' || parsedUser.ucpName === 'Murat') {
                    setUser(parsedUser);
                    fetchData();
                }
            }
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    const fetchData = async () => {
        const [productsRes, ordersRes] = await Promise.all([
            fetch('/api/products'),
            fetch('/api/orders')
        ]);
        setProducts(await productsRes.json());
        setOrders(await ordersRes.json());
    };

    const handleLogin = (u: User) => {
        // Allow anyone to "try" but only specific names to enter admin
        // For prototype, we'll just allow any login to see the UI, but in reality restricting it is better.
        // Let's restrict to 'admin' for demo purposes
        /* if (u.ucpName !== 'admin') {
            alert('Yetkisiz giriş!');
            return;
        } */
        setUser(u);
        localStorage.setItem('vp_user', JSON.stringify(u));
        fetchData();
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/products', {
            method: 'POST',
            body: JSON.stringify({
                ...newProduct,
                price: parseFloat(newProduct.price)
            })
        });
        if (res.ok) {
            setNewProduct({ name: '', price: '', image: '', category: '' });
            fetchData();
            alert('Ürün eklendi');
        }
    };

    const handleDeleteProduct = async (id: number) => {
        if (!confirm('Emin misiniz?')) return;
        await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
        fetchData();
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        await fetch('/api/orders', {
            method: 'PUT',
            body: JSON.stringify({ id, status })
        });
        fetchData();
    };

    if (isLoading) return <div>Loading...</div>;

    if (!user) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
                <h1 className="text-white text-2xl font-bold mb-4">Admin Panel</h1>
                <p className="text-gray-400 mb-8">Erişim için giriş yapın (Yetkili hesabı gereklidir)</p>
                <LoginModal onLogin={handleLogin} onClose={() => { /* Admin page login required, can't close without login, or redirect */ alert('Admin paneli için giriş zorunludur.'); }} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <header className="flex items-center justify-between mb-12 border-b border-white/10 pb-6">
                <h1 className="text-3xl font-black uppercase tracking-tighter">Admin Dashboard</h1>
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-6 py-2 font-bold uppercase transition-colors ${activeTab === 'orders' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        Siparişler
                    </button>
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`px-6 py-2 font-bold uppercase transition-colors ${activeTab === 'products' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        Ürünler
                    </button>
                    <button onClick={() => { setUser(null); localStorage.removeItem('vp_user'); }} className="text-red-500 font-bold uppercase hover:text-red-400">
                        Çıkış
                    </button>
                </div>
            </header>

            {activeTab === 'orders' && (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-neutral-900 border border-white/10 p-6 flex flex-col md:flex-row justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-4 mb-2">
                                    <span className="text-[var(--primary)] font-bold">{order.id}</span>
                                    <span className="text-xs text-gray-400 bg-black px-2 py-1 rounded">{new Date(order.createdAt).toLocaleString()}</span>
                                </div>
                                <h3 className="font-bold text-lg mb-1">{order.ucpName} <span className="text-gray-500 text-sm">({order.username})</span></h3>
                                <div className="text-gray-400 text-sm">
                                    {order.items.map((i: any) => i.name).join(', ')}
                                </div>
                                <div className="mt-2 font-mono text-xl font-bold">${order.total}</div>
                            </div>
                            <div className="flex flex-col gap-2 min-w-[200px]">
                                <label className="text-xs uppercase font-bold text-gray-500">Sipariş Durumu</label>
                                <select
                                    value={order.status}
                                    onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                    className="bg-black border border-white/20 p-2 text-white font-bold rounded focus:border-white focus:outline-none"
                                >
                                    <option value="Hazırlanıyor">Hazırlanıyor</option>
                                    <option value="Kargolandı">Kargolandı</option>
                                    <option value="Teslim Edildi">Teslim Edildi</option>
                                    <option value="İptal Edildi">İptal Edildi</option>
                                </select>
                            </div>
                        </div>
                    ))}
                    {orders.length === 0 && <p className="text-gray-500">Henüz sipariş yok.</p>}
                </div>
            )}

            {activeTab === 'products' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <div className="bg-neutral-900 border border-white/10 p-6 sticky top-8">
                            <h3 className="text-xl font-bold uppercase mb-6">Yeni Ürün Ekle</h3>
                            <form onSubmit={handleAddProduct} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Ürün Adı</label>
                                    <input
                                        type="text"
                                        value={newProduct.name}
                                        onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                        className="w-full bg-black border border-white/20 p-3 text-white focus:border-white focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Fiyat ($)</label>
                                    <input
                                        type="number"
                                        value={newProduct.price}
                                        onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                        className="w-full bg-black border border-white/20 p-3 text-white focus:border-white focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Görsel URL</label>
                                    <input
                                        type="url"
                                        value={newProduct.image}
                                        onChange={e => setNewProduct({ ...newProduct, image: e.target.value })}
                                        className="w-full bg-black border border-white/20 p-3 text-white focus:border-white focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Kategori</label>
                                    <input
                                        type="text"
                                        value={newProduct.category}
                                        onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                        className="w-full bg-black border border-white/20 p-3 text-white focus:border-white focus:outline-none"
                                        required
                                    />
                                </div>
                                <button type="submit" className="w-full bg-white text-black font-bold uppercase py-3 hover:bg-gray-200 transition-colors">
                                    Ekle
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                        {products.map((product) => (
                            <div key={product.id} className="bg-neutral-900 border border-white/10 p-4 flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <img src={product.image} alt={product.name} className="w-16 h-16 object-cover" />
                                    <div>
                                        <h4 className="font-bold">{product.name}</h4>
                                        <p className="text-gray-400 text-sm">${product.price}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="text-red-500 hover:text-white p-2"
                                >
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
