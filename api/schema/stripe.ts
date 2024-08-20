import { z } from 'zod';

export const checkoutSessionSchema = z.object({
    items: z.object({
        id: z.string(),
        quantity: z.number()
    }).array().min(1)
});

export const addCardSchema = z.object({
    card: z.object({
        name: z.string(),
        number: z.string(),
        exp_month: z.string(),
        exp_year: z.string(),
        cvc: z.string(),
    })
})