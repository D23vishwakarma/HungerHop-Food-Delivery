import { ApiError } from "../config/apierror.js";
import { ApiResponse } from "../config/apiresponse.js";
import { asyncHandler } from "../config/asynchandler.js";
import { User } from "../models/user.model.js";

export const getCurrUser=asyncHandler(async(req,res)=>{
    const user=await User.findById(req.userId).select("-password");
    if(!user){
        throw new ApiError(400,"User not Found")
    }
    return res.status(200).json(new ApiResponse(200,user,"User Fetched succwssfully"))
})
export const updateUserLocation=asyncHandler(async(req,res)=>{
    const {lati,long}=req.body;
    const user = await User.findByIdAndUpdate(req.userId,{
        location:{
            type:'Point',
            coordinates:[long,lati]
        }
    },{new:true})
    if(!user){
        throw new ApiError(400,"User not Found")
    }
    return res.status(200).json(new ApiResponse(200,{},"Location updated succesfully"))
})