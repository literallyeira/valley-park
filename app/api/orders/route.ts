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

const BANKING_AUTH_KEY = 'sGW1R81tH7rqBlGBMmXPZ6QAWdK2YuLHvSGIYiP5oMjD4KTZmIkYJ7wguDg0tudd';
const GATEWAY_BASE = 'https://banking-tr.gta.world';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const amount = data.total;

        // 1. Create the order in pending state first
        const newOrder = await createOrder({ ...data, status: 'Ödeme Bekleniyor' });

        // 2. Generate banking gateway token
        // Use axios and UCP-mimicking headers to bypass Cloudflare/WAF (Pattern from MatchUp)
        const generateUrl = `${GATEWAY_BASE}/gateway_token/generateToken?price=${Math.round(amount)}&type=0`;

        console.log('Fetching banking token via axios from:', generateUrl);

        const axiosHeaders = {
            'Authorization': `Bearer ${BANKING_AUTH_KEY}`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
            'Origin': 'https://ucp-tr.gta.world',
            'Referer': 'https://ucp-tr.gta.world/'
        };

        let token: string = '';
        try {
            const tokenResponse = await axios.get(generateUrl, {
                headers: axiosHeaders,
                timeout: 10000
            });

            const rawToken = tokenResponse.data;
            if (typeof rawToken === 'string') {
                token = rawToken.replace(/^"|"$/g, '').trim();
            } else {
                token = rawToken?.token || rawToken?.data || String(rawToken);
            }
        } catch (error: any) {
            console.error('Banking Token Error:', error.response?.status, error.response?.data || error.message);
            return NextResponse.json({ ...newOrder, error: `Gateway Error (${error.response?.status || 'Network'})` });
        }

        if (!token) {
            return NextResponse.json({ ...newOrder, error: 'Token not received' });
        }

        // 3. Save token to order for webhook matching
        await updateOrderStatus(newOrder.id, 'Ödeme Bekleniyor', token);

        const redirectUrl = `${GATEWAY_BASE}/gateway/${encodeURIComponent(token)}`;

        // 4. Return the order with the redirect URL
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
