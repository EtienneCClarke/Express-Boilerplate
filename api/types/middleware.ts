import { NextFunction, Request, Response } from "express";

type MiddlewareFn = (req: Request, res: Response, next: NextFunction) => void;

export type {
    MiddlewareFn
}