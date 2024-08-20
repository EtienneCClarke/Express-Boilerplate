require('dotenv').config()

const CONFIG = {
    port: process.env.PORT,
    baseURL: `http://localhost:${process.env.PORT}`,
    deployEnvironment: process.env.DEPLOY_ENVIRONMENT
}

export { CONFIG }