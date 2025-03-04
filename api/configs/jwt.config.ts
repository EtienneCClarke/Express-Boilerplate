require('dotenv').config()

const CONFIG = {

    JWTSecret: process.env.JWT_ACCESS_TOKEN_SECRET,
    JWTRefreshSecret: process.env.JWT_REFRESH_TOKEN_SECRET,
    JWTExpiration: 15 * 60 // 15 minutes

}

export { CONFIG }