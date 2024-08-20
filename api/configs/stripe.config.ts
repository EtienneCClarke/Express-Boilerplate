require('dotenv').config()
import { Stripe } from "stripe";

const CONFIG = {

    name: "Express-Boilerplate",
    clientUrl: process.env.CLIENT_URL,
    successUrl: `${process.env.CLIENT_URL}/checkout/success`,
    cancelledUrl: `${process.env.CLIENT_URL}/checkout/cancelled`,

    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,

    paymentMethods: <Stripe.Checkout.SessionCreateParams.PaymentMethodType[]> [
        'card',
        'revolut_pay',
        'paypal'
    ]

}

export { CONFIG }