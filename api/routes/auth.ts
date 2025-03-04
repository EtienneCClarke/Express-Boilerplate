import { Request, Response, Router } from "express";
import { JWTService as jwt } from "../services/jwt";
import { DBService as db } from "../services/db";
import { BCryptService as crypt } from "../services/bcrypt";
import { ResponseService as rs } from "../services/response";
import { validateData } from "../middleware/validation";
import { requireAuthentication } from "../middleware/requireAuthentication";
import { userLoginSchema, userRegistrationSchema } from "../schemas/user.schema";
import { refreshTokenSchema } from "../schemas/token.schema";
import { StatusCodes } from "http-status-codes";

const router = Router();

router.post('/login', validateData(userLoginSchema), async (req: Request, res: Response) => {

    // Get user password
    const user = await db.getUserByEmailWithPassword(req.body.email);
    if(user === null || !user.password) {
        rs.send('Could not find user.', StatusCodes.NOT_FOUND, req, res);
        return;
    }

    // Validate password
    if(!await crypt.compare(req.body.password, user.password)) {
        rs.send('Invalid password.', StatusCodes.BAD_REQUEST, req, res);
        return;
    }
    
    // Remove hashed password from user object
    if(!delete user.password) {
        rs.send('Something went wrong.', StatusCodes.INTERNAL_SERVER_ERROR, req, res);
        return;
    }

    // Generate tokens
    const accessToken = jwt.signAccessToken({ id: user.id });
    const refreshToken = jwt.signRefreshToken({ id: user.id });
    
    // Update user
    if(!await db.updateUser(<string> user.id, { jwt_refresh_token: refreshToken })) {
        rs.send('Could not update refresh token.', StatusCodes.INTERNAL_SERVER_ERROR, req, res);
        return;
    }

    rs.send({ accessToken, refreshToken, user }, StatusCodes.OK, req, res);
});

router.put('/register', validateData(userRegistrationSchema), async (req: Request, res: Response) => {

    // Check if email is already registered
    if(await db.checkIfUserExistsByEmail(req.body.email) != null) {
        rs.send('Email is already associated with existing account.', StatusCodes.CONFLICT, req, res);
        return;
    }

    // Hash user password
    req.body.password = await crypt.hash(req.body.password);

    // Create user in database
    if(!await db.createUser(req.body)) {
        rs.send('Could not register new user.', StatusCodes.INTERNAL_SERVER_ERROR, req, res);
        return;
    }

    rs.send('User successfully registered.', StatusCodes.CREATED, req, res);
});

router.post('/refresh-token', validateData(refreshTokenSchema), async (req: Request, res: Response) => {

    // Check token is valid
    if(!await db.checkIfRefreshTokenExists(req.body.token)) {
        rs.send('Token does not exist.', StatusCodes.FORBIDDEN, req, res);
        return;
    }

    try {

        // Verify user
        const user = jwt.verifyRefreshToken(req.body.token);

        // Generate JWT tokens
        const accessToken = jwt.signAccessToken({ id: user.id });
        const refreshToken = jwt.signRefreshToken({ id: user.id });

        // Update user
        if(!await db.updateUser(user.id, { jwt_refresh_token: refreshToken })) {
            rs.send('Could not update refresh token.', StatusCodes.INTERNAL_SERVER_ERROR, req, res);
            return;
        }

        rs.send({ accessToken, refreshToken }, StatusCodes.OK, req, res);
    } catch (e) {
        rs.send('Something went wrong.', StatusCodes.INTERNAL_SERVER_ERROR, req, res);
        return;
    }
});

router.post('/logout', requireAuthentication, async (req: Request, res: Response) => {

    // Check if user exists
    if(!await db.checkIfUserExistsById(req.user.id)) {
        rs.send('User does not exist.', StatusCodes.NOT_FOUND, req, res);
        return;
    }

    // Update refresh token with null value
    if(!await db.updateUser(req.user.id, { jwt_refresh_token: null })) {
        rs.send('Could not update refresh token.', StatusCodes.INTERNAL_SERVER_ERROR, req, res);
        return;
    }
    
    rs.send('User logged out.', StatusCodes.OK, req, res);
});

export { router as auth }