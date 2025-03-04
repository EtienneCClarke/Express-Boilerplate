import { Request, Response, Router } from "express";
import { StripeService as stripe } from "../services/stripe";
import { ResponseService as rs } from "../services/response";
import { requireAuthentication } from "../middleware/requireAuthentication";
import { StatusCodes } from "http-status-codes";
import { validateData } from "../middleware/validation";
import { addCardSchema, checkoutSessionSchema, createCustomerSchema, createSubscriptionSchema } from "../schemas/stripe.schema";
import { DBService as db } from "../services/db";
import Stripe from "stripe";

const router = Router();

// Authenticated route
router.use(requireAuthentication);

router.post('/checkout-session', validateData(checkoutSessionSchema), async (req: Request, res: Response) => {
    try {

        // Get user
        const user = await db.getUserById(req.user.id);
        if(user === null) {
            rs.send('Could not find user.', StatusCodes.BAD_REQUEST, req, res);
            return;
        };


        // Check if user has stripe ID, if not generate one.
        if(user.stripe_id === null) {
            const customer = await stripe.createCustomer(user);
            if(customer === null) {
                rs.send('Could not create new customer.', StatusCodes.INTERNAL_SERVER_ERROR, req, res);
                return;
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
            rs.send('Could not create checkout session.', StatusCodes.BAD_REQUEST, req, res);
            return;
        }

        rs.send({ sessionId: session.id, url: session.url }, StatusCodes.OK, req, res);
    } catch (e) {
        rs.send('Could not create checkout session.', StatusCodes.INTERNAL_SERVER_ERROR, req, res);
    }
});

router.post('/create-customer', validateData(createCustomerSchema), async (req: Request, res: Response) => {
    try {

        // Get user
        const user = await db.getUserById(req.user.id);
        if(user === null) {
            rs.send('Could not find user.', StatusCodes.BAD_REQUEST, req, res);
            return;
        }
        
        // Check if user is already a customer
        if(user?.stripe_id !== null) {
            rs.send('Customer already exists.', StatusCodes.CONFLICT, req, res);
            return;
        }
        
        // Create customer
        const customer = await stripe.createCustomer({ ...user, ...req.body });
        if(customer === null) {
            rs.send('Could not create customer.', StatusCodes.INTERNAL_SERVER_ERROR, req, res);
            return;
        }
        

        rs.send({ message: 'Successfullly created new customer.', customer }, StatusCodes.CREATED, req, res);
    } catch (e) {
        rs.send('Could not create customer.', StatusCodes.INTERNAL_SERVER_ERROR, req, res);
    }
});

router.post('/create-subscription', validateData(createSubscriptionSchema), async (req: Request, res: Response) => {
    try {

        // Get user
        const user = await db.getUserById(req.user.id);
        if(user === null) {
            rs.send('Could not find user.', StatusCodes.BAD_REQUEST, req, res);
            return;
        }

        // Check if user exists
        if(user?.stripe_id === null || user?.stripe_id === undefined) {
            rs.send('User does not have a stripe ID.', StatusCodes.BAD_REQUEST, req, res);
            return;
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
            rs.send('Could not create subscription.', StatusCodes.INTERNAL_SERVER_ERROR, req, res);
            return;
        }

        rs.send({
            subscriptionId: subscription?.id,
            clientSecret: subscription?.latest_invoice === null ? '' : ((subscription?.latest_invoice as Stripe.Invoice).payment_intent as Stripe.PaymentIntent).client_secret
        }, StatusCodes.CREATED, req, res);
    } catch (e: any) {
        rs.send('Could not create subscription.', StatusCodes.INTERNAL_SERVER_ERROR, req, res);
    }
});

router.post('/add-card', validateData(addCardSchema),  async (req: Request, res: Response) => {

    // Get user stripe_id
    const stripeId = await db.getStripeId(req.user.id);
    if(stripeId === null) {
        rs.send('User does not have a stripe ID.', StatusCodes.BAD_REQUEST, req, res);
        return;
    };

    // Create token
    const cardToken = await stripe.createCardToken(req.body.card);

    // Validate card token
    if(cardToken === null) {
        rs.send('Could not create card token.', StatusCodes.BAD_REQUEST, req, res);
        return;
    };

    rs.send({ cardToken }, StatusCodes.OK, req, res);
});

router.get('/publishable-key', async (req: Request, res: Response) => {
    rs.send({ key: process.env.STRIPE_PUBLISHABLE_KEY }, StatusCodes.OK, req, res);
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

    rs.send('Success', StatusCodes.OK, req, res);

});

export { router as payments }