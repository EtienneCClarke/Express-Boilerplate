import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { protectedRoute } from "../middleware/protectedRoute";
import { validateData } from "../middleware/validation";
import { userDeletionSchema, userUpdateSchema } from "../schemas/user.schema";
import { DBService as db } from "../services/db";
import { BCryptService as crypt } from "../services/bcrypt";
import { S3Service as s3 } from "../services/s3";
import multer from "multer";
import sharp from "sharp";

const router = Router();
const memoryStorage = multer.memoryStorage();
const upload = multer({ storage: memoryStorage });

router.patch('/update', [validateData(userUpdateSchema), protectedRoute], async (req: Request, res: Response) => {
    
    // Update user
    if(!await db.updateUser(req.user.id, req.body)) {
        return res.status(StatusCodes.BAD_REQUEST).send({ error: 'Could not update user.' });
    }

    res.status(StatusCodes.OK).send({ message: 'Successfully updated user.' });

});

router.post('/avatar', [protectedRoute, upload.single('avatar')], async (req: Request, res: Response) => {

    if(!req.file) return res.status(StatusCodes.BAD_REQUEST).send({ error: 'No file provided.' });

    // Resize image to be 150x150 pixels
    req.file.buffer = await sharp(req.file.buffer).resize({ width: 150, height: 150, fit: 'cover' }).toBuffer();

    // Create filename
    const fileName = `avatar_${req.user.id}`;

    // Upload image
    if(
        !await s3.uploadObject(req.file, `avatar_${req.user.id}`) ||
        !await db.updateUser(req.user.id, { avatar: fileName })
    ) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Could not upload file.' });
    }

    return res.status(StatusCodes.OK).send({ message: 'Successfully upload avatar.' });
    
})

router.get('/avatar/:id', protectedRoute, async (req: Request, res: Response) => {

    // Get file name from database
    const fileName = await db.getAvatar(req.params.id);
    if(fileName === null) {
        return res.status(StatusCodes.NOT_FOUND).send({ error: 'User does not have an avatar.' });
    }

    // Get signed url with access to the file from S3
    const url = await s3.getObject(fileName);

    return res.status(StatusCodes.OK).send({ url });

})

router.delete('/avatar', protectedRoute, async (req: Request, res: Response) => {

    // Get file name from database
    const fileName = await db.getAvatar(req.user.id);
    if(fileName === null) {
        return res.status(StatusCodes.NOT_FOUND).send({ error: 'User does not have an avatar.' });
    }

    // Remove from bucket and database
    try {
        await db.updateUser(req.user.id, { avatar: null });
        await s3.deleteObject(fileName);
    } catch (e) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Could not delete avatar.' });
    }

    return res.status(StatusCodes.OK).send({ message: 'Successfully deleted avatar.' });

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