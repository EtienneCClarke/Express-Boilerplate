import jwt, { SignOptions } from "jsonwebtoken";
import { CONFIG } from "../configs/jwt.config";
import { User } from "../types/user";

/**
 * @class JWTService
 * @description A service class for JWT (JSON Web Token) related operations
*/
class JWTService {

    /**
     * Retrieves the JWT secret from the configuration.
     * @returns The JWT secret.
     * @private
    */
    private static getSecret(): string {
        return CONFIG.JWTSecret || 'secret';
    }

    /**
     * Retrieves the JWT refresh secret from the configuration.
     * @returns The JWT refresh secret.
     * @private
    */
    private static getRefreshSecret(): string {
        return CONFIG.JWTRefreshSecret || 'refresh-secret'
    }

    /**
     * Retrieves the JWT expiration time from the configuration.
     * @returns The JWT expiration time.
     * @private
    */
    private static getExpiration(): number {
        return CONFIG.JWTExpiration || 15 * 60; // Default 15 minutes
    }

    /**
     * Sign an access token with the user payload and JWT secret
     * @param user - The user payload to be encoded in the token
     * @param options - Optional configuration for the token
     * @returns The signed access token
     * @static
    */ 
    static signAccessToken(user: User, options?: SignOptions): string {
        return jwt.sign(user, this.getSecret(), options ? options : { expiresIn: this.getExpiration() });
    }
    
    /**
     * Sign a refresh token with the user payload and refresh JWT secret
     * @param user - The user payload to be encoded in the token
     * @param options - Optional configuration for the token
     * @returns The signed refresh token
     * @static
    */
    static signRefreshToken(user: User, options?: SignOptions): string {
        return jwt.sign(user, this.getRefreshSecret(), options);
    }

    /**
     * Verify the provided access token
     * @param token - The access token to be verified
     * @returns The decoded user payload if the token is valid or null
     * @static
    */
    static verifyAccessToken(token: string) {
        try {
            return jwt.verify(token, this.getSecret());
        } catch (e) {
            console.error(`JWT_SERVICE verifyAccessToken: ${e}`);
            return null;
        }
    }
    
    /**
     * Verify the provided refresh token
     * @param token - The refresh token to be verified
     * @returns The decoded user payload if the token is valid
     * @throws If the token is invalid or expired
     * @static
    */
    static verifyRefreshToken(token: string): any {
        return jwt.verify(token, this.getRefreshSecret(), (err, user) => {
            if(err) throw Error(err.message);
            return user;
        })
    }

}

export { JWTService }