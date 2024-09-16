import { boolean, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

/* Define your tables here */
/* Make sure to export Insert and Select types for each table */

// Users
export const users = pgTable('Users', {
    id: uuid('id').primaryKey().default(crypto.randomUUID()),
    email: text('email').notNull().unique(),
    firstname: text('firstname').notNull(),
    lastname: text('lastname').notNull(),
    avatar: varchar('avatar', { length: 43 }),
    password: varchar('password', { length: 255 }).notNull(),
    jwt_refresh_token: varchar('jwt_refresh_token', { length: 255 }),
    stripe_id: varchar('stripe_id', { length: 100 }),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().$onUpdate(() => new Date()),
    verified: boolean('verified').default(false)
})

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

// Account recovery
export const recovery = pgTable('Recovery', {
    id: uuid('id').primaryKey().references(() => users.id),
    recovery_token: varchar('recovery_token', { length: 128 }),
    created_at: timestamp('created_at').notNull().$onUpdate(() => new Date())
});

export type InsertRecovery = typeof recovery.$inferInsert;
export type SelectRecovery = typeof recovery.$inferSelect;

// Account verification (For user registration)
export const verification = pgTable('Verification', {
    id: uuid('id').primaryKey().references(() => users.id),
    verification_token: varchar('verification_token', { length: 128 }),
    created_at: timestamp('created_at').notNull().$onUpdate(() => new Date())
});

export type InsertVerification = typeof verification.$inferInsert;
export type SelectVerification = typeof verification.$inferSelect;