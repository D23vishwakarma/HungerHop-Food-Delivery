import express from 'express'
import { verifyAuth } from '../middlewares/auth.middleware.js';
import { getMyorders, placeOrder, updateOrderStatus } from '../controllers/order.controller.js';
export const orderRouter=express.Router();
orderRouter.post("/place-order",verifyAuth,placeOrder)
orderRouter.get("/myorders",verifyAuth,getMyorders)
orderRouter.put("/updatestatus/:orderId/:shopId",verifyAuth,updateOrderStatus)
