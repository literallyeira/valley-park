'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SelectCharacterPage() {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const tempUserStr = localStorage.getItem('vp_temp_gtaw_user');
        if (!tempUserStr) {
            router.push('/');
            return;
        }

        try {
            const tempUser = JSON.parse(tempUserStr);
            setUser(tempUser);
            
            // Eğer karakteri yoksa, direkt UCP ismiyle giriş yapsın (admin için veya boş hesaplar için fallback)
            if (!tempUser.characters || tempUser.characters.length === 0) {
                finalizeLogin(tempUser, null);
            }
            setIsLoading(false);
        } catch (e) {
            router.push('/');
        }
    }, [router]);

    const finalizeLogin = (baseUser: any, selectedCharacter: any) => {
        const finalUser = {
            username: selectedCharacter ? `${selectedCharacter.firstname} ${selectedCharacter.lastname}`.replace('_', ' ') : baseUser.username,
            ucpName: baseUser.username,
            characters: baseUser.characters || []
        };
        
        localStorage.setItem('vp_user', JSON.stringify(finalUser));
        localStorage.removeItem('vp_temp_gtaw_user');
        
        // Sepeti vb temizleme veya saklama logic'i eklenebilir
        window.location.href = '/';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white font-sans">
                Yükleniyor...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
            <div className="bg-black border border-white/20 p-8 w-full max-w-2xl text-white relative z-10 shadow-2xl animate-fade-in">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">KARAKTER SEÇİMİ</h1>
                    <p className="text-gray-400">Hoş geldin, <span className="text-[var(--primary)] font-bold">{user?.username}</span>. Lütfen mağazaya giriş yapmak istediğin karakteri seç.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user?.characters?.map((char: any) => (
                        <button
                            key={char.id}
                            onClick={() => finalizeLogin(user, char)}
                            className="bg-black border border-white/20 hover:border-white hover:bg-white/5 transition-all p-6 text-left group relative overflow-hidden flex items-center gap-4"
                        >
                            <div className="w-12 h-12 bg-neutral-900 flex items-center justify-center text-white/50 group-hover:text-white transition-all shrink-0">
                                <i className="fa-solid fa-user"></i>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold group-hover:text-[var(--primary)] transition-colors">
                                    {(char.firstname + ' ' + char.lastname).replace('_', ' ')}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Karakter ID: {char.id}</p>
                            </div>
                        </button>
                    ))}
                </div>

                {user?.characters?.length === 0 && (
                    <div className="text-center p-8 bg-neutral-900 border border-white/20">
                        <i className="fa-solid fa-triangle-exclamation text-4xl text-yellow-500 mb-4"></i>
                        <p className="text-gray-300">Bu UCP hesabına bağlı bir karakter bulunamadı. Lütfen önce GTA World üzerinden bir karakter oluşturun.</p>
                        <button 
                            onClick={() => finalizeLogin(user, null)} 
                            className="mt-6 uppercase text-xs font-bold text-gray-500 hover:text-white transition-colors"
                        >
                            Yine de Sadece UCP ile Devam Et
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
