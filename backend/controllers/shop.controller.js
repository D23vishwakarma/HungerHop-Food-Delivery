import { ApiError } from "../config/apierror.js";
import { ApiResponse } from "../config/apiresponse.js";
import { asyncHandler } from "../config/asynchandler.js";
import { Shop } from "../models/shop.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const createShop=asyncHandler(async(req,res)=>{
    const {name,city,state,address}=req.body;
    let image;
    if(req.file){
        image=await uploadOnCloudinary(req.file.path)
    }
    const shop=await Shop.create({
        name,city,state,address,image,owner:req.userId
    }).populate("owner")
    return res.status(200).json( new ApiResponse(200,shop,"Shop created successfully"));
})
export const updateShop=asyncHandler(async(req,res)=>{
    const {name,city,state,address}=req.body;
    let image;
    if(req.file){
        image=await uploadOnCloudinary(req.file.path)
    }
    let shop=await Shop.findOne({owner:userId});
    if(!shop){
        throw new ApiError(400,"Shop does not exist");
    }
    shop=await Shop.findByIdAndUpdate(shop._id,{
        name,city,state,address,image,owner:req.userId
    },{new:true}).populate("owner")
    return res.status(200).json( ApiResponse(200,shop,"Shop created successfully"));
})
export const getShop=asyncHandler(async(req,res)=>{
    const shop=await Shop.findById({owner:req.userId}).populate("owner items");
    if(!shop){
        throw new ApiError(400,"Shop not found");
    }
    return res.status(200).json(200,shop,"Shop has been fetches succesfully")
})
