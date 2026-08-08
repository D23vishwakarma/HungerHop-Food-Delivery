import express from 'express'
import { verifyAuth } from '../middlewares/auth.middleware.js';
import { createItem, deleteItem, getItem, getItemByCity, updateItem } from '../controllers/item.controller.js';
import upload from '../middlewares/multer.middleware.js';
export const itemRouter=express.Router();
itemRouter.post("/create",verifyAuth,upload.single("image"),createItem);
itemRouter.put("/update/:itemId",verifyAuth,upload.single("image"),updateItem);
itemRouter.get("/get/:itemId",getItem);
itemRouter.delete("/delete/:itemId",verifyAuth,deleteItem);
itemRouter.get("/getbycity/:city",verifyAuth,getItemByCity);
