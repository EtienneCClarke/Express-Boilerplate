module.exports = {
    
    url: process.env.POSTGRES_URL,
    prismaUrl: process.env.POSTGRES_PRISMA_URL,
    urlNonPooling: process.env.POSTGRES_URL_NON_POOLING,

    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE

}