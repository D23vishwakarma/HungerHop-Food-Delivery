import { ApiError } from "../config/apierror.js";
import { ApiResponse } from "../config/apiresponse.js";
import { asyncHandler } from "../config/asynchandler.js";
import { Item } from "../models/items.model.js";
import { Shop } from "../models/shop.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const createItem = asyncHandler(async (req, res) => {
    const { name, category, foodtype, price } = req.body;
    let image;
    if (req.file) {
        image = await uploadOnCloudinary(req.file.path);
    }
    const shop = await Shop.findOne({ owner: req.userId });
    if (!shop) {
        throw new ApiError(400, "Shop does not exist");
    }
    const item = await Item.create({
        name, image, shop: shop._id,
        category, foodtype, price
    })
    await shop.items.push(item._id);
    await shop.save();
    await shop.populate("owner")
    await shop.populate({
        path: "items",
        options: { sort: { updatedAt: -1 } }
    })
    return res.status(201).json(new ApiResponse(201, shop, "Item created successfully"));

})
export const updateItem = asyncHandler(async (req, res) => {
    const itemId = req.params.itemId;
    const { name, category, foodtype, price } = req.body;
    let image;
    if (req.file) {
        image = await uploadOnCloudinary(req.file.path);
    }
    const item = await Item.findByIdAndUpdate(itemId, {
        name, category, foodtype, price, image
    })
    if (!item) {
        throw new ApiError(400, "Item not found");
    }
    const shop = await Shop.findOne({ owner: req.userId }).populate({
        path: "items",
        options: { sort: { updatedAt: -1 } }
    })
    return res.status(200).json(new ApiResponse(200, shop, "Item updated successfully"));
})
export const getItem = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const item = await Item.findById(itemId);
    if (!item) {
        throw new ApiError(400, "Item not found");
    }
    return res.status(200).json(new ApiResponse(200, item, "Item fetched"))
})
export const deleteItem = asyncHandler(async (req, res) => {
    const { itemId } = req.params;

    const item = await Item.findByIdAndDelete(itemId);
    if (!item) {
        throw new ApiError(400, "Item not found");
    }

    await Shop.findOneAndUpdate(
        { owner: req.userId },
        { $pull: { items: itemId } }
    );

    return res.status(200).json(new ApiResponse(200, {}, "Item deleted successfully"));
});
export const getItemByCity = asyncHandler(async (req, res) => {
    const { city } = req.params;
    if (!city) {
        throw new ApiError(400, "City is required");
    }
    const shops = await Shop.find({
        city: { $regex: new RegExp(`^${city}$`, "i") }
    }).populate("items")
    if(!shops){
        throw new ApiError(400,"SHop not found")
    }
    const shopIds=shops.map((shop)=>shop._id);
    const items=await Item.find({shop:{
        $in:shopIds
    }})
    return res.status(200).json(new ApiResponse(200,items,"Items fetched by city"))

})
export const getItemByShop=asyncHandler(async(req,res)=>{
    const {shopId}=req.params;
    const shop=await Shop.findById(shopId).populate("items")
    if(!shop){
        throw new ApiError(400,"Shop not found")
    }
    return res.status(200).json(new ApiResponse(200,{shop,items:shop.items}))
})
export const searchItems=asyncHandler(async(req,res)=>{
    const {query,city}=req.query;
    if (!city) {
        throw new ApiError(400, "City is required");
    }
    const shops = await Shop.find({
        city: { $regex: new RegExp(`^${city}$`, "i") }
    }).populate("items")
    if(shops.length==0){
        throw new ApiError(400,"Shop not found")
    }
    const shopIds=shops.map(s=>s._id);
    const items=await Item.find({
        shop:{$in:shopIds},
        $or:[
            {name:{$regex :query ,$options:"i"}},
            {category:{$regex :query ,$options:"i"}}
        ]
    }).populate("shop","name image")
    return res.status(200).json(new ApiResponse(200,items,"Items fetched successfully"))

})