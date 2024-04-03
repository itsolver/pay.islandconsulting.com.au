import Stripe from 'stripe';
import type { Handler, Env } from './types';

// Removed the global Stripe client instantiation

function reply(message: string, status: number): Response {
    return new Response(message, { status });
}

/**
 * POST /api/checkout
 * This function now properly receives the `env` parameter.
 */
export const create: Handler = async (request, env) => {
    // Instantiate the Stripe client inside the function where `env` is available
    const stripe = new Stripe(env.STRIPE_API_KEY, {
        httpClient: Stripe.createFetchHttpClient(),
        apiVersion: '2023-10-16',
    });

    const { origin } = new URL(request.url);

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [{
                quantity: 1,
                price_data: {
                    currency: 'aud',
                    unit_amount: 80000,
                    product_data: {
                        name: 'Island Consulting',
                    },
                },
            }],
            success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/canceled`,
        });

        return Response.redirect(session.url, 303);
    } catch (err) {
        return reply('Error creating session', 500);
    }
};

/**
 * GET /api/checkout?sessionid=XYZ
 * This function also properly receives the `env` parameter.
 */
export const lookup: Handler = async (request, env) => {
    // Instantiate the Stripe client inside the function
    const stripe = new Stripe(env.STRIPE_API_KEY, {
        httpClient: Stripe.createFetchHttpClient(),
        apiVersion: '2023-10-16',
    });

    const { searchParams } = new URL(request.url);
    const ident = searchParams.get('sessionid');
    if (!ident) return reply('Missing "sessionid" parameter', 400);

    try {
        const session = await stripe.checkout.sessions.retrieve(ident);
        const output = JSON.stringify(session, null, 2);
        return new Response(output, {
            headers: {
                'content-type': 'application/json; charset=utf-8',
            },
        });
    } catch (err) {
        return reply('Error retrieving Session JSON data', 500);
    }
};
