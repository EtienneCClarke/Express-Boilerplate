import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { ResponseService as rs } from "../services/response";

const router = Router();

const posts = [
    {
        name: "jane",
        title: "post 1"
    },
    {
        name: "john",
        title: "post 2"
    }
]

router.get('/all', (req: Request, res: Response) => {
    rs.send('Error message', StatusCodes.BAD_REQUEST, req, res);
});

export { router as posts }