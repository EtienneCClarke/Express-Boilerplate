const { sql } = require('@vercel/postgres');

/**
 * @class DBService
 * @description A service class for interacting with the database.
*/
class DBService {

    /**
     * Retrieves a user from the database by email.
     * @param {string} email - The email of the user to retrieve.
     * @returns {Promise<{id: number, password: string} | null>} A promise that resolves with the user object or null if not found.
     * @static
    */
    static async getUserByEmail(email) {
        try {
            const { rowCount, rows } = await sql`SELECT id, password FROM Users WHERE email = ${email};`;
            if(rowCount === 1) return rows[0];
            return null;
        } catch (e) {
            console.error(`DBSERVICE getUserByEmail: ${e}`);
            return null;
        }
    }

    /**
     * Updates the refresh token for a user in the database.
     * @param {number} id - The ID of the user to update.
     * @param {string} refreshToken - The new refresh token for the user.
     * @returns {Promise<boolean>} A promise that resolves with true if the update was successful, false otherwise.
     * @static
    */
    static async updateUserRefreshToken(id, refreshToken) {
        try {
            const { rowCount } = await sql`UPDATE Users SET jwt_refresh_token = ${refreshToken}, updated_at = ${new Date()} WHERE id = ${id};`
            if(rowCount === 1) return true;
            return false;
        } catch (e) {
            console.error(`DBSERVICE updateUserRefreshToken: ${e}`);
            return false;
        }
    }

    /**
     * Checks if a refresh token exists for a user in the database.
     * @param {number} id - The ID of the user to check.
     * @param {string} refreshToken - The refresh token to check.
     * @returns {Promise<boolean>} A promise that resolves with true if the refresh token exists, false otherwise.
     * @static
    */
    static async checkIfRefreshTokenExists(id, refreshToken) {
        try {
            const { rows } = await sql`SELECT EXISTS ( SELECT 1 FROM Users WHERE id = ${id} AND jwt_refresh_token = ${refreshToken} );`
            return rows[0].exists;
        } catch (e) {
            console.error(`DBSERVICE updateUserRefreshToken: ${e}`);
            return false;
        }
    }

    /**
     * Checks if a user exists in the database.
     * @param {number} id - The ID of the user to check.
     * @returns {Promise<boolean>} A promise that resolves with true if the user exists, false otherwise.
     * @static
    */
    static async checkIfUserExists(id) {
        try {
            const { rows } = await sql`SELECT EXISTS ( SELECT 1 FROM Users WHERE id = ${id});`
            return rows[0].exists;
        } catch (e) {
            console.error(`DBSERVICE checkIfUserExists: ${e}`);
            return false;
        }
    }

}

module.exports = DBService;