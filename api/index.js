// index.js - Root module

const CONFIG = require('./configs/index.config')
const express = require('express');

const app = express();
app.use(express.json());

/* Routes */

const auth = require('./routes/auth');
app.use('/auth', auth);

const posts = require('./routes/posts');
app.use('/posts', posts);

/* Start listening */

app.listen(CONFIG.port, () => console.log(`EXPRESS: Server listening on port ${CONFIG.port}.`));

module.exports = app;