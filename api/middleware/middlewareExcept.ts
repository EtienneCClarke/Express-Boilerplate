import { Request, Response, NextFunction } from "express";
type MiddlewareFn = (req: Request, res: Response, next: NextFunction) => void;

function middlewareExcept(fn: MiddlewareFn, except: string[]): MiddlewareFn {
    return (req, res, next) => {
        if (except.includes(req.path) || exceptNestedRoutes(except, req.path)) next();
        else fn(req, res, next);
    };
}

function exceptNestedRoutes(except: string[], path: string) {

    // Remove trailing slash
    if(path.endsWith('/')) path = path.slice(0, path.length - 1);

    // Filter for routes that dont want middleware running on children
    except = except.filter((route: string) => route.endsWith('/*'));

    // Check if path is child of exception
    for(let i = 0; i < except.length; i++) {
        if(path.startsWith(except[i].slice(0, except[i].length - 2))) return true;
    }

    return false;

}

export { middlewareExcept }