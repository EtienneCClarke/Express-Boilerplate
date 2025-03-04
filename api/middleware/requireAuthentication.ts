
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { JWTService as jwt } from "../services/jwt";
import { ResponseService as rs } from "../services/response";
import { User } from "../types/user";

function requireAuthentication(req: Request, res: Response, next: NextFunction) {

    // Get authorization header and check exists
    const header = req.get('authorization');
    if(!header) {
        rs.send('No authorization header', StatusCodes.BAD_REQUEST, req, res);
        return;
    }

    // Verify token
    const verified: User | null = verifyBearerToken(header);
    if(verified === null) {
        rs.send('Invalid token', StatusCodes.BAD_REQUEST, req, res);
        return;
    }
    
    // Add decoded user object to request
    req.user = verified;
    next();

}

function verifyBearerToken(authHeader: string): any {
    try {
        // Get bearer token and verify
        const token = authHeader && authHeader.split(' ')[1];
        return jwt.verifyAccessToken(token);
    } catch (e) {
        return null;
    }
}

export { requireAuthentication }