import { ApiError } from "../config/apierror.js";
import { ApiResponse } from "../config/apiresponse.js";
import { asyncHandler } from "../config/asynchandler.js";
import { Item } from "../models/items.model.js";
import { Shop } from "../models/shop.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const createItem=asyncHandler(async(req,res)=>{
    const {name,category,foodtype,price}=req.body;
    let image;
    if(req.file){
        image=await uploadOnCloudinary(req.file.path);
    }
    const shop=await Shop.findOne({owner:req.userId});
    if(!shop){
        throw new ApiError(400,"Shop does not exist");
    }
    const item=await Item.create({
        name,image,shop:shop._id,
        category,foodtype,price
    })
    return res.status(201).json(new ApiResponse(201,item,"Item created successfully"));

})
export const updateItem=asyncHandler(async(req,res)=>{
    const itemId=req.params.itemId;
     const {name,shop,category,foodtype,price}=req.body;
    let image;
    if(req.file){
        image=await uploadOnCloudinary(req.file.path);
    }
    const item=await Item.findByIdAndUpdate(itemId,{
        name,shop,category,foodtype,price,image
    })
    if(!item){
        throw new ApiError(400,"Item not found");
    }
    return res.status(200).json(new ApiResponse(200,item,"Item updated successfully"));
})