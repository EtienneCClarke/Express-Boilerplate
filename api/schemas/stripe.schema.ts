import { z } from 'zod';

/* Checkout session */
export const checkoutSessionSchema = z.strictObject({
    items: z.strictObject({
        id: z.string(),
        quantity: z.number().min(1)
    }).array().min(1)
});

/* Create customer */
export const createCustomerSchema = z.strictObject({
    shipping: z.strictObject({
        address: z.object({
            country: z.string(),
            postal_code: z.string(),
            line1: z.string(),
            city: z.string(),
            state: z.string().optional(),
        }),
        name: z.string(),
    }).optional(),
    address: z.object({
        country: z.string(),
        postal_code: z.string(),
        line1: z.string(),
        city: z.string(),
        state: z.string().optional(),
    }).optional(),
})

/* Create subscription */
export const createSubscriptionSchema = z.strictObject({
    priceId: z.string()
})

/* Add card */
export const addCardSchema = z.strictObject({
    card: z.strictObject({
        name: z.string(),
        number: z.string(),
        exp_month: z.string(),
        exp_year: z.string(),
        cvc: z.string(),
    })
})