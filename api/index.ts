import express, { Express } from "express";
import { CONFIG } from "./configs/index.config";
import { rateLimiter } from "./middleware/rateLimiter";
import { auth } from "./routes/auth";
import { posts } from "./routes/posts";
import { payments } from "./routes/payments";
import { account } from "./routes/account";

const app: Express = express();

/* Universal middleware */
app.use(express.json());
app.use(rateLimiter)

/* Routes */

app.use('/auth', auth);
app.use('/account', account);
app.use('/stripe', payments)
app.use('/posts', posts);

/* Start server */

app.listen(CONFIG.port, () => console.log(`EXPRESS: Server listening on port ${CONFIG.port}.`));
module.exports = app;