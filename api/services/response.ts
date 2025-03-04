import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ResponseObject } from "../types/response";

/**
 * @class ErrorService
 * @description A service class for creating error objects.
*/
class ResponseService {

    /**
     * Sends an error object with the specified message and status code back to the user.
     * 
     * @param data - The data to be sent in the response.
     * @param status - The HTTP status code.
     * @param ray - The request object containing the error details.
     * @param res - The response object to send the error response.
    */  
    static send(data: any, status: number, req: Request, res: Response) {

        const errorRes: ResponseObject = {
            ray: req.ray,
            status,
            code: StatusCodes[status],
            data,
        };

        res.status(status).json(errorRes);

    }


}

export { ResponseService };