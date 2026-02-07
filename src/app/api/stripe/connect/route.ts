import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // 1. Get user profile
        const freelancerRef = doc(db, 'freelancerProfiles', userId);
        const freelancerSnap = await getDoc(freelancerRef);

        if (!freelancerSnap.exists()) {
            return NextResponse.json({ error: 'Freelancer profile not found' }, { status: 404 });
        }

        const freelancerData = freelancerSnap.data();
        let stripeAccountId = freelancerData.stripeAccountId;

        // 2. Create Stripe Account if it doesn't exist
        if (!stripeAccountId) {
            const account = await stripe.accounts.create({
                type: 'express',
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                metadata: { userId },
            });
            stripeAccountId = account.id;

            // Save to DB
            await updateDoc(freelancerRef, { stripeAccountId });
        }

        // 3. Create Account Link
        const accountLink = await stripe.accountLinks.create({
            account: stripeAccountId,
            refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/freelancer/onboarding/stripe?userId=${userId}&refresh=true`,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/freelancer/onboarding/stripe?userId=${userId}&success=true`,
            type: 'account_onboarding',
        });

        return NextResponse.json({ url: accountLink.url });
    } catch (error: any) {
        console.error('Stripe Connect error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
