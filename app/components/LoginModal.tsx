'use client';

import { useState } from 'react';
import { mockLogin } from '../lib/auth';

interface LoginModalProps {
    onLogin: (user: any) => void;
    onClose: () => void;
}

export default function LoginModal({ onLogin, onClose }: LoginModalProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const user = await mockLogin(username, password);
            if (user) {
                onLogin(user);
            } else {
                setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
            }
        } catch {
            setError('Bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-[#1e293b] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl p-8 animate-fade-in relative" onClick={e => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <i className="fa-solid fa-xmark text-xl"></i>
                </button>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Giriş Yap</h2>
                    <p className="text-gray-400 text-sm">Valley Park Concept Store'a erişmek için UCP hesabınızla giriş yapın.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Kullanıcı Adı</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                            placeholder="UCP Kullanıcı Adı"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Şifre</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                            <p className="text-red-400 text-sm text-center">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[var(--primary)] text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <i className="fa-solid fa-spinner fa-spin"></i>
                                Giriş Yapılıyor...
                            </span>
                        ) : (
                            'Giriş Yap'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
