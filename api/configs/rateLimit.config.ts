import { Options } from "express-rate-limit"

const CONFIG: Partial<Options> = {
    windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
    max: 100, // Limit each IP to 100 requests per window (15 Minutes),
    message: 'Too many requests from this IP, please try again after 15 minutes.'
}

export { CONFIG }