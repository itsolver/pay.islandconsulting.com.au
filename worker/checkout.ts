import Stripe from 'stripe';
import type { Handler } from './types';

// Injected during `build` script
declare const STRIPE_API_KEY: string;

function reply(message: string, status: number): Response {
	return new Response(message, { status });
}

/**
 * POST /api/checkout
 */
export const create: Handler = async function (request, env) {
	const url = new URL(request.url);
	const reference = url.searchParams.get("number");
	const amount = url.searchParams.get("amount");

	if (!reference || !amount || isNaN(Number(amount))) {
		return reply("Invalid request parameters", 400);
	}

	const stripe = new Stripe(env.STRIPE_API_KEY, {
		httpClient: Stripe.createFetchHttpClient(),
		apiVersion: "2024-06-20"
	});

	try {
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			mode: "payment",
			line_items: [{
				quantity: 1,
				price_data: {
					currency: "aud",
					unit_amount: Number(amount) * 100, // Assuming amount is in dollars and needs to be converted to cents
					product_data: {
						name: `Island Consulting: ${reference}`
					}
				}
			}],
			success_url: `${url.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${url.origin}/canceled`
		});

		return Response.redirect(session.url, 303);
	} catch (err) {
		return reply("Error creating session", 500);
	}
}

/**
 * GET /api/checkout?sessionid=XYZ
 */
export const lookup: Handler = async function (request) {
	const { searchParams } = new URL(request.url);

	const ident = searchParams.get('sessionid');
	if (!ident) return new Response('Missing "sessionid" parameter', { status: 400 });

	try {
		const stripe = new Stripe(STRIPE_API_KEY, {
			httpClient: Stripe.createFetchHttpClient(),
			apiVersion: "2024-06-20"
		});
		const session = await stripe.checkout.sessions.retrieve(ident);
		const output = JSON.stringify(session, null, 2);
		return new Response(output, {
			headers: {
				'content-type': 'application/json; charset=utf-8'
			}
		});
	} catch (err) {
		console.error('Error retrieving Session:', err);
		return new Response('Error retrieving Session JSON data', { status: 500 });
	}
}

async function handleRequest(request: Request): Promise<Response> {
	// Your existing routing logic here
	// Ensure all code paths return a Response object
	return new Response('Not Found', { status: 404 }); // Default response if no route matches
}

addEventListener('fetch', event => {
	event.respondWith(handleRequest(event.request));
});
