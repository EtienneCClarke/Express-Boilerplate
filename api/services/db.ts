import { sql as vercelSql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { InsertUser, users } from "../schemas/db.schema";
import { User } from "../models/User";
import { eq, sql } from "drizzle-orm";

const db = drizzle(vercelSql);

/**
 * @class DBService
 * @description A service class for interacting with the database.
*/
class DBService {

    /**
     * Creates a user in the database.
     * @param user - The user object.
     * @returns A promise that resolves with true if successful, false otherwise.
     * @static
    */
    static async createUser(user: InsertUser): Promise<boolean> {
        try {
            const { rowCount } = await db.insert(users).values(user);
            return rowCount === 1;
        } catch (e) {
            console.error(`DB_SERVICE createUser: ${e}`);
            return false;
        }
    }

    /**
     * Delete user from database.
     * @param id - The ID of the user to remove.
     * @returns A promise that resolves with true if the user is deleted, false otherwise.
     * @static
    */
    static async deleteUser(id: string): Promise<boolean> {
        try {
            const { rowCount } = await db.delete(users).where(eq(users.id, id));
            return rowCount === 1;
        } catch (e) {
            console.error(`DB_SERVICE checkIfUserExists: ${e}`);
            return false;
        }
    }

    /**
     * Retrieves a user from the database.
     * @param id - The id of the user to retrieve.
     * @returns A promise that resolves with the user object, null otherwise.
     * @static
    */
    static async getUserById(id: string): Promise<User | null> {
        try {
            const res = await db.select({
                id: users.id,
                email: users.email,
                firstname: users.firstname,
                lastname: users.lastname,
                stripeId: users.stripe_id
            }).from(users).where(eq(users.id, id))
            if(res.length === 1) return <User> res[0];
            return null;
        } catch (e) {
            console.error(`DB_SERVICE getUserById: ${e}`);
            return null;
        }
    }

    /**
     * Retrieves a user from the database by email.
     * @param email - The email of the user to retrieve.
     * @returns A promise that resolves with the user object, null otherwise.
     * @static
    */
    static async getUserByEmail(email: string): Promise<User | null> {
        try {
            const res = await db.select({
                id: users.id,
                email: users.email,
                firstname: users.firstname,
                lastname: users.lastname,
                avatar: users.avatar,
                stripeId: users.stripe_id
            }).from(users).where(eq(users.email, email))
            if(res.length === 1) return <User> res[0];
            return null;
        } catch (e) {
            console.error(`DB_SERVICE getUserByEmail: ${e}`);
            return null;
        }
    }
    
    /**
     * Retrieves a user from the database including their hashed password.
     * @param id - The id of the user to retrieve.
     * @returns A promise that resolves with the user object, null otherwise.
     * @static
    */
    static async getUserByIdWithPassword(id: string): Promise<User | null> {
        try {
            const res = await db.select({
                id: users.id,
                email: users.email,
                firstname: users.firstname,
                lastname: users.lastname,
                avatar: users.avatar,
                stripeId: users.stripe_id,
                password: users.password
            }).from(users).where(eq(users.id, id))
            if(res.length === 1) return <User> res[0];
            return null;
        } catch (e) {
            console.error(`DB_SERVICE getUserById: ${e}`);
            return null;
        }
    }

    /**
     * Retrieves a user from the database by email including their hashed password.
     * @param email - The email of the user to retrieve.
     * @returns A promise that resolves with the user object, null otherwise.
     * @static
    */
    static async getUserByEmailWithPassword(email: string): Promise<User | null> {
        try {
            const res = await db.select({
                id: users.id,
                email: users.email,
                firstname: users.firstname,
                lastname: users.lastname,
                avatar: users.avatar,
                stripeId: users.stripe_id,
                password: users.password
            }).from(users).where(eq(users.email, email))
            if(res.length === 1) return <User> res[0];
            return null;
        } catch (e) {
            console.error(`DB_SERVICE getUserByEmail: ${e}`);
            return null;
        }
    }

    /**
     * Retrieves a users password from the database.
     * @param id - The id of the user to retrieve.
     * @returns A promise that resolves with the user object, null otherwise.
     * @static
    */
    static async getUserPasswordById(id: string): Promise<User | null> {
        try {
            const res = await db.select({
                password: users.password
            }).from(users).where(eq(users.id, id))
            if(res.length === 1) return <User> res[0];
            return null;
        } catch (e) {
            console.error(`DB_SERVICE getUserPasswordById: ${e}`);
            return null;
        }
    }

    /**
     * Retrieves a users id and password from the database.
     * @param email - The email of the user to retrieve.
     * @returns A promise that resolves with the user object, null otherwise.
     * @static
    */
    static async getUserPasswordByEmail(email: string): Promise<User | null> {
        try {
            const res = await db.select({
                id: users.id,
                password: users.password
            }).from(users).where(eq(users.email, email))
            if(res.length === 1) return <User> res[0];
            return null;
        } catch (e) {
            console.error(`DB_SERVICE getUserPasswordByEmail: ${e}`);
            return null;
        }
    }

    /**
     * Retrieves a users email from the database.
     * @param id - The id of the user to retrieve.
     * @returns A promise that resolves with the user email, null otherwise.
     * @static
    */
    static async getUserEmail(id: string): Promise<string | null> {
        try {
            const res = await db.select({
                email: users.email,
            }).from(users).where(eq(users.id, id))
            if(res.length === 1) return res[0].email;
            return null;
        } catch (e) {
            console.error(`DB_SERVICE getUserEmail: ${e}`);
            return null;
        }
    }

    /**
     * Updates the refresh token for a user in the database.
     * @param id - The ID of the user to update.
     * @param user - The user object with updated values.
     * @returns A promise that resolves with true if the update was successful, false otherwise.
     * @static
    */
    static async updateUser(id: string, user: User): Promise<boolean> {
        try {
            const { rowCount } = await db.update(users).set(user).where(eq(users.id, id));
            return rowCount === 1;
        } catch (e) {
            console.error(`DB_SERVICE updateUser: ${e}`);
            return false;
        }
    }

    /**
     * Checks if a refresh token exists for a user in the database.
     * @param id - The ID of the user to check.
     * @param refreshToken - The refresh token to check.
     * @returns A promise that resolves with true if the refresh token exists, false otherwise.
     * @static
    */
    static async checkIfRefreshTokenExists(refreshToken: string): Promise<boolean> {
        try {
            const res = await db.select({ id: users.id }).from(users).where(eq(users.jwt_refresh_token, refreshToken));
            return res.length === 1;
        } catch (e) {
            console.error(`DB_SERVICE updateUserRefreshToken: ${e}`);
            return false;
        }
    }

    /**
     * Checks if a user exists in the database.
     * @param id - The ID of the user to check.
     * @returns A promise that resolves with true if the user exists, false otherwise.
     * @static
    */
    static async checkIfUserExistsById(id: string): Promise<boolean> {
        try {
            const res = await db.select({ id: users.id }).from(users).where(eq(users.id, id));
            return res.length === 1;
        } catch (e) {
            console.error(`DB_SERVICE checkIfUserExists: ${e}`);
            return false;
        }
    }
    
    /**
     * Checks if a user exists in the database.
     * @param email - The email of the user to check.
     * @returns A promise that resolves with true if the user exists, false otherwise.
     * @static
    */
    static async checkIfUserExistsByEmail(email: string): Promise<boolean> {
        try {
            const res = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
            return res.length === 1;
        } catch (e) {
            console.error(`DB_SERVICE checkIfUserExists: ${e}`);
            return false;
        }
    }
    
    /**
     * Retrieves the stripe id for a specified user.
     * @param id - Id of the user.
     * @returns A promise that resolves with the stripe id if the user exists, null otherwise.
     * @static
    */
    static async getStripeId(id: string): Promise<string | null> {
        try {
            const res = await db.select({
                stripe_id: users.stripe_id
            }).from(users).where(eq(users.id, id))
            if(res.length === 1) return res[0].stripe_id;
            return null;
        } catch (e) {
            console.error(`DB_SERVICE getStripeId: ${e}`);
            return null;
        }
    }
    
    /**
     * Retrieves the avatar file name for a specified user.
     * @param id - Id of the user.
     * @returns A promise that resolves with the users avatar file name if the user has one set, null otherwise.
     * @static
    */
    static async getAvatar(id: string): Promise<string | null> {
        try {
            const res = await db.select({
                avatar: users.avatar
            }).from(users).where(eq(users.id, id))
            if(res.length === 1) return res[0].avatar;
            return null;
        } catch (e) {
            console.error(`DB_SERVICE getAvatar: ${e}`);
            return null;
        }
    }

}

export { DBService }