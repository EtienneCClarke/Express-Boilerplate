import { Stripe } from "stripe";
import { CONFIG } from "../configs/stripe.config";
import { DBService as db } from "./db";
import { User } from "../models/User";
import { Card } from "../models/Stripe";

const stripe = new Stripe(<string> CONFIG.secretKey,{
    apiVersion: "2024-06-20",
    appInfo: { name: CONFIG.name }
});

/**
 * @class StripeService
 * @description A service class for interacting with the stripe api.
*/
class StripeService {

    /**
     * Creates a stripe customer.
     * @param email - The user email.
     * @returns A promise that resolves with an stripe id if successfull, null otherwise.
     * @static
    */
    static async createCustomer(user: User) {
        try {
            const customer = await stripe.customers.create({
                name: `${user.firstname} ${user.lastname}`,
                email: user.email
            });
            if(!await db.updateUser(<string> user.id, { stripe_id: customer.id })) throw new Error('Could not update user in database.');
            return customer;
        } catch (e) {
            console.error(`STRIPE_SERVICE createCustomer: ${e}`);
            return null;
        }
    }
    
    /**
     * Create checkout session for user.
     * @param options - Checkout session options.
     * @param amount - (optional) Amount of product, default 1.
     * @param mode - (optional) Checkout mode, default 'subscription'.
     * @returns A stripe checkout session object
     * @static
    */
    static async createCheckoutSession(
        params?: Omit<Stripe.Checkout.SessionCreateParams, 'success_url' | 'cancelled_url' | 'payment_method_types'>,
        options?: Stripe.RequestOptions
    ) {
        try {
            return stripe.checkout.sessions.create({
                ...params,
                payment_method_types: CONFIG.paymentMethods,
                success_url: `${CONFIG.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${CONFIG.cancelledUrl}?session_id={CHECKOUT_SESSION_ID}`,
            }, options);
        } catch (e) {
            console.error(`STRIPE_SERVICE createCheckoutSession: ${e}`);
            return null;
        }
    }

    /**
     * Create a subscription.
     * @param params - The subscription paramerters
     * @param options - The stripe request options.
     * @returns A product object if valid, null otherwise.
     * @static
    */
    static async createSubscription(params: Stripe.SubscriptionCreateParams, options?: Stripe.RequestOptions) {
        try {
            return stripe.subscriptions.create(params, options)
        } catch (e) {
            console.error(`STRIPE_SERVICE createSubscription: ${e}`);
            return null;
        }
    }

    /**
     * Adds a card to a stripe customer.
     * @param card - The card object.
     * @param options - The stripe request options.
     * @returns A product object if valid, null otherwise.
     * @static
    */
    static async createCardToken(card: Card, options?: Stripe.RequestOptions) {
        try {
            return stripe.tokens.create({ card }, options)
        } catch (e) {
            console.error(`STRIPE_SERVICE createCardToken: ${e}`);
            return null;
        }
    }
    
    /**
     * Constructs and verifies the signature of an event.
     * @returns An event object.
     * @static
    */
    static constructEvent(payload: string | Buffer, signature: string | Buffer) {
        try {
            return stripe.webhooks.constructEvent(payload, signature, <string> CONFIG.webhookSecret)
        } catch (e) {
            console.error(`STRIPE_SERVICE createCardToken: ${e}`);
            return null;
        }
    }
    
    /**
     * Retrieves product data.
     * @param productId - The Id of the product.
     * @returns A product object if valid, null otherwise.
     * @static
    */
    static async getProductData(productId: string) {
        try {
            return stripe.products.retrieve(productId);
        } catch (e) {
            console.error(`STRIPE_SERVICE createCheckoutSession: ${e}`);
            return null;
        }
    }
    
    /**
     * Retrieves stripe publishable key.
     * @returns Stripe publishable key if exists, null if there is an error.
     * @static
    */
    static async getPublishableKey(): Promise<string | null> {
        try {
            return <string> CONFIG.publishableKey;
        } catch (e) {
            console.error(`STRIPE_SERVICE createCheckoutSession: ${e}`);
            return null;
        }
    }

}

export { StripeService }