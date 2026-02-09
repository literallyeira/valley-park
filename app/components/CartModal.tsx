'use client';

import { useState } from 'react';
import { User } from '../lib/auth';

interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
    category: string;
}

interface CartModalProps {
    items: number[];
    products: Product[];
    user: User | null;
    onLoginRequest: () => void;
    onClose: () => void;
    onClear: () => void;
}

export default function CartModal({ items, products, user, onLoginRequest, onClose, onClear }: CartModalProps) {
    const [formData, setFormData] = useState({
        senderCharacter: user?.characters?.[0] || '', // Default to first character
        fullName: '', // Receiver Name (Manual)
        address: '',
        phone: ''
    });

    const [isProcessing, setIsProcessing] = useState(false);

    // Get product details for items in cart
    const cartItems = items.map(id => products.find(p => p.id === id)).filter(Boolean) as Product[];
    const total = cartItems.reduce((sum, item) => sum + item.price, 0);

    const handlePayment = async () => {
        if (!user) {
            onLoginRequest();
            return;
        }

        if (!formData.senderCharacter || !formData.fullName || !formData.address || !formData.phone) {
            alert('Lütfen tüm bilgileri doldurunuz.');
            return;
        }

        setIsProcessing(true);

        // Simulate Banking Delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Create Order
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: user.username,
                    ucpName: user.ucpName,
                    items: cartItems,
                    total: total,
                    paymentMethod: 'Bank Transfer',
                    ...formData
                })
            });

            if (response.ok) {
                alert(`Siparişiniz alındı! Banka hesabınızdan $${total} tahsil edildi.`);
                onClear();
                onClose();
            } else {
                alert('Sipariş oluşturulurken bir hata oluştu.');
            }
        } catch {
            alert('Bağlantı hatası.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-end z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-black w-full max-w-md h-full border-l border-white/10 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-8 border-b border-white/10 flex items-center justify-between">
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Sepetiniz</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        KAPAT
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {cartItems.length === 0 ? (
                        <div className="text-center py-20 text-gray-500 font-mono text-sm">
                            SEPETİNİZ BOŞ
                        </div>
                    ) : (
                        <>
                            {cartItems.map((item, index) => (
                                <div key={`${item.id}-${index}`} className="flex gap-4">
                                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover grayscale" />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-sm uppercase tracking-wide">{item.name}</h4>
                                        <p className="text-gray-400 font-mono text-sm mt-1">${item.price}</p>
                                    </div>
                                </div>
                            ))}

                            {/* Delivery Form */}
                            <div className="border-t border-white/10 pt-6 mt-6">
                                <h3 className="font-bold uppercase text-sm tracking-widest mb-4 text-gray-400">Teslimat Bilgileri</h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Siparişi Veren (Karakteriniz)</label>
                                        <select
                                            className="w-full bg-neutral-900 border border-white/20 p-3 text-sm text-white focus:outline-none focus:border-white appearance-none"
                                            value={formData.senderCharacter}
                                            onChange={e => setFormData({ ...formData, senderCharacter: e.target.value })}
                                        >
                                            {user?.characters?.map((char, idx) => (
                                                <option key={idx} value={char}>{char}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <input
                                        type="text"
                                        placeholder="Alıcı Adı Soyadı"
                                        className="w-full bg-neutral-900 border border-white/20 p-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-white"
                                        value={formData.fullName}
                                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                    />

                                    <input
                                        type="text"
                                        placeholder="Telefon"
                                        className="w-full bg-neutral-900 border border-white/20 p-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-white"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />

                                    <textarea
                                        placeholder="Teslimat Adresi"
                                        rows={2}
                                        className="w-full bg-neutral-900 border border-white/20 p-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-white resize-none"
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="p-8 border-t border-white/10 bg-neutral-900/50">
                    <div className="flex items-center justify-between mb-6">
                        <span className="font-bold uppercase text-sm tracking-wider">Tahmini Toplam</span>
                        <span className="text-xl font-bold font-mono">${total.toFixed(2)}</span>
                    </div>

                    <p className="text-[10px] text-gray-500 mb-4 uppercase tracking-widest text-center">
                        Vergiler dahil. Kargo ödeme adımında hesaplanır.
                    </p>

                    <button
                        onClick={handlePayment}
                        disabled={items.length === 0 || isProcessing}
                        className="w-full bg-white text-black font-black uppercase tracking-widest py-4 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? 'İŞLENİYOR...' : user ? 'ÖDEME YAP' : 'ÖDEME İÇİN GİRİŞ YAP'}
                    </button>
                </div>
            </div>
        </div>
    );
}
