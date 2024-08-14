// user.js - User route module.

const express = require("express");
const router = express.Router();
const jwt = require('../services/jwt');

let refreshTokens = [];

router.post('/login', (req, res) => {

    // TODO: Authenticate user
    const username = req.body.username;
    const user = { name: username };

    // Generate tokens
    const accessToken = jwt.signAccessToken(user);
    const refreshToken = jwt.signRefreshToken(user)
    
    // TODO: Store refresh token in database
    refreshTokens.push(refreshToken);

    res.json({ accessToken, refreshToken });
})

router.post('/refreshToken', (req, res) => {

    const token = req.body.token;

    if(token === null) return res.sendStatus(401);

    // TODO: Check if refresh token exists
    if(token.includes(token)) return res.sendStatus(403);

    try {
        const user = jwt.verifyRefreshToken(token);
        const accessToken = jwt.signAccessToken({ user: user.name });
        res.json({ accessToken });
    } catch (e) {
        return res.sendStatus(403)
    }
})

router.post('')

module.exports = router;