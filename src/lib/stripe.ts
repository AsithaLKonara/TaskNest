import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27', // Use latest or stable version
    appInfo: {
        name: 'TaskNest',
        version: '0.1.0',
    },
});

// Client-side Stripe promise
export const getStripe = () => {
    return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
};
