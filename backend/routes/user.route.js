import express from 'express'
import { verifyAuth } from '../middlewares/auth.middleware.js';
import { getCurrUser, updateUserLocation } from '../controllers/user.controller.js';
export const userRouter=express.Router();
userRouter.get("/get",verifyAuth,getCurrUser);
userRouter.put("/updatelocation",verifyAuth,updateUserLocation)