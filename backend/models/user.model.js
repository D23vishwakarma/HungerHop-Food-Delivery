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
        enum:["customer","restaurant","delivery"],
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
    },
    location:{
        type:{
            type:String,
            enum:['Point'],
            default:'Point'
        },
        coordinates:{
            type:[Number],
            default:[0,0]
        }
    },
    socketId:{
        type:String
    },
    isOnline:{
        type:Boolean,
        default:false
    }
},{timestamps:true})

userSchema.index({location:'2dsphere'})//Used soo that mongoose treate it as map
export const User=mongoose.model("User",userSchema);