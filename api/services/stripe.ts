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
     * Creates a user in the database.
     * @param email - The user email.
     * @returns A promise that resolves with an stripe id if successull, null otherwise.
     * @static
    */
    static async createCustomer(user: User) {
        try {
            const customer = await stripe.customers.create({
                name: `${user.firstname} ${user.lastname}`,
                email: user.email
            });
            if(!await db.updateStripeCustomerId(user.id, customer.id)) throw new Error('Could not update user in database.');
            return customer;
        } catch (e) {
            console.error(`STRIPE_SERVICE createCustomer: ${e}`);
            return null;
        }
    }
    
    /**
     * Subscibes user to stripe subscription.
     * @param stripeId - The stripe id of the user.
     * @returns A promise that resolves with a subscription object if successful, null otherwise.
     * @static
    */
    static async createSubscription(stripeId: string): Promise<Object | null> {
        try {
            const subscription = await stripe.subscriptions.create({
                customer: stripeId,
                collection_method: 'charge_automatically'
            })
            return subscription;
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
     * Adds a card to a stripe customer.
     * @param card - The card object.
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

}

export { StripeService }