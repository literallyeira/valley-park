import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://futtrvenjngkcvugbxwp.supabase.co';
const supabaseAnonKey = 'sb_publishable_-5yRzCoEXgQE3Ppbbv_xeQ_4cOp7yEU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for better Intellisense
export type Product = {
    id: number;
    created_at?: string;
    name: string;
    price: number;
    image: string;
    category: string;
    description?: string;
};

export type Order = {
    id?: number; // Supabase generated
    created_at?: string;
    user_id?: string; // Optional if we just store username
    username: string;
    ucp_name: string;
    items: any; // JSONB
    total: number;
    status: string;
    payment_method: string;
};
