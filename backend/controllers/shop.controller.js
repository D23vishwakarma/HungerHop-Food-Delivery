import { ApiError } from "../config/apierror.js";
import { ApiResponse } from "../config/apiresponse.js";
import { asyncHandler } from "../config/asynchandler.js";
import { Shop } from "../models/shop.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const createEditShop = asyncHandler(async (req, res) => {
    const { name, city, state, address } = req.body;

    let image;
    if (req.file) {
        image = await uploadOnCloudinary(req.file.path);
    }

    let shop = await Shop.findOne({ owner: req.userId });

    const updateData = { name, city, state, address, owner: req.userId };
    if (image) updateData.image = image;

    if (!shop) {
        if (!image) {
            throw new ApiError(400, "Shop image is required");
        }
        shop = await Shop.create({ ...updateData, image });
        shop = await shop.populate("owner");
    } else {
        shop = await Shop.findByIdAndUpdate(
            shop._id,
            updateData,
            { new: true }
        ).populate("owner");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, shop, "Shop created or edited successfully"));
});

export const getShop = asyncHandler(async (req, res) => {
    const shop = await Shop.findOne({ owner: req.userId })
        .populate("owner")
        .populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        });

    if (!shop) {
        throw new ApiError(400, "Shop not found");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, shop||null, "Shop has been fetched successfully"));
});
export const getShopbyCity=asyncHandler(async(req,res)=>{
    const {city}=req.params
    const shops=await Shop.find({
        city:{$regex:new RegExp(`^${city}$`,"i")}
    }).populate("items")
    if(shops.length==0){
        throw new ApiError(400,"No shop Found")
    }
    return res.status(200).json(new ApiResponse(200,shops,"all related shop fetched"));
})