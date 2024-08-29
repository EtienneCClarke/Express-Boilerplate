import { Request, Response, Router } from "express";
import { JWTService as jwt } from "../services/jwt";
import { DBService as db } from "../services/db";
import { BCryptService as crypt } from "../services/bcrypt";
import { validateData } from "../middleware/validation";
import { protectedRoute } from "../middleware/protectedRoute";
import { userLoginSchema, userRegistrationSchema } from "../schemas/user.schema";
import { refreshTokenSchema } from "../schemas/token.schema";
import { StatusCodes } from "http-status-codes";

const router = Router();

router.post('/login', validateData(userLoginSchema), async (req: Request, res: Response) => {

    // Get user
    const user = await db.getUserPasswordByEmail(req.body.email);
    if(user === null || !user.password) {
        return res.status(StatusCodes.NOT_FOUND).send({ error: 'Could not find user.' });
    }

    // Validate password
    if(!await crypt.compare(req.body.password, user.password)) {
        return res.status(StatusCodes.BAD_REQUEST).send({ error: 'Invalid password.' });
    }
    
    // Remove hashed password from user object
    if(!delete user.password) return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Something went wrong.' }); 

    // Generate tokens
    const accessToken = jwt.signAccessToken(user);
    const refreshToken = jwt.signRefreshToken(user);
    
    // Update user
    if(!await db.updateUser(<string> user.id, { jwt_refresh_token: refreshToken })) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Could not update refresh token.' });
    }

    res.status(StatusCodes.OK).send({ accessToken, refreshToken });
});

router.put('/register', validateData(userRegistrationSchema), async (req: Request, res: Response) => {

    // Check if email is already registered
    if(await db.getUserByEmail(req.body.email) != null) {
        return res.status(StatusCodes.CONFLICT).send({ error: 'Email is already associated with existing account.' });
    }

    // Hash user password
    req.body.password = await crypt.hash(req.body.password);

    // Create user in database
    if(!await db.createUser(req.body)) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Could not register new user.' });
    }

    res.status(StatusCodes.CREATED).send({ message: `User successfully registered.` });

});

router.post('/refresh-token', validateData(refreshTokenSchema), async (req: Request, res: Response) => {

    // Check token is valid
    if(!await db.checkIfRefreshTokenExists(req.body.token)) {
        return res.status(StatusCodes.FORBIDDEN).send({ error: 'Invalid token.' });
    }

    try {

        // Verify user
        const user = jwt.verifyRefreshToken(req.body.token);

        // Generate JWT tokens
        const accessToken = jwt.signAccessToken({ id: user.id });
        const refreshToken = jwt.signRefreshToken({ id: user.id });

        // Update user
        if(!await db.updateUser(user.id, { jwt_refresh_token: refreshToken })) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Could not update refresh token.' });
        }

        res.status(StatusCodes.OK).json({ accessToken, refreshToken });
    } catch (e) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Something went wrong.' });
    }
});

router.post('/logout', protectedRoute, async (req: Request, res: Response) => {

    // Check if user exists
    if(!await db.checkIfUserExistsById(req.user.id)) {
        return res.status(StatusCodes.NOT_FOUND).send({ error: 'User does not exist.'})
    }

    // Update refresh token with null value
    if(!await db.updateUser(req.user.id, { jwt_refresh_token: null })) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Something went wrong.'});
    }
    
    return res.status(StatusCodes.OK).send({ message: 'Successfully logged out.'});

});

export { router as auth }