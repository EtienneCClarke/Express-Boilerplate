require('dotenv').config()

module.exports = {

    // The secret for the encryption of the jsonwebtoken
    JWTSecret: process.env.JWT_ACCESS_TOKEN_SECRET,
    JWTRefreshSecret: process.env.JWT_REFRESH_TOKEN_SECRET,
    JWTExpiration: '15s'

}