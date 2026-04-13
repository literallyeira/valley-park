import { NextResponse } from 'next/server';
import { updateOrderStatus, getOrderByGatewayToken } from '../../lib/db';

const BANKING_AUTH_KEY = 'dmA1SIj5F9L0vRX1u2fkLaM9Rt7osgiHB7ywREaRiaNMry2NlAHQlhFTJYqkkGv4';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            console.error('Banking Webhook: Missing token');
            return NextResponse.redirect(new URL('/orders?payment=error', request.url));
        }

        const verifyUrl = `https://banking-tr.gta.world/gateway_token/${encodeURIComponent(token)}`;
        const r = await fetch(verifyUrl);

        if (!r.ok) {
            console.error('Banking Webhook: Token verification failed', r.status);
            return NextResponse.redirect(new URL('/orders?payment=error', request.url));
        }

        const data = await r.json();

        const isSuccess = ['success', 'paid', 'completed', 'approved', '1', 'payment_successful'].includes(String(data.status || data.message || data.success).toLowerCase());
        
        let orderId = data.query?.orderId || data.orderId;

        // If orderId isn't returned by the gateway, lookup by token!
        if (!orderId) {
            const orderRecord = await getOrderByGatewayToken(token);
            if (orderRecord) {
                orderId = orderRecord.id;
            }
        }

        if (!orderId) {
            console.error('Banking Webhook: No orderId returned from verification and not found in DB by token', data);
            return NextResponse.redirect(new URL('/orders?payment=error_no_order', request.url));
        }

        if (isSuccess) {
            await updateOrderStatus(orderId, 'Hazırlanıyor', token);
            return NextResponse.redirect(new URL('/orders?payment=success', request.url));
        } else {
            await updateOrderStatus(orderId, 'İptal Edildi', token);
            return NextResponse.redirect(new URL('/orders?payment=failed', request.url));
        }

    } catch (error) {
        console.error('Banking Webhook Error:', error);
        return NextResponse.redirect(new URL('/orders?payment=error', request.url));
    }
}
