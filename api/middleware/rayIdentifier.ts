import { NextFunction, Request, Response } from "express";
import { UUIDService as uuid } from "../services/uuid";

function rayIdentifier(req: Request, res: Response, next: NextFunction) {

    req.ray = {
        id: uuid.generateV4(),
        timestamp: Date.now()
    };
    
    next();

}

export { rayIdentifier }