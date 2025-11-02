import {Router} from 'express'
import * as userCtlr from '../controllers/user.controller.js'
import { authUser } from '../middleware/auth.middleware.js';
import { body } from 'express-validator';
const router = Router();

router.post('/register' ,body('email').isEmail().withMessage('Email is required'),body('password').isLength({min:3}).withMessage('Password must be at least 3 characters long') ,body('username').isLength({min:3}).withMessage('Username must be at least 3 characters long'), userCtlr.createUser);

router.post('/login', body('email').isEmail().withMessage('Email is required'),body('password').isLength({min:3}).withMessage('Password must be at least 3 characters long'), userCtlr.login )

router.post('/logout',authUser,userCtlr.logout);

router.get('/profile',authUser,userCtlr.profile);


export default router;