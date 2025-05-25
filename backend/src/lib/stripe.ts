import Stripe from 'stripe';
import config from '../Config';
if (!config.stripe.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(config.stripe.STRIPE_SECRET_KEY, {
    apiVersion: '2025-04-30.basil', // Use the latest stable version
});

export const createPaymentIntent = async (amount: number, currency: string = 'usd') => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        };
    } catch (error) {
        console.error('Error creating payment intent:', error);
        throw error;
    }
}; 