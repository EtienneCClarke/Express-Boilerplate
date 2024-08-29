import { z } from 'zod';

/* Refresh token */
export const refreshTokenSchema = z.strictObject({
    token: z.string()
});