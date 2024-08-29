import { Request, Response, Router, raw } from "express";
import { StripeService as stripe } from "../services/stripe";
import { protectedRoute } from "../middleware/protectedRoute";
import { StatusCodes } from "http-status-codes";
import { validateData } from "../middleware/validation";
import { addCardSchema, checkoutSessionSchema, createCustomerSchema, createSubscriptionSchema } from "../schemas/stripe.schema";
import { DBService as db } from "../services/db";
import Stripe from "stripe";

const router = Router();

router.post('/checkout-session', [validateData(checkoutSessionSchema), protectedRoute], async (req: Request, res: Response) => {
    try {

        // Get user
        const user = await db.getUserById(req.user.id);
        if(user === null) {
            return res.status(StatusCodes.BAD_REQUEST).send({ error: 'Could not find user' });
        } 

        // Check if user has stripe ID, if not generate one.
        if(user.stripe_id === null) {
            const customer = await stripe.createCustomer(user);
            if(customer === null) {
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Could not create new customer.' });
            } else {
                user.stripe_id = customer.id;
            }
        }

        // Create session
        const session = await stripe.createCheckoutSession({
            customer: user.stripe_id ? user.stripe_id : undefined,
            mode: 'subscription',
            line_items: req.body.items.map((item: { id: string, quantity: number }) => {
                return {
                    price: item.id,
                    quantity: item.quantity
                }
            })
        })

        // Validate session
        if(session === null) {
            return res.status(StatusCodes.BAD_REQUEST).send({ error: 'Could not create checkout session.' });
        }

        return res.status(StatusCodes.OK).send({ sessionId: session.id, url: session.url })
    } catch (e) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Could create checkout session.' });
    }
});

router.post('/create-customer', [validateData(createCustomerSchema), protectedRoute], async (req: Request, res: Response) => {
    try {

        // Get user
        const user = await db.getUserById(req.user.id);
        if(user === null) {
            return res.status(StatusCodes.BAD_REQUEST).send({ error: 'Could not find user.' });
        }
        
        // Check if user is already a customer
        if(user?.stripe_id !== null) {
            return res.status(StatusCodes.CONFLICT).send({ error: 'Customer already exists.' });
        }
        
        // Create customer
        const customer = await stripe.createCustomer({ ...user, ...req.body });
        if(customer === null) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Could not create customer' });
        }
        
        res.status(StatusCodes.CREATED).send({ message: 'Successfullly created new customer.', customer });
    } catch (e) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Could not add customer.' });
    }
});

router.post('/create-subscription', [validateData(createSubscriptionSchema), protectedRoute], async (req: Request, res: Response) => {
    try {

        // Get user
        const user = await db.getUserById(req.user.id);
        if(user === null) {
            return res.status(StatusCodes.BAD_REQUEST).send({ error: 'Could not find user.' });
        }

        // Check if user exists
        if(user?.stripe_id === null || user?.stripe_id === undefined) {
            return res.status(StatusCodes.CONFLICT).send({ error: 'Customer does not exist.' });
        }

        // Create subscription
        const subscription = await stripe.createSubscription({
            customer: user.stripe_id,
            items: [{ price: req.body.priceId }],
            payment_behavior: 'default_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent']
        });

        // Validate subscription
        if(subscription === null) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Could not create subscription. '});
        }

        res.status(StatusCodes.CREATED).send({
            subscriptionId: subscription?.id,
            clientSecret: subscription?.latest_invoice === null ? '' : (<Stripe.PaymentIntent>(<Stripe.Invoice> subscription?.latest_invoice).payment_intent).client_secret
        });
    } catch (e: any) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'Could not add customer.' , error: e });
    }
});

router.post('/add-card', [validateData(addCardSchema), protectedRoute],  async (req: Request, res: Response) => {

    // Get user stripe_id
    const stripeId = await db.getStripeId(req.user.id);
    if(stripeId === null) {
        return res.status(StatusCodes.BAD_REQUEST).send({ error: 'User does not exist.' });
    }

    // Create token
    const cardToken = await stripe.createCardToken(req.body.card);

    // Validate card token
    if(cardToken === null) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Could not create token.' });
    }

});

router.get('/publishable-key', protectedRoute, async (req: Request, res: Response) => {

    return res.status(StatusCodes.OK).send({ publishableKey: await stripe.getPublishableKey() })

});

router.post('/webhook', async (req: Request, res: Response) => {

    let event: any = req.body;

    const data = event.data.object;

    
    // Handle the event
    // Review important events for Billing webhooks
    // https://stripe.com/docs/billing/webhooks
    switch (event.type) {
        case 'payment_intent.succeeded':
            console.log(data);
            // Then define and call a function to handle the event payment_intent.succeeded
            break;
        case 'customer.subscription.created':
            
        // ... handle other event types
        default:
            console.error(`Stripe Webhook: Unhandled event type ${event.type}`);
    }

    res.json({ received: true });

});

export { router as payments }