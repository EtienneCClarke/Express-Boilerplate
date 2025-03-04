import express, { Express } from "express";
import { CONFIG } from "./configs/index.config";
import { rateLimiter } from "./middleware/rateLimiter";
import { rayIdentifier } from "./middleware/rayIdentifier";
import { auth } from "./routes/auth";
import { posts } from "./routes/posts";
import { payments } from "./routes/payments";
import { account } from "./routes/account";
import { requestLog } from "./middleware/requestLog";

const app: Express = express();

/* Universal middleware */
app.use(express.json());
app.use(rateLimiter);
app.use(rayIdentifier);
app.use(requestLog);

/* Routes */
app.use('/auth', auth);
app.use('/account', account);
app.use('/stripe', payments)
app.use('/posts', posts);

/* Start server */
app.listen(CONFIG.port, () => console.log(`EXPRESS: Server listening on port ${CONFIG.port}.`));
module.exports = app;