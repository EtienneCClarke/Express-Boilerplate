import { z } from 'zod';

export const refreshTokenSchema = z.object({
    token: z.string()
});