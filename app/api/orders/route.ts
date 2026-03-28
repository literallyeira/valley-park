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

const BANKING_AUTH_KEY = 'sGW1R81tH7rqBlGBMmXPZ6QAWdK2YuLHvSGIYiP5oMjD4KTZmIkYJ7wguDg0tudd';
const GATEWAY_BASE = 'https://banking-tr.gta.world';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const amount = data.total;

        // 1. Create the order in pending state first
        const newOrder = await createOrder({ ...data, status: 'Ödeme Bekleniyor' });

        // 2. Generate banking gateway token
        // We add a User-Agent to avoid being blocked by Cloudflare (403 Forbidden)
        const commonHeaders = {
            'Authorization': `Bearer ${BANKING_AUTH_KEY}`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*'
        };

        const generateUrl = `${GATEWAY_BASE}/gateway_token/generateToken?price=${amount}&type=0&order_id=${newOrder.id}`;
        
        console.log('Fetching banking token from:', generateUrl);

        let tokenRes = await fetch(generateUrl, { 
            method: 'GET',
            headers: commonHeaders 
        });

        // 403 often means WAF block. If that happens, we try without Bearer in headers (sometimes it's sensitive)
        // or we try passing it in the query string.
        if (tokenRes.status === 403) {
            console.log('403 encountered, trying with auth_key in query string...');
            tokenRes = await fetch(`${generateUrl}&auth_key=${BANKING_AUTH_KEY}`, {
                method: 'GET',
                headers: { 'User-Agent': commonHeaders['User-Agent'] }
            });
        }

        if (!tokenRes.ok) {
            const errText = await tokenRes.text();
            console.error('Banking Token Error:', tokenRes.status, errText);
            return NextResponse.json({ ...newOrder, error: `Gateway Error (${tokenRes.status})` });
        }

        const rawToken = await tokenRes.text();
        let token: string;
        try {
            const parsed = JSON.parse(rawToken);
            token = typeof parsed === 'string' ? parsed : (parsed?.token || parsed?.data || String(parsed));
        } catch {
            token = rawToken.replace(/^"|"$/g, '').trim();
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
