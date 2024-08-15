const bcrypt = require('bcrypt');

class BCryptService {

    static async hash(password) {

        try {
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(password, salt)
            console.log({ salt, hashedPassword })
        } catch (e) {
            console.error(`BCRYPT SERVICE: ${e}`)
            return null;
        }

    }

    
    static async compare(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }

}

module.exports = BCryptService;