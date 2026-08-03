import express from 'express'
import { verifyAuth } from '../middlewares/auth.middleware.js';
import { getCurrUser } from '../controllers/user.controller.js';
export const userRouter=express.Router();
userRouter.get("/get",verifyAuth,getCurrUser);