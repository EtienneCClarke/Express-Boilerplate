import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

/* Define your tables here */

export const users = pgTable('Users', {
    id: uuid('id').primaryKey().default(crypto.randomUUID()),
    email: text('email').notNull().unique(),
    firstname: text('firstname').notNull(),
    lastname: text('lastname').notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    jwt_refresh_token: varchar('jwt_refresh_token', { length: 255 }),
    stripe_id: varchar('stripe_id', { length: 100 }),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().$onUpdate(() => new Date())
})

/* Make sure to export Insert and Select types for each table */

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;