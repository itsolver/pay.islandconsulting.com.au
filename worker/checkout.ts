// checkout.ts
import Stripe from 'stripe';
import type { Handler, Env } from './types';

function reply(message: string, status: number): Response {
    return new Response(message, { status });
}

export const create: Handler = async (request, env) => {
    const url = new URL(request.url);
    const reference = url.searchParams.get('number'); // "REFERENCE"
    const amount = url.searchParams.get('amount'); // "AMOUNT"

    // Validate the input
    if (!reference || !amount || isNaN(Number(amount))) {
        return reply('Invalid request parameters', 400);
    }

    const stripe = new Stripe(env.STRIPE_API_KEY, {
        httpClient: Stripe.createFetchHttpClient(),
        apiVersion: '2023-10-16',
    });

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [{
                quantity: 1,
                price_data: {
                    currency: 'aud',
                    unit_amount: Number(amount) * 100, // Assuming amount is in dollars and needs to be converted to cents
                    product_data: {
                        name: `Island Consulting: ${reference}`,
                    },
                },
            }],
            success_url: `${url.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${url.origin}/canceled`,
        });

        return Response.redirect(session.url, 303);
    } catch (err) {
        return reply('Error creating session', 500);
    }
};
