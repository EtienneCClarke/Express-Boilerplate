import express, { Express } from "express";
import serverless from "serverless-http";
import { CONFIG } from "./configs/index.config";
import { auth } from "./routes/auth";
import { posts } from "./routes/posts";
import { payments } from "./routes/payments";

const app: Express = express();
app.use(express.json());

/* Routes */

app.use('/auth', auth);
app.use('/posts', posts);
app.use('/stripe', payments)

/* Start server */

if(CONFIG.deployEnvironment === 'aws-lambda') {
    module.exports.handler = serverless(app);
} else {
    app.listen(CONFIG.port || 3000, () => console.log(`EXPRESS: Server listening on port ${CONFIG.port || 3000}.`));
    module.exports = app;
}