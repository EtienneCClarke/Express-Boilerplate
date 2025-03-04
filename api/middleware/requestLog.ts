import { NextFunction, Request, Response } from "express";

function requestLog(req: Request, res: Response, next: NextFunction) {

    console.log({ ...req.ray, method: req.method, path: req.path, body: req.body, ip: req.ip });
    
    next();

}

export { requestLog }