import { NextResponse } from 'next/server';
import axios from 'axios';
import { getOrders, createOrder, updateOrderStatus } from '../../lib/db';

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

        // 2. Generate traditional banking gateway array link
        // This is done via Browser instead of Backend Fetch to naturally bypass the Cloudflare JavaScript Challenge (WAF)
        // Ensure returning URL has the orderId query param to act as proper linkage!
        const returnUrl = `https://valley-park.business/api/banking?orderId=${newOrder.id}`;
        
        const redirectUrl = `${GATEWAY_BASE}/gateway?auth_key=${encodeURIComponent(BANKING_AUTH_KEY)}&type=0&price=${Math.round(amount)}&return_url=${encodeURIComponent(returnUrl)}`;

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
