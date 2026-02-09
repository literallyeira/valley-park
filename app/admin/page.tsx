'use client';

import { useState, useEffect } from 'react';
import { User } from '../lib/auth';
import LoginModal from '../components/LoginModal';

interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
    category: string;
    description?: string | null;
}

export default function AdminPage() {
    const [user, setUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'categories'>('orders');
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [newProduct, setNewProduct] = useState({ name: '', price: '', image: '', category: '', description: '' });
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editForm, setEditForm] = useState({ name: '', price: '', image: '', category: '', description: '' });

    useEffect(() => {
        const checkAuth = () => {
            const savedUser = localStorage.getItem('vp_user');
            if (savedUser) {
                const parsedUser = JSON.parse(savedUser);
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
        setUser(u);
        localStorage.setItem('vp_user', JSON.stringify(u));
        fetchData();
    };

    const categories = [...new Set(products.map(p => p.category))].sort();

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...newProduct,
                price: parseFloat(newProduct.price),
                description: newProduct.description || null
            })
        });
        if (res.ok) {
            setNewProduct({ name: '', price: '', image: '', category: '', description: '' });
            fetchData();
            alert('Ürün eklendi');
        }
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setEditForm({
            name: product.name,
            price: String(product.price),
            image: product.image,
            category: product.category,
            description: product.description || ''
        });
    };

    const handleUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;
        const res = await fetch('/api/products', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: editingProduct.id,
                name: editForm.name,
                price: parseFloat(editForm.price),
                image: editForm.image,
                category: editForm.category,
                description: editForm.description || null
            })
        });
        if (res.ok) {
            setEditingProduct(null);
            fetchData();
            alert('Ürün güncellendi');
        }
    };

    const handleDeleteProduct = async (id: number) => {
        if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
        await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
        fetchData();
        if (editingProduct?.id === id) setEditingProduct(null);
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        await fetch('/api/orders', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status })
        });
        fetchData();
    };

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Yükleniyor...</div>;

    if (!user) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
                <h1 className="text-white text-2xl font-bold mb-4">Admin Panel</h1>
                <p className="text-gray-400 mb-8">Erişim için giriş yapın</p>
                <LoginModal onLogin={handleLogin} onClose={() => alert('Admin paneli için giriş zorunludur.')} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-8 pt-12">
            <header className="flex items-center justify-between mb-12 border-b border-white/10 pb-6">
                <h1 className="text-3xl font-black uppercase tracking-tighter">Admin Dashboard</h1>
                <div className="flex gap-3 flex-wrap">
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-5 py-2 font-bold uppercase text-sm transition-colors ${activeTab === 'orders' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        Siparişler
                    </button>
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`px-5 py-2 font-bold uppercase text-sm transition-colors ${activeTab === 'products' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        Ürünler
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`px-5 py-2 font-bold uppercase text-sm transition-colors ${activeTab === 'categories' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        Kategoriler
                    </button>
                    <button onClick={() => { setUser(null); localStorage.removeItem('vp_user'); }} className="text-red-500 font-bold uppercase text-sm hover:text-red-400">
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
                                    <span className="text-[var(--primary)] font-bold">#{order.id}</span>
                                    <span className="text-xs text-gray-400 bg-black px-2 py-1 rounded">{new Date(order.created_at || order.createdAt).toLocaleString('tr-TR')}</span>
                                </div>
                                <h3 className="font-bold text-lg mb-1">{order.ucp_name || order.ucpName} <span className="text-gray-500 text-sm">({order.username})</span></h3>
                                <div className="text-gray-400 text-sm">
                                    {(order.items || []).map((i: any) => i.name).join(', ')}
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
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-neutral-900 border border-white/10 p-6 sticky top-8">
                            <h3 className="text-xl font-bold uppercase mb-6">Yeni Ürün Ekle</h3>
                            <form onSubmit={handleAddProduct} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Ürün Adı</label>
                                    <input type="text" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} className="w-full bg-black border border-white/20 p-3 text-white focus:border-white focus:outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Fiyat ($)</label>
                                    <input type="number" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} className="w-full bg-black border border-white/20 p-3 text-white focus:border-white focus:outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Görsel URL</label>
                                    <input type="url" value={newProduct.image} onChange={e => setNewProduct({ ...newProduct, image: e.target.value })} className="w-full bg-black border border-white/20 p-3 text-white focus:border-white focus:outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Kategori</label>
                                    <input list="categories-list" type="text" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} placeholder="Seçin veya yeni kategori yazın" className="w-full bg-black border border-white/20 p-3 text-white focus:border-white focus:outline-none" required />
                                    <datalist id="categories-list">
                                        {categories.map(c => <option key={c} value={c} />)}
                                    </datalist>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Açıklama (opsiyonel)</label>
                                    <textarea value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} className="w-full bg-black border border-white/20 p-3 text-white focus:border-white focus:outline-none resize-none h-20" />
                                </div>
                                <button type="submit" className="w-full bg-white text-black font-bold uppercase py-3 hover:bg-gray-200 transition-colors">Ekle</button>
                            </form>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                        {products.map((product) => (
                            <div key={product.id} className="bg-neutral-900 border border-white/10 p-4 flex items-center justify-between gap-4 group">
                                <div className="flex items-center gap-4 min-w-0 flex-1">
                                    <img src={product.image} alt={product.name} className="w-16 h-16 object-cover flex-shrink-0" />
                                    <div className="min-w-0">
                                        <h4 className="font-bold truncate">{product.name}</h4>
                                        <p className="text-gray-400 text-sm">${product.price} · {product.category}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    <button onClick={() => handleEditProduct(product)} className="text-blue-400 hover:text-white p-2" title="Düzenle"><i className="fa-solid fa-pen"></i></button>
                                    <button onClick={() => handleDeleteProduct(product.id)} className="text-red-500 hover:text-white p-2" title="Sil"><i className="fa-solid fa-trash"></i></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'categories' && (
                <div className="max-w-2xl">
                    <p className="text-gray-400 mb-6">Mevcut kategoriler. Yeni kategori eklemek için Ürünler sekmesinden yeni ürün eklerken kategori alanına yazın.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {categories.map((cat) => {
                            const count = products.filter(p => p.category === cat).length;
                            return (
                                <div key={cat} className="bg-neutral-900 border border-white/10 p-4 flex justify-between items-center">
                                    <span className="font-bold">{cat}</span>
                                    <span className="text-gray-500 text-sm">{count} ürün</span>
                                </div>
                            );
                        })}
                    </div>
                    {categories.length === 0 && <p className="text-gray-500">Henüz kategori yok. Ürün ekleyerek kategori oluşturabilirsiniz.</p>}
                </div>
            )}

            {/* Edit Modal */}
            {editingProduct && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setEditingProduct(null)}>
                    <div className="bg-neutral-900 border border-white/20 p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold uppercase mb-6">Ürünü Düzenle</h3>
                        <form onSubmit={handleUpdateProduct} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Ürün Adı</label>
                                <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full bg-black border border-white/20 p-3 text-white focus:border-white focus:outline-none" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Fiyat ($)</label>
                                <input type="number" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} className="w-full bg-black border border-white/20 p-3 text-white focus:border-white focus:outline-none" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Görsel URL</label>
                                <input type="url" value={editForm.image} onChange={e => setEditForm({ ...editForm, image: e.target.value })} className="w-full bg-black border border-white/20 p-3 text-white focus:border-white focus:outline-none" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Kategori</label>
                                <input list="edit-categories-list" type="text" value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })} placeholder="Seçin veya yeni kategori yazın" className="w-full bg-black border border-white/20 p-3 text-white focus:border-white focus:outline-none" required />
                                <datalist id="edit-categories-list">
                                    {categories.map(c => <option key={c} value={c} />)}
                                    {editForm.category && !categories.includes(editForm.category) && <option value={editForm.category} />}
                                </datalist>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Açıklama (opsiyonel)</label>
                                <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="w-full bg-black border border-white/20 p-3 text-white focus:border-white focus:outline-none resize-none h-20" />
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" className="flex-1 bg-white text-black font-bold uppercase py-3 hover:bg-gray-200 transition-colors">Kaydet</button>
                                <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 bg-neutral-700 text-white font-bold uppercase py-3 hover:bg-neutral-600 transition-colors">İptal</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
