import { NextResponse } from 'next/server';
import axios from 'axios';
import { getOrders, createOrder, updateOrderStatus, deleteOrder } from '../../lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    let orders = await getOrders();

    // Filter by username if provided (for user profile)
    // If no username, assumes Admin access (shows all) - In real app, verify admin token here
    if (username) {
        orders = orders.filter((o: any) => o.username === username);
    }

    return NextResponse.json(orders);
}

const BANKING_AUTH_KEY = 'dmA1SIj5F9L0vRX1u2fkLaM9Rt7osgiHB7ywREaRiaNMry2NlAHQlhFTJYqkkGv4';
const GATEWAY_BASE = 'https://banking-tr.gta.world';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const amount = data.total;

        // 1. Create the order in pending state first
        const newOrder = await createOrder({ ...data, status: 'Ödeme Bekleniyor' });

        // 2. Generate banking gateway token
        // Use carefully mapped browser-mimicking headers to bypass Cloudflare
        const generateUrl = `${GATEWAY_BASE}/gateway_token/generateToken?price=${Math.round(amount)}&type=0`;

        let token: string = '';
        try {
            const tokenRes = await fetch(generateUrl, {
                method: 'GET',
                headers: { 
                    'Authorization': `Bearer ${BANKING_AUTH_KEY}`,
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                },
                cache: 'no-store'
            });

            if (!tokenRes.ok) {
                const errText = await tokenRes.text();
                throw new Error(`Cloudflare/API Hatası (HTTP ${tokenRes.status}). ${errText.slice(0, 100)}`);
            }

            const rawToken = await tokenRes.text();
            try {
                const parsed = JSON.parse(rawToken);
                token = typeof parsed === 'string' ? parsed : (parsed?.token || parsed?.data || String(parsed));
            } catch {
                token = rawToken.replace(/^"|"$/g, '').trim();
            }
        } catch (error: any) {
            console.error('Banking Token Error:', error.message);
            return NextResponse.json({ ...newOrder, error: error.message });
        }

        if (!token) {
            return NextResponse.json({ ...newOrder, error: 'Token alınamadı. API geçersiz.' });
        }

        // 3. Save token to order for webhook matching
        await updateOrderStatus(newOrder.id, 'Ödeme Bekleniyor', token);
        
        const redirectUrl = `${GATEWAY_BASE}/gateway/${encodeURIComponent(token)}`;

        return NextResponse.json({
            ...newOrder,
            redirectUrl
        });





    } catch (error) {
        console.error('Order/Payment Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const data = await request.json();
    const { id, status } = data;

    const updatedOrder = await updateOrderStatus(id, status);
    if (updatedOrder) {
        return NextResponse.json(updatedOrder);
    }
    // If null, order might not exist or error.
    return NextResponse.json({ status: 'Updated' });
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    await deleteOrder(id);
    return NextResponse.json({ success: true });
}
