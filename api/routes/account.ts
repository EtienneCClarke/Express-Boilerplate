import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { protectedRoute } from "../middleware/protectedRoute";
import { validateData } from "../middleware/validation";
import { userDeletionSchema, userUpdateSchema } from "../schemas/user.schema";
import { DBService as db } from "../services/db";
import { BCryptService as crypt } from "../services/bcrypt";

const router = Router();

router.patch('/update', [validateData(userUpdateSchema), protectedRoute], async (req: Request, res: Response) => {
    
    // Update user
    if(!await db.updateUser(req.user.id, req.body)) {
        return res.status(StatusCodes.BAD_REQUEST).send({ error: 'Could not update user.' });
    }

    res.status(StatusCodes.OK).send({ message: 'Successfully updated user.' });

});

router.delete('/delete', [validateData(userDeletionSchema), protectedRoute], async (req: Request, res: Response) => {

    // Get user
    const user = await db.getUserPasswordById(req.user.id);
    if(user === null || !user.password) {
        return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }

    // Validate password
    if(!await crypt.compare(req.body.password, user.password)) {
        return res.status(StatusCodes.BAD_REQUEST).send({ error: 'Invalid password.' });
    }

    // Delete user from database
    if(!await db.deleteUser(req.user.id)) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Could not delete user.' });
    }

    res.status(StatusCodes.OK).send({ message: 'User successfully deleted.' });

});

export { router as account }