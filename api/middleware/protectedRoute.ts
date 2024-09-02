
import { Request, Response, NextFunction } from "express";
import { JWTService as jwt } from "../services/jwt";
import { User } from "../models/User";
import { StatusCodes } from "http-status-codes";

function protectedRoute(req: Request, res: Response, next: NextFunction) {

    // Get authorization header and check exists
    const header = req.get('authorization');
    if(!header) return res.status(StatusCodes.BAD_REQUEST).send({ error: 'No authorization header'});;

    // Verify token
    const verified: User | null = verifyAccessToken(header);
    if(verified === null) return res.status(StatusCodes.BAD_REQUEST).send({ error: 'Invalid token'});

    // Add decoded user to request
    req.user = verified;
    next();

}

function verifyAccessToken(authHeader: string): any {
    try {
        const token = authHeader && authHeader.split(' ')[1];
        return jwt.verifyAccessToken(token);
    } catch (e) {
        return null;
    }
}

export { protectedRoute }