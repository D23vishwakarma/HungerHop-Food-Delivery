import express from 'express';
import { verifyAuth } from '../middlewares/auth.middleware.js';
import { createShop, getShop, updateShop } from '../controllers/shop.controller.js';
import upload from '../middlewares/multer.middleware.js';

export const shopRouter=express.Router();
shopRouter.post("/create",verifyAuth,upload.single("image"),createShop);
shopRouter.put("/update",verifyAuth,upload.single("image"),updateShop);
shopRouter.get('/get',verifyAuth,getShop);