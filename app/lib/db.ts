import { supabase } from './supabase';

export const getProducts = async () => {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) console.error('Error fetching products:', error);
    return data || [];
};

export const addProduct = async (product: any) => {
    const { data, error } = await supabase.from('products').insert([product]).select().single();
    if (error) console.error('Error adding product:', error);
    return data;
};

export const updateProduct = async (id: number, updates: Partial<{ name: string; price: number; image: string; category: string; description: string | null }>) => {
    const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
    if (error) console.error('Error updating product:', error);
    return data;
};

export const deleteProduct = async (id: number) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) console.error('Error deleting product:', error);
};

export const getOrders = async () => {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) console.error('Error fetching orders:', error);
    return data || [];
};

export const createOrder = async (order: any) => {
    // Map frontend order structure to DB structure if needed, or rely on loose typings for now
    const dbOrder = {
        username: order.username,
        ucp_name: order.ucpName,
        items: order.items,
        total: order.total,
        payment_method: order.paymentMethod,
        status: 'Hazırlanıyor',
        sender_character: order.senderCharacter,
        full_name: order.fullName,
        address: order.address,
        phone: order.phone
    };

    const { data, error } = await supabase.from('orders').insert([dbOrder]).select().single();
    if (error) console.error('Error creating order:', error);
    return data;
};

export const updateOrderStatus = async (id: string | number, status: string) => {
    const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().single();
    if (error) console.error('Error updating order:', error);
    return data;
};
