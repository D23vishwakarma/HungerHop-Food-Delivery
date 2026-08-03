import express from 'express'
import { googleAuth, login, logout, resetPassword, sentOtpMail, signup, verifyOtp } from '../controllers/auth.controller.js';
export const authRouter=express.Router();
authRouter.post("/signup",signup);
authRouter.post("/login",login)
authRouter.get("/logout",logout)
authRouter.post("/send-otp",sentOtpMail);
authRouter.post("/verify-otp",verifyOtp);
authRouter.post("/reset-password",resetPassword);
authRouter.post("/google-auth",googleAuth);
