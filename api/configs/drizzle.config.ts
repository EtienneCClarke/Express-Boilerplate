require('dotenv').config()
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./api/schemas/db.schema.ts",
    dialect: 'postgresql',
    out: './migrations',
    dbCredentials: {
        url: process.env.POSTGRES_URL!,
        user: process.env.POSTGRES_USER,
        host: process.env.POSTGRES_HOST,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DATABASE
    }
})