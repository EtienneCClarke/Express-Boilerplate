import jwt, { SignOptions, Secret } from "jsonwebtoken";
import { CONFIG } from "../configs/jwt.config";
import { User } from "../models/User";

/**
 * @class JWTService
 * @description A service class for JWT (JSON Web Token) related operations
*/
class JWTService {

    /**
     * Sign an access token with the user payload and JWT secret
     * @param user - The user payload to be encoded in the token
     * @param options - Optional configuration for the token
     * @returns The signed access token
     * @static
    */ 
    static signAccessToken(user: User, options?: SignOptions): string {
        return jwt.sign(user, <Secret> CONFIG.JWTSecret, options ? options : { expiresIn: CONFIG.JWTExpiration });
    }
    
    /**
     * Sign a refresh token with the user payload and refresh JWT secret
     * @param user - The user payload to be encoded in the token
     * @param options - Optional configuration for the token
     * @returns The signed refresh token
     * @static
    */
    static signRefreshToken(user: User, options?: SignOptions): string {
        return jwt.sign(user, <Secret> CONFIG.JWTRefreshSecret, options);
    }

    /**
     * Verify the provided access token
     * @param token - The access token to be verified
     * @returns The decoded user payload if the token is valid or null
     * @static
    */
    static verifyAccessToken(token: string) {
        try {
            return jwt.verify(token, <Secret> CONFIG.JWTSecret);
        } catch (e) {
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
        return jwt.verify(token, <Secret> CONFIG.JWTRefreshSecret, (err, user) => {
            if(err) throw Error;
            return user;
        })
    }

}

export { JWTService }