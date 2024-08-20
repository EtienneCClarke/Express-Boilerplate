import bcrypt from "bcrypt";

/**
 * @class BCryptService
 * @description A service class for BCrypt related operations
*/
class BCryptService {

    /**
     * Hashes data
     * @param data - The data to be encrypted
     * @returns The encrypted value
     * @static
    */ 
    static async hash(data: string): Promise<string | null> {

        try {
            const salt = await bcrypt.genSalt();
            return bcrypt.hash(data, salt)
        } catch (e) {
            console.error(`BCRYPT_SERVICE hash: ${e}`)
            return null;
        }

    }

    /**
     * Compare raw data to an encrypted value
     * @param data - The data to be encrypted
     * @param encrypted - The data to be compared against
     * @returns A promise to be either resolved with the comparison result salt or rejected with null
     * @static
    */ 
    static async compare(data: string | Buffer, encrypted: string): Promise<boolean | null> {
        try {
            return await bcrypt.compare(data, encrypted);
        } catch (e) {
            console.error(`BCRYPT_SERVICE compare: ${e}`)
            return null;
        }
    }

}

export { BCryptService }