import express from 'express'
import { verifyAuth } from '../middlewares/auth.middleware.js';
import { acceptOrder, deliveryBoyAssignment, getCurrOrder, getMyorders, getOrderById, placeOrder, sendDeliveryOtp, updateOrderStatus, verifyOtp, verifyPayment } from '../controllers/order.controller.js';
export const orderRouter=express.Router();
orderRouter.post("/place-order",verifyAuth,placeOrder)
orderRouter.get("/myorders",verifyAuth,getMyorders)
orderRouter.put("/updatestatus/:orderId/:shopId",verifyAuth,updateOrderStatus)
orderRouter.get("/order-assignment",verifyAuth,deliveryBoyAssignment)
orderRouter.put("/accept-order/:assignmentId",verifyAuth,acceptOrder);
orderRouter.get("/getcurrorder",verifyAuth,getCurrOrder);
orderRouter.get("/getorderbyid/:orderId",verifyAuth,getOrderById);
orderRouter.post("/senddeliveryotp",verifyAuth,sendDeliveryOtp);
orderRouter.post("/verify-otp",verifyAuth,verifyOtp);
orderRouter.post("/verify-payment",verifyAuth,verifyPayment);
