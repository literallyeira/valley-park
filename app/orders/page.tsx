'use client';

import { useState, useEffect } from 'react';
import { User } from '../lib/auth';
import Link from 'next/link';

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
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
                });
        } else {
            setIsLoading(false);
        }
    }, []);

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Yükleniyor...</div>;

    return (
        <div className="min-h-screen bg-black text-white px-6 py-12">
            <div className="max-w-[1000px] mx-auto">
                <div className="flex items-center justify-between mb-12 border-b border-white/10 pb-6">
                    <h1 className="text-3xl font-black uppercase tracking-tighter">Siparişlerim</h1>
                    <Link href="/" className="text-gray-400 hover:text-white uppercase text-sm font-bold tracking-widest">
                        Mağazaya Dön
                    </Link>
                </div>

                <div className="space-y-6">
                    {orders.length === 0 ? (
                        <div className="text-center py-20 bg-neutral-900/50 border border-white/5 rounded-lg">
                            <p className="text-gray-400 mb-4">Henüz bir siparişiniz bulunmuyor.</p>
                            <Link href="/" className="inline-block bg-white text-black px-8 py-3 font-bold uppercase tracking-wider text-sm hover:bg-gray-200">
                                Alışverişe Başla
                            </Link>
                        </div>
                    ) : (
                        orders.map((order) => (
                            <div key={order.id} className="bg-neutral-900 border border-white/10 p-6 rounded-lg">
                                <div className="flex flex-col md:flex-row justify-between mb-6 pb-6 border-b border-white/5 gap-4">
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Sipariş No</div>
                                        <div className="font-mono text-lg font-bold text-[var(--primary)]">#{order.id}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Tarih</div>
                                        <div className="font-mono text-sm">{new Date(order.createdAt).toLocaleDateString("tr-TR")}</div>
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

                                <div className="space-y-4">
                                    {order.items.map((item: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-4">
                                            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover grayscale opacity-80" />
                                            <div>
                                                <h4 className="font-bold text-sm uppercase">{item.name}</h4>
                                                <p className="text-gray-400 font-mono text-xs">${item.price}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
