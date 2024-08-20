import { Request, Response, Router } from "express";
import { protectedRoute } from "../middleware/protectedRoute";

const router = Router();

const posts = [
    {
        name: "etienne",
        title: "post 1"
    },
    {
        name: "joe",
        title: "post 2"
    }
]

router.get('/all', protectedRoute, (req: Request, res: Response) => {
    return res.json(posts);
});

export { router as posts }