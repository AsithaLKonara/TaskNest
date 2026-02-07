import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(req: Request) {
    try {
        const { orderId, clientId, freelancerId, amount, currency = 'usd' } = await req.json();

        if (!orderId || !clientId || !freelancerId || !amount) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Get freelancer's Stripe account ID
        const freelancerRef = doc(db, 'freelancerProfiles', freelancerId);
        const freelancerSnap = await getDoc(freelancerRef);
        const stripeAccountId = freelancerSnap.data()?.stripeAccountId;

        if (!stripeAccountId) {
            return NextResponse.json({ error: 'Freelancer has not set up payments' }, { status: 400 });
        }

        // 2. Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: currency,
                        product_data: {
                            name: `TaskNest Order #${orderId}`,
                        },
                        unit_amount: Math.round(amount * 100), // convert to cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/client/orders/${orderId}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/client/orders/${orderId}?payment=cancel`,
            payment_intent_data: {
                transfer_data: {
                    destination: stripeAccountId,
                    // Note: We'll set the amount later or use split payments logic
                    // In a production escrow, we typically hold the funds and transfer manually 
                    // or use 'on_behalf_of' logic.
                },
                // Application fee (e.g., 20% platform fee)
                application_fee_amount: Math.round(amount * 100 * 0.20),
                metadata: { orderId, clientId, freelancerId },
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe Checkout error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
