'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3500);
    }, []);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`pointer-events-auto px-6 py-4 rounded-lg border backdrop-blur-md shadow-2xl animate-slide-in-right
                            ${t.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100' :
                              t.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-100' :
                              'bg-white/10 border-white/20 text-white'}`}
                    >
                        <div className="flex items-center gap-3">
                            <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm
                                ${t.type === 'success' ? 'bg-emerald-500/30 text-emerald-400' :
                                  t.type === 'error' ? 'bg-red-500/30 text-red-400' :
                                  'bg-white/20 text-gray-300'}`}>
                                {t.type === 'success' && <i className="fa-solid fa-check"></i>}
                                {t.type === 'error' && <i className="fa-solid fa-xmark"></i>}
                                {t.type === 'info' && <i className="fa-solid fa-info"></i>}
                            </span>
                            <p className="text-sm font-medium leading-snug">{t.message}</p>
                        </div>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
