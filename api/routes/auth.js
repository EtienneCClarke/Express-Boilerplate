const express = require("express");
const router = express.Router();

const jwt = require('../services/jwt');
const db = require('../services/db');
const crypt = require('../services/bcrypt');

router.post('/login', async (req, res) => {

    const { email, password } = req.body;

    const user = await db.getUserByEmail(email)

    if(user === null) return res.sendStatus(404);
    if(!await crypt.compare(password, user.password)) return res.sendStatus(500); // Authenticate User
    if(!delete user.password) return res.sendStatus(500); // Remove hashed password from user object

    // Generate tokens
    const accessToken = jwt.signAccessToken(user);
    const refreshToken = jwt.signRefreshToken(user);
    
    if(!db.updateUserRefreshToken(user.id, refreshToken)) return res.sendStatus(500);

    res.json({ accessToken, refreshToken });
})

router.post('/refreshToken', async (req, res) => {

    const { id, token } = req.body;

    if(id == null || token === null) return res.sendStatus(401);
    if(!await db.checkIfRefreshTokenExists(id, token)) return res.sendStatus(403);

    try {
        const user = jwt.verifyRefreshToken(token);
        const accessToken = jwt.signAccessToken({ id: user.id });
        res.json({ accessToken });
    } catch (e) {
        return res.sendStatus(403)
    }
})

router.delete('/logout', async (req, res) => {

    const { id } = req.body;

    if(!await db.checkIfUserExists(id)) return res.sendStatus(404)

    if(await db.updateUserRefreshToken(id, null)) return res.sendStatus(200);

    res.sendStatus(500);

})

module.exports = router;