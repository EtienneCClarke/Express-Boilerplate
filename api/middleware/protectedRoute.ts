
import { Request, Response, NextFunction } from "express";
import { JWTService as jwt } from "../services/jwt";
import { User } from "../models/User";
import { StatusCodes } from "http-status-codes";

function protectedRoute(req: Request, res: Response, next: NextFunction) {

    const header = req.get('authorization');

    if(!header) return res.status(StatusCodes.BAD_REQUEST).send({ error: 'No authorization header'});;

    const verified: User | null = verifyAccessToken(header);
    if(verified === null) return res.status(StatusCodes.BAD_REQUEST).send({ error: 'Invalid token'});

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