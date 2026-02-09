import { NextResponse } from 'next/server';
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

export async function POST(request: Request) {
    const data = await request.json();
    const newOrder = await createOrder(data);
    return NextResponse.json(newOrder);
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
