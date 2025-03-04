import { Options } from "express-rate-limit"

const CONFIG: Partial<Options> = {
    windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
    max: 450, // Limit each IP to 450 requests per window (15 Minutes) ¬ 30 Requests per minute,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
}

export { CONFIG }