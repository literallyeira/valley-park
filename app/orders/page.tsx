'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface OrderItem {
    id: number;
    name: string;
    price: number;
    image: string;
    category?: string;
}

interface Order {
    id: number;
    created_at?: string;
    createdAt?: string;
    username: string;
    ucp_name?: string;
    ucpName?: string;
    items: OrderItem[];
    total: number;
    status: string;
    payment_method?: string;
    paymentMethod?: string;
    sender_character?: string;
    senderCharacter?: string;
    full_name?: string;
    fullName?: string;
    address?: string;
    phone?: string;
}

function formatOrderDate(order: Order): string {
    const dateStr = order.created_at || order.createdAt;
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('vp_user');
        if (savedUser) {
            const user = JSON.parse(savedUser);
            fetch(`/api/orders?username=${user.username}`)
                .then(res => res.json())
                .then(data => {
                    setOrders(data);
                    setIsLoading(false);
                })
                .catch(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, []);

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Yükleniyor...</div>;

    return (
        <div className="min-h-screen bg-black text-white px-6 pt-8 pb-24">
            <div className="max-w-[1000px] mx-auto">
                <div className="flex items-center justify-between mb-12 border-b border-white/10 pb-6">
                    <h1 className="text-3xl font-black uppercase tracking-tighter">Siparişlerim</h1>
                    <Link href="/" className="text-gray-400 hover:text-white uppercase text-sm font-bold tracking-widest">
                        Mağazaya Dön
                    </Link>
                </div>

                <div className="space-y-8">
                    {orders.length === 0 ? (
                        <div className="text-center py-20 bg-neutral-900/50 border border-white/5 rounded-lg">
                            <p className="text-gray-400 mb-4">Henüz bir siparişiniz bulunmuyor.</p>
                            <Link href="/" className="inline-block bg-white text-black px-8 py-3 font-bold uppercase tracking-wider text-sm hover:bg-gray-200">
                                Alışverişe Başla
                            </Link>
                        </div>
                    ) : (
                        orders.map((order) => (
                            <div key={order.id} className="bg-neutral-900 border border-white/10 rounded-lg overflow-hidden">
                                {/* Header */}
                                <div className="p-6 border-b border-white/10 bg-neutral-900/50">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex flex-wrap items-center gap-6">
                                            <div>
                                                <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Sipariş No</div>
                                                <div className="font-mono text-lg font-bold text-[var(--primary)]">#{order.id}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Tarih</div>
                                                <div className="font-mono text-sm text-gray-300">{formatOrderDate(order)}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Toplam</div>
                                                <div className="font-mono text-lg font-bold">${order.total}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Durum</div>
                                                <span className={`inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wide
                                                    ${order.status === 'Hazırlanıyor' ? 'bg-yellow-500/20 text-yellow-500' :
                                                        order.status === 'Kargolandı' ? 'bg-blue-500/20 text-blue-500' :
                                                            order.status === 'Teslim Edildi' ? 'bg-green-500/20 text-green-500' :
                                                                'bg-red-500/20 text-red-500'}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="p-6 border-b border-white/5">
                                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-4">Ürünler</div>
                                    <div className="space-y-4">
                                        {(order.items || []).map((item: OrderItem, idx: number) => (
                                            <div key={idx} className="flex items-center gap-4">
                                                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover grayscale opacity-80 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-sm uppercase truncate">{item.name}</h4>
                                                    <p className="text-gray-400 font-mono text-xs">${item.price}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Delivery & Payment Details */}
                                <div className="p-6 bg-black/30">
                                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-4">Teslimat & Ödeme Bilgileri</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                        <div className="space-y-3">
                                            <div>
                                                <span className="text-gray-500 block text-xs uppercase font-bold mb-0.5">Siparişi Veren (Karakter)</span>
                                                <span className="text-white">{(order as any).sender_character || (order as any).senderCharacter || '—'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 block text-xs uppercase font-bold mb-0.5">Alıcı Adı Soyadı</span>
                                                <span className="text-white">{(order as any).full_name || (order as any).fullName || '—'}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <span className="text-gray-500 block text-xs uppercase font-bold mb-0.5">Telefon</span>
                                                <span className="text-white">{(order as any).phone || '—'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 block text-xs uppercase font-bold mb-0.5">Ödeme Yöntemi</span>
                                                <span className="text-white">{(order as any).payment_method || (order as any).paymentMethod || '—'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <span className="text-gray-500 block text-xs uppercase font-bold mb-0.5">Teslimat Adresi</span>
                                        <span className="text-gray-300 text-sm">{(order as any).address || '—'}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
