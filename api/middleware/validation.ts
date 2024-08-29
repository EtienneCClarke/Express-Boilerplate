import { Request, Response, NextFunction} from "express";
import { ZodError } from 'zod';
import { StatusCodes } from "http-status-codes";

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
                res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid data', details: errors })
            } else {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
            }
        } 
    }
}

export { validateData }