import express from 'express';
import { verifyAuth } from '../middlewares/auth.middleware.js';
import { createEditShop, getShop, getShopbyCity} from '../controllers/shop.controller.js';
import upload from '../middlewares/multer.middleware.js';

export const shopRouter=express.Router();
shopRouter.post("/create-edit",verifyAuth,upload.single("image"),createEditShop);
shopRouter.get("/get",verifyAuth,getShop);
shopRouter.get("/get-shops/:city",verifyAuth,getShopbyCity);