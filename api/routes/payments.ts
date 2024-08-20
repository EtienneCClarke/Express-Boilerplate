import { Request, Response, Router } from "express";
import { StripeService as stripe } from "../services/stripe";
import { protectedRoute } from "../middleware/protectedRoute";
import { StatusCodes } from "http-status-codes";
import { validateData } from "../middleware/validation";
import { addCardSchema, checkoutSessionSchema } from "../schema/stripe";
import { DBService as db } from "../services/db";

const router = Router();

router.post('/checkout-session', [validateData(checkoutSessionSchema), protectedRoute], async (req: Request, res: Response) => {
    try {
        const user = await db.getUserById(req.user.id);
        if(user === null) return res.status(StatusCodes.BAD_REQUEST).send({ error: 'Could not find user email' });
        const session = await stripe.createCheckoutSession({
            customer: user.stripe_id == null ? undefined : user.stripe_id,
            mode: 'subscription',
            line_items: req.body.items.map((item: { id: string, quantity: number }) => {
                return {
                    price: item.id,
                    quantity: item.quantity
                }
            })
        })
        console.log(session);
        if(session === null) return res.status(StatusCodes.BAD_REQUEST).send({ error: 'Could not create checkout session.' });
        return res.status(StatusCodes.OK).send({ sessionId: session.id, url: session.url })
    } catch (e) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Could not complete checkout.' });
    }
});

router.post('/create-customer', protectedRoute, async (req: Request, res: Response) => {
    try {
        const user = await db.getUserById(req.user.id);
        if(user === null) return res.status(StatusCodes.BAD_REQUEST).send({ error: 'Could not find user.' });
        if(user?.stripe_id !== null) return res.status(StatusCodes.CONFLICT).send({ error: 'Customer already exists.' });
        const customer = await stripe.createCustomer(user);
        res.status(StatusCodes.CREATED).send({ message: 'Successfullly created new customer.', customer });
    } catch (e) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Could not add customer.' });
    }
});

// router.post('/add-card', [validateData(addCardSchema), protectedRoute],  async (req: Request, res: Response) => {

//     const stripeId = await db.getStripeCustomerId(req.user.id);
//     if(stripeId === null) return res.status(StatusCodes.BAD_REQUEST).send({ error: 'User does not exist.' });

//     const cardToken = await stripe.createCardToken(req.body.card);
//     if(cardToken === null) return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Could not create token.' });

// });

export { router as payments }