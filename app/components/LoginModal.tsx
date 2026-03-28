'use client';

interface LoginModalProps {
    onLogin: (user: any) => void;
    onClose: () => void;
}

export default function LoginModal({ onLogin, onClose }: LoginModalProps) {
    const handleGTAWLogin = () => {
        const clientId = '55';
        const redirectUri = encodeURIComponent('https://valley-park.business/api/auth');
        const oauthUrl = `https://ucp-tr.gta.world/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
        window.location.href = oauthUrl;
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
                    <p className="text-gray-400 text-sm">Valley Park Concept Store'a erişmek için GTA World hesabınızla giriş yapın.</p>
                </div>

                <div className="space-y-6">
                    <button
                        onClick={handleGTAWLogin}
                        className="w-full bg-[#1da1f2] text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-3"
                    >
                        <i className="fa-solid fa-gamepad text-xl"></i>
                        GTAW İLE GİRİŞ YAP
                    </button>
                </div>
            </div>
        </div>
    );
}
