import express, { Router } from 'express';

import { verifyJWT } from '../middlewares/auth.middleware.js';
import { createUser, loggedOutUser, loginUser } from '../controllers/user.controller.js';

const router = Router()
// Route to get all users
router.route('/register').post(createUser);
router.route('/login').post(loginUser);
router.route('/logout').post(verifyJWT,loggedOutUser);

export default router;