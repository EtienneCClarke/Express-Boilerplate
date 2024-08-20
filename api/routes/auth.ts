import { Request, Response, Router } from "express";
import { JWTService as jwt } from "../services/jwt";
import { DBService as db } from "../services/db";
import { BCryptService as crypt } from "../services/bcrypt";
import { validateData } from "../middleware/validation";
import { protectedRoute } from "../middleware/protectedRoute";
import { userRegistrationSchema, userDeletionSchema, userLoginSchema } from "../schema/user";
import { refreshTokenSchema } from "../schema/token";
import { StatusCodes } from "http-status-codes";

const router = Router();

router.post('/login', validateData(userLoginSchema), async (req: Request, res: Response) => {

    const user = await db.getUserPasswordByEmail(req.body.email)
    if(user === null || !user.password) return res.status(StatusCodes.NOT_FOUND).send({ error: 'Could not find user.' });

    if(!await crypt.compare(req.body.password, user.password)) return res.status(StatusCodes.BAD_REQUEST).send({ error: 'Invalid password.' });
    if(!delete user.password) return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR); // Remove hashed password from user object

    // Generate tokens
    const accessToken = jwt.signAccessToken(user);
    const refreshToken = jwt.signRefreshToken(user);
    
    if(!await db.updateUserRefreshToken(user.id, refreshToken)) return res.sendStatus(500);

    res.json({ accessToken, refreshToken });
})

router.post('/refresh-token', validateData(refreshTokenSchema), async (req: Request, res: Response) => {

    const token = req.body.token;

    if(!await db.checkIfRefreshTokenExists(token)) return res.sendStatus(403);

    try {
        const user = jwt.verifyRefreshToken(token);
        const accessToken = jwt.signAccessToken({ id: user.id });
        const refreshToken = jwt.signRefreshToken({ id: user.id });
        if(!await db.updateUserRefreshToken(user.id, refreshToken)) return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Could not update refresh token.' });
        res.status(StatusCodes.OK).json({ accessToken, refreshToken });
    } catch (e) {
        return res.sendStatus(403)
    }
})

router.delete('/logout', async (req: Request, res: Response) => {

    // Check if user exists
    if(!await db.checkIfUserExistsById(req.body.id)) return res.status(StatusCodes.NOT_FOUND).send({ error: 'User does not exist.'})

    // Update refresh token with null value
    if(await db.updateUserRefreshToken(req.body.id, null)) return res.status(StatusCodes.OK).send({ message: 'Successfully logged out.'});

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Something went wrong.'});

})

router.put('/register', validateData(userRegistrationSchema), async (req: Request, res: Response) => {

    // Check if email is already registered
    if(await db.getUserByEmail(req.body.email) != null) return res.status(StatusCodes.CONFLICT).send({ error: 'Email is already associated with existing account.' });

    // Hash user password
    req.body.password = await crypt.hash(req.body.password);

    // Create user in database
    if(!await db.createUser(req.body)) return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Could not register new user.' });

    res.status(StatusCodes.CREATED).send({ message: `User successfully registered.` })

})

router.delete('/delete-account', [validateData(userDeletionSchema), protectedRoute], async (req: Request, res: Response) => {

    // Get user
    const user = await db.getUserPasswordById(req.user.id);
    if(user === null || !user.password) return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);

    // Validate password
    if(!await crypt.compare(req.body.password, user.password)) return res.status(StatusCodes.BAD_REQUEST).send({ error: 'Invalid password.' });

    // Delete user from database
    if(!await db.deleteUser(req.user.id)) return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Could not delete user.' });

    res.status(StatusCodes.OK).send({ message: 'User successfully deleted.' });

});

export { router as auth }