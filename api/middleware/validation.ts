import { Request, Response, NextFunction} from "express";
import { ZodError } from 'zod';
import { StatusCodes } from "http-status-codes";
import { ResponseService as rs } from "../services/response";

function validateData(schema: any) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } catch (e) {
            if(e instanceof ZodError) {
                const errors = e.errors.map((issue: any) => ({
                    message: `${issue.path.length > 1 ? `${issue.path.join('.')} is ` : ''}${issue.message}`,
                }))
                rs.send(errors, StatusCodes.BAD_REQUEST, req, res);
            } else {
                rs.send('Internal Server Error', StatusCodes.INTERNAL_SERVER_ERROR, req, res);
            }
        } 
    }
}

export { validateData }