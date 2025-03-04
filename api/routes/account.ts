import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { requireAuthentication } from "../middleware/requireAuthentication";
import { validateData } from "../middleware/validation";
import { userDeletionSchema, userUpdateSchema } from "../schemas/user.schema";
import { DBService as db } from "../services/db";
import { BCryptService as crypt } from "../services/bcrypt";
import { S3Service as s3 } from "../services/aws/s3";
import { ResponseService as rs } from "../services/response";
import multer from "multer";
import sharp from "sharp";

const router = Router();
const memoryStorage = multer.memoryStorage();
const upload = multer({ storage: memoryStorage });

router.patch('/update', validateData(userUpdateSchema), async (req: Request, res: Response) => {
    
    // Update user
    if(!await db.updateUser(req.user.id, req.body)) {
        rs.send('Could not update user.', StatusCodes.INTERNAL_SERVER_ERROR, req, res);
        return;
    }

    rs.send('User successfully updated.', StatusCodes.OK, req, res);
});

router.post('/avatar', upload.single('avatar'), async (req: Request, res: Response) => {

    if(!req.file) {
        rs.send('No file provided.', StatusCodes.BAD_REQUEST, req, res);
        return;
    };

    // Resize image to be 150x150 pixels
    req.file.buffer = await sharp(req.file.buffer).resize({ width: 150, height: 150, fit: 'cover' }).toBuffer();

    // Create filename
    const fileName = `avatar_${req.user.id}`;

    // Upload image
    if(
        !await s3.uploadObject(req.file, `avatar_${req.user.id}`) ||
        !await db.updateUser(req.user.id, { avatar: fileName })
    ) {
        rs.send('Could not upload file.', StatusCodes.INTERNAL_SERVER_ERROR, req, res);
        return;
    }

    rs.send('Successfully upload avatar.', StatusCodes.OK, req, res);
})

router.get('/avatar/:id', async (req: Request, res: Response) => {

    // Get file name from database
    const fileName = await db.getAvatar(req.params.id);
    if(fileName === null) {
        rs.send('User does not have an avatar.', StatusCodes.NOT_FOUND, req, res);
        return;
    }

    // Get signed url with access to the file from S3
    const url = await s3.getObject(fileName);

    rs.send(url, StatusCodes.OK, req, res);
})

router.delete('/avatar', async (req: Request, res: Response) => {

    // Get file name from database
    const fileName = await db.getAvatar(req.user.id);
    if(fileName === null) {
        rs.send('User does not have an avatar.', StatusCodes.NOT_FOUND, req, res);
        return;
    }

    // Remove from bucket and database
    try {
        await db.updateUser(req.user.id, { avatar: null });
        await s3.deleteObject(fileName);
    } catch (e) {
        rs.send('Could not delete avatar.', StatusCodes.INTERNAL_SERVER_ERROR, req, res);
        return;
    }

    rs.send('Successfully deleted avatar.', StatusCodes.OK, req, res);
});

router.delete('/delete', validateData(userDeletionSchema), async (req: Request, res: Response) => {

    // Get user
    const user = await db.getUserPasswordById(req.user.id);
    if(user === null || !user.password) {
        rs.send('Could not find user.', StatusCodes.NOT_FOUND, req, res);
        return;
    }

    // Validate password
    if(!await crypt.compare(req.body.password, user.password)) {
        rs.send('Invalid credentials.', StatusCodes.UNAUTHORIZED, req, res);
        return;
    }

    // Delete user from database
    if(!await db.deleteUser(req.user.id)) {
        rs.send('Could not delete user.', StatusCodes.INTERNAL_SERVER_ERROR, req, res);
        return;
    }

    rs.send('User successfully deleted.', StatusCodes.OK, req, res);
});

export { router as account }