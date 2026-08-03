import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import { connectdb } from './config/db.js'
import { authRouter } from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors'
import { userRouter } from './routes/user.route.js';
const app=express()
const port=process.env.PORT || 5000
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))
app.use(express.json());
app.use(cookieParser())
app.use("/api/v1/auth",authRouter)
app.use("/api/v1/user",userRouter)
app.use((err, req, res, next) => {
  return res.status(err.statuscode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || []
  });
});
app.listen(port,()=>{
    connectdb()
    console.log(`server started at ${port}`)
})