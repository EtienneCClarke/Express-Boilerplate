import express from "express"

declare global {
    namespace Express {
        interface Request {
            [key: string] : any;
            ray: {
                id: string;
                timestamp: number;
            }
        }
    }
}