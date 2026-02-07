import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('stripe-signature') as string;

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        console.error('Webhook signature verification failed:', error.message);
        return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as any;
                const { orderId } = session.metadata;

                if (orderId) {
                    const orderRef = doc(db, 'orders', orderId);
                    await updateDoc(orderRef, {
                        status: 'active',
                        stripeSessionId: session.id,
                        paymentStatus: 'paid',
                        paidAt: Date.now(),
                    });
                    console.log(`Order ${orderId} marked as active via webhook.`);
                }
                break;
            }

            case 'account.updated': {
                const account = event.data.object as any;
                const { userId } = account.metadata;

                if (userId && account.details_submitted) {
                    const freelancerRef = doc(db, 'freelancerProfiles', userId);
                    await updateDoc(freelancerRef, {
                        onboardingComplete: true,
                        verified: true, // Auto-verify on Stripe success for enterprise trust
                    });
                    console.log(`Freelancer ${userId} onboarding completed.`);
                }
                break;
            }

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Webhook handling error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
