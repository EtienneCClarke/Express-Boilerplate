import rateLimit from "express-rate-limit";
import { CONFIG } from "../configs/rateLimit.config";

const rateLimiter = rateLimit(CONFIG)

export { rateLimiter }