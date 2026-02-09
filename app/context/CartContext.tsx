'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartContextType {
    items: number[];
    addToCart: (id: number) => void;
    removeFromCart: (id: number) => void;
    clearCart: () => void;
    itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<number[]>([]);

    // Determine initial state (could load from localStorage if we want persistence)
    useEffect(() => {
        const savedCart = localStorage.getItem('vp_cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart from local storage", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('vp_cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (id: number) => {
        setItems(prev => [...prev, id]);
    };

    const removeFromCart = (id: number) => {
        setItems(prev => {
            const index = prev.indexOf(id);
            if (index > -1) {
                const newItems = [...prev];
                newItems.splice(index, 1);
                return newItems;
            }
            return prev;
        });
    };

    const clearCart = () => {
        setItems([]);
    };

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, itemCount: items.length }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
