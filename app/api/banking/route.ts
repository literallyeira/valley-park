import { NextResponse } from 'next/server';
import { updateOrderStatus } from '../../lib/db';

const BANKING_AUTH_KEY = 'dmA1SIj5F9L0vRX1u2fkLaM9Rt7osgiHB7ywREaRiaNMry2NlAHQlhFTJYqkkGv4';

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
        const token = authHeader?.replace('Bearer ', '') || '';

        // Check if the auth key matches the expected one or if it's passed in the body
        const body = await request.json();
        
        // Banking APIs usually send the key in header or body
        const providedKey = token || body.auth_key || body.token || '';

        if (providedKey !== BANKING_AUTH_KEY) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Extract order details from webhook body
        const orderId = body.order_id || body.referenceId || body.id;
        const paymentStatus = body.status || body.payment_status || body.message;

        if (!orderId) {
            return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
        }

        // Support 'payment_successful' from banking-tr.gta.world
        const isSuccess = [
            'success', 'paid', 'completed', 'approved', '1', 'payment_successful'
        ].includes(String(paymentStatus).toLowerCase());

        if (isSuccess) {
            // Update order status to Hazırlanıyor or Ödendi
            await updateOrderStatus(orderId, 'Hazırlanıyor');
            return NextResponse.json({ success: true, message: 'Order payment verified and status updated.' });
        } else {
            // Alternatively set to İptal Edildi if failed
            await updateOrderStatus(orderId, 'İptal Edildi');
            return NextResponse.json({ success: true, message: 'Payment failed, order cancelled.' });
        }

    } catch (error) {
        console.error('Banking Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
