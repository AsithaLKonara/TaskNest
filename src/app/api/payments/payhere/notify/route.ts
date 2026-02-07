import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { holdEscrow } from '@/lib/wallet-utils';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const body = Object.fromEntries(formData);

        // 1. Verify PayHere Signature
        const merchant_id = body.merchant_id as string;
        const order_id = body.order_id as string;
        const payhere_amount = body.payhere_amount as string;
        const payhere_currency = body.payhere_currency as string;
        const status_code = body.status_code as string;
        const md5sig = body.md5sig as string;

        const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET!;
        const hashedSecret = crypto.createHash('md5').update(merchant_secret).digest('hex').toUpperCase();
        const localSig = crypto
            .createHash('md5')
            .update(merchant_id + order_id + payhere_amount + payhere_currency + status_code + hashedSecret)
            .digest('hex')
            .toUpperCase();

        if (localSig !== md5sig) {
            console.error('PayHere IPN Signature Mismatch');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        // 2. Handle Payment Status
        if (status_code === '2') { // 2 = Success
            const orderRef = doc(db, 'orders', order_id);
            const orderSnap = await getDoc(orderRef);

            if (orderSnap.exists()) {
                const orderData = orderSnap.data();

                // Update Order Status
                await updateDoc(orderRef, {
                    status: 'active',
                    escrowStatus: 'held',
                    payherePaymentId: body.payment_id,
                    paidAt: Date.now(),
                });

                // Lock funds in Escrow (Record for client)
                await holdEscrow(order_id, orderData.clientId, orderData.price);

                console.log(`Payment successful for Order ${order_id}. Funds locked in Escrow.`);
            }
        } else if (status_code === '-2') { // -2 = Failed
            console.log(`Payment failed for Order ${order_id}`);
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('PayHere IPN Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
