import mongoose, { mongo } from "mongoose";

const userSchema=new mongoose.Schema({
    fullName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
    },
    phone:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:["customer","resturant","delivery"],
        required:true
    },
    userOtp:{
        type:String
    },
    otpVerified:{
        type:Boolean,
        default:false
    },
    otpExpired:{
        type:Date
    }
},{timestamps:true})

export const User=mongoose.model("User",userSchema);