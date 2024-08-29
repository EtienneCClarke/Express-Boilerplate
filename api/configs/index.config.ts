require('dotenv').config()

const CONFIG = {
    port: process.env.PORT || 3000,
    baseURL: `http://localhost:${process.env.PORT || 3000}`,
}

export { CONFIG }