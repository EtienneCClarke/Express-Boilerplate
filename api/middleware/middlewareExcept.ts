import { Request, Response, NextFunction } from "express";
type MiddlewareFn = (req: Request, res: Response, next: NextFunction) => void;

function middlewareExcept(fn: MiddlewareFn, except: string[]): MiddlewareFn {
    return (req, res, next) => {
        if (except.includes(req.path)) next();
        else fn(req, res, next);
    };
}

export { middlewareExcept }