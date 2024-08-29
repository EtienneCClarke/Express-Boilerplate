import { z } from 'zod';
import { validatePassword } from '../utils/validatePassword';

/* Register new user */
export const userRegistrationSchema = z
    .strictObject({
        email: z.string().email(),
        firstname: z.string().min(1),
        lastname: z.string().min(1),
        password: z.string().min(8),
    })
    .superRefine(validatePassword);

/* Login */
export const userLoginSchema =
    z.strictObject({
        email: z.string().email(),
        password: z.string().min(8),
    })
    .superRefine(validatePassword);

/* Update user */
export const userUpdateSchema = z.strictObject({
        email: z.string().email().optional(),
        firstname: z.string().min(1).optional(),
        lastname: z.string().min(1).optional(),
        password: z.string().min(8).optional()
    })
    .superRefine(validatePassword)

/* Delete user */
export const userDeletionSchema = z
    .strictObject({
        password: z.string().min(8),
    })
    .superRefine(validatePassword);