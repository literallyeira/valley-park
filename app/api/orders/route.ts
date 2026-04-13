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

        // 2. Generate native banking gateway redirect link (No backend fetch required)
        // https://banking-tr.gta.world/gateway/<GATEWAY_ID>/0/<AMOUNT>?orderId=...
        const redirectUrl = `https://banking-tr.gta.world/gateway/${BANKING_AUTH_KEY}/0/${Math.round(amount)}?orderId=${newOrder.id}`;

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
