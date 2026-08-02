import mongoose from "mongoose"

export const connectdb=async()=>{
    try {
        mongoose.connect(process.env.MONGODB_URL)
        console.log("Mogodb connected")
    } catch (error) {
        console.log("db error")
    }
}