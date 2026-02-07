import { NextResponse } from 'next/server';
import { payhereConfig, generatePayHereHash } from '@/lib/payhere';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { orderId, clientId, amount, currency = 'LKR' } = await req.json();

        if (!orderId || !clientId || !amount) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Get client details
        const clientRef = doc(db, 'users', clientId);
        const clientSnap = await getDoc(clientRef);
        const clientData = clientSnap.data();

        if (!clientData) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        // 2. Generate security hash
        const hash = generatePayHereHash(
            payhereConfig.merchantId!,
            orderId,
            amount,
            currency,
            payhereConfig.merchantSecret!
        );

        // 3. Prepare PayHere parameters
        const params = {
            merchant_id: payhereConfig.merchantId,
            return_url: payhereConfig.returnUrl,
            cancel_url: payhereConfig.cancelUrl,
            notify_url: payhereConfig.notifyUrl,
            order_id: orderId,
            items: `TaskNest Order #${orderId}`,
            currency: currency,
            amount: amount.toFixed(2),
            hash: hash,
            first_name: clientData.name.split(' ')[0] || 'Client',
            last_name: clientData.name.split(' ').slice(1).join(' ') || 'User',
            email: clientData.email,
            phone: '', // Optional
            address: '',
            city: '',
            country: 'Sri Lanka',
        };

        const checkoutUrl = payhereConfig.isSandbox
            ? 'https://sandbox.payhere.lk/pay/checkout'
            : 'https://www.payhere.lk/pay/checkout';

        return NextResponse.json({ url: checkoutUrl, params });
    } catch (error: any) {
        console.error('PayHere Checkout error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
