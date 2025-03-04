import { Request } from "express";

interface ResponseObject {
    ray: Request['ray'];
    status: number;
    code: string;
    data: any;
}

export type {
    ResponseObject,
}