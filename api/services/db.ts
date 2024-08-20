import { sql } from "@vercel/postgres";
import { User } from "../models/User";
import { StripeService as stripe } from "./stripe";

/**
 * @class DBService
 * @description A service class for interacting with the database.
*/
class DBService {

    /**
     * Creates a user in the database.
     * @param user - The user object.
     * @returns A promise that resolves with true if successul or false if not.
     * @static
    */
    static async createUser(user: User): Promise<boolean> {
        try {
            const { rowCount } = await sql`
                INSERT INTO Users (email, firstname, lastname, password, stripe_id)
                VALUES (${user.email}, ${user.firstname}, ${user.lastname}, ${user.password})
            `;
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
            const { rowCount } = await sql`DELETE FROM Users WHERE id = ${id};`
            return rowCount === 1;
        } catch (e) {
            console.error(`DB_SERVICE checkIfUserExists: ${e}`);
            return false;
        }
    }

    /**
     * Retrieves a user from the database.
     * @param id - The id of the user to retrieve.
     * @returns A promise that resolves with the user object or null if not found.
     * @static
    */
    static async getUserById(id: string): Promise<User | null> {
        try {
            const { rowCount, rows } = await sql`SELECT id, email, firstname, lastname, stripe_id FROM Users WHERE id = ${id};`;
            if(rowCount === 1) return <User> rows[0];
            return null;
        } catch (e) {
            console.error(`DB_SERVICE getUserById: ${e}`);
            return null;
        }
    }

    /**
     * Retrieves a user from the database by email.
     * @param email - The email of the user to retrieve.
     * @returns A promise that resolves with the user object or null if not found.
     * @static
    */
    static async getUserByEmail(email: string): Promise<User | null> {
        try {
            const { rowCount, rows } = await sql`SELECT id, email, firstname, lastname, stripe_id FROM Users WHERE email = ${email};`;
            if(rowCount === 1) return <User> rows[0];
            return null;
        } catch (e) {
            console.error(`DB_SERVICE getUserByEmail: ${e}`);
            return null;
        }
    }

    /**
     * Retrieves a users password from the database.
     * @param id - The id of the user to retrieve.
     * @returns A promise that resolves with the user object or null if not found.
     * @static
    */
    static async getUserPasswordById(id: string): Promise<User | null> {
        try {
            const { rowCount, rows } = await sql`SELECT password FROM Users WHERE id = ${id};`;
            if(rowCount === 1) return <User> rows[0];
            return null;
        } catch (e) {
            console.error(`DB_SERVICE getUserPasswordById: ${e}`);
            return null;
        }
    }

    /**
     * Retrieves a users email from the database.
     * @param id - The id of the user to retrieve.
     * @returns A promise that resolves with the user email or null if not found.
     * @static
    */
    static async getUserEmail(id: string): Promise<string | null> {
        try {
            const { rowCount, rows } = await sql`SELECT email FROM Users WHERE id = ${id};`;
            if(rowCount === 1) return rows[0].email;
            return null;
        } catch (e) {
            console.error(`DB_SERVICE getUserEmail: ${e}`);
            return null;
        }
    }

    /**
     * Retrieves a users id and password from the database.
     * @param email - The email of the user to retrieve.
     * @returns A promise that resolves with the user object or null if not found.
     * @static
    */
    static async getUserPasswordByEmail(email: string): Promise<User | null> {
        try {
            const { rowCount, rows } = await sql`SELECT id, password FROM Users WHERE email = ${email};`;
            if(rowCount === 1) return <User> rows[0];
            return null;
        } catch (e) {
            console.error(`DB_SERVICE getUserPasswordByEmail: ${e}`);
            return null;
        }
    }

    /**
     * Updates the refresh token for a user in the database.
     * @param id - The ID of the user to update.
     * @param refreshToken - The new refresh token for the user.
     * @returns A promise that resolves with true if the update was successful, false otherwise.
     * @static
    */
    static async updateUserRefreshToken(id: string, refreshToken: string | null): Promise<boolean> {
        try {
            const { rowCount } = await sql`UPDATE Users SET jwt_refresh_token = ${refreshToken}, updated_at = ${Math.floor(Date.now() / 1000)} WHERE id = ${id};`
            return rowCount === 1;
        } catch (e) {
            console.error(`DB_SERVICE updateUserRefreshToken: ${e}`);
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
            const { rows } = await sql`SELECT EXISTS ( SELECT 1 FROM Users WHERE jwt_refresh_token = ${refreshToken} );`
            return rows[0].exists;
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
            const { rows } = await sql`SELECT EXISTS ( SELECT 1 FROM Users WHERE id = ${id});`
            return rows[0].exists;
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
            const { rows } = await sql`SELECT EXISTS ( SELECT 1 FROM Users WHERE email = ${email});`
            return rows[0].exists;
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
    static async getStripeCustomerId(id: string): Promise<string | null> {
        try {
            const { rowCount, rows } = await sql`SELECT stripe_id FROM Users WHERE id = ${id};`
            if(rowCount === 1) return rows[0].stripe_id;
            return null;
        } catch (e) {
            console.error(`DB_SERVICE getStripeId: ${e}`);
            return null;
        }
    }
    
    /**
     * Updates the stripe id for specified in the database.
     * @param id - Id of the user to update.
     * @param stripeId - Stripe customer id.
     * @returns A promise that resolves with true if the user exists, false otherwise.
     * @static
    */
    static async updateStripeCustomerId(id: string, stripeId: string): Promise<boolean> {
        try {
            const { rowCount } = await sql`UPDATE Users SET stripe_id = ${stripeId}, updated_at = ${Math.floor(Date.now() / 1000)} WHERE id = ${id};`
            return rowCount === 1;
        } catch (e) {
            console.error(`DB_SERVICE updateStripeId: ${e}`);
            return false;
        }
    }

}

export { DBService }