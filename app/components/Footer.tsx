import React from 'react';

const Footer = () => {
    return (
        <footer className="w-full py-8 px-6 border-t border-white/5 bg-[#0c0c0c]/80 backdrop-blur-md mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
                {/* Left Side: Logo, Links & Disclaimer */}
                <div className="flex flex-col items-center md:items-start gap-4">
                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                        {/* Logo */}
                        <a href="https://forum-tr.gta.world" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                            <img
                                src="https://forum-tr.gta.world/uploads/monthly_2025_02/logo.png.3fe10156c1213bdb8f59cd9bc9e15781.png"
                                alt="GTA World TR"
                                className="h-6 opacity-70"
                            />
                        </a>

                        {/* Links */}
                        <div className="flex items-center gap-6">
                            <a
                                href="https://discord.gg/gtaworldtr"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-gray-500 hover:text-[#5865F2] transition-colors"
                            >
                                <i className="fa-brands fa-discord text-lg"></i>
                                <span>Discord</span>
                            </a>
                            <a
                                href="https://facebrowser-tr.gta.world"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-gray-500 hover:text-pink-500 transition-colors"
                            >
                                <i className="fa-solid fa-globe text-lg"></i>
                                <span>Facebrowser</span>
                            </a>
                        </div>
                    </div>

                    <div className="text-gray-600 text-[10px] md:text-left text-center space-y-1">
                        <p>(( Valley Park Concept Store resmi bir GTAW web sitesi değildir, üçüncü parti bir yazılımdır. ))</p>
                    </div>
                </div>

                {/* Right Side: Copyright & Powered By */}
                <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-gray-600">
                    <p>© 2026 Valley Park Concept Store</p>
                    <div className="hidden md:block w-1 h-1 bg-gray-800 rounded-full"></div>
                    <p>
                        <span>powered by </span>
                        <span className="text-white font-medium" style={{ textShadow: '0 0 5px rgba(255,255,255,0.3), 0 0 10px rgba(255,255,255,0.1)' }}>eira</span>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
