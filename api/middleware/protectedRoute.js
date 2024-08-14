
const jwt = require("../services/jwt");

function protectedRoute(req, res, next) {

    const verified = verifyAccessToken(req.get('authorization'));
    if(verified?.error) return res.sendStatus(verified.error);
    
    req.user = verified;
    next();

}

function verifyAccessToken(authHeader) {

    const token = authHeader && authHeader.split(' ')[1];
    
    if(token === null) return { error: 401 };

    try {
        return jwt.verifyAccessToken(token);
    } catch (e) {
        return { error: 401 };
    }
}

module.exports = {
    protectedRoute
};