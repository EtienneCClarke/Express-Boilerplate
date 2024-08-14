const CONFIG = require('../configs/jwt.config');
const jwt = require('jsonwebtoken');

/**
 * Class for JWT (JSON Web Token) related operations
 */
class JWTService {

    /**
     * Sign an access token with the user payload and JWT secret
     * @param {Object} user - The user payload to be encoded in the token
     * @param {Object} [options] - Optional configuration for the token
     * @returns {string} The signed access token
     */ 
    static signAccessToken(user, options) {
        return jwt.sign(user, CONFIG.JWTSecret, options ? options : { expiresIn: CONFIG.JWTExpiration });
    }
    
    /**
     * Sign a refresh token with the user payload and refresh JWT secret
     * @param {Object} user - The user payload to be encoded in the token
     * @param {Object} [options] - Optional configuration for the token
     * @returns {string} The signed refresh token
     */
    static signRefreshToken(user, options) {
        return jwt.sign(user, CONFIG.JWTRefreshSecret, options);
    }

    /**
     * Verify the provided access token
     * @param {string} token - The access token to be verified
     * @returns {Object} The decoded user payload if the token is valid
     * @throws {Error} If the token is invalid or expired
     */
    static verifyAccessToken(token) {
        return jwt.verify(token, CONFIG.JWTSecret, (err, user) => {
            if(err) throw Error;
            return user;
        })
    }
    
    /**
     * Verify the provided refresh token
     * @param {string} token - The refresh token to be verified
     * @returns {Object} The decoded user payload if the token is valid
     * @throws {Error} If the token is invalid or expired
     */
    static verifyRefreshToken(token) {
        return jwt.verify(token, CONFIG.JWTRefreshSecret, (err, user) => {
            if(err) throw Error;
            return user;
        })
    }

}

module.exports = JWTService;