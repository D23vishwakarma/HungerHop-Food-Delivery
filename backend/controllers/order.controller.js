import { ApiError } from "../config/apierror.js";
import { ApiResponse } from "../config/apiresponse.js";
import { asyncHandler } from "../config/asynchandler.js";
import { Order } from "../models/order.model.js";
import { Shop } from "../models/shop.model.js";
import { User } from "../models/user.model.js";

export const placeOrder=asyncHandler(async(req,res)=>{
    const {cartItems,paymentMethod,deliveryAddress,totalAmount}=req.body;
    if(cartItems.length==0){
        throw new ApiError(400,"Cart is empty");
    }
    if(!deliveryAddress||!deliveryAddress.longitude || !deliveryAddress.latitude||!deliveryAddress.text){
        throw new ApiError(400,"Full delivery address required")
    }
    const groupItemByShop={}
    cartItems.forEach(item=>{
        const shopId=item.shop
        if(!groupItemByShop[shopId]){
            groupItemByShop[shopId]=[]
        }
        groupItemByShop[shopId].push(item)
    })
    const shopOrders=await Promise.all(Object.keys(groupItemByShop).map(async shopId=>{
        const shop=await Shop.findById(shopId).populate("owner");
        if(!shop){
            throw new ApiError(400,"Shop not found");
        }
        const items=groupItemByShop[shopId]
        const subtotal=items.reduce((sum,i)=>sum+Number(i.price)*Number(i.quantity),0);
        return {
            shop:shop._id,
            owner:shop.owner,
            subtotal,
            shopOrderItems:items.map((i)=>({
                item:i._id,
                price:i.price,
                quantity:i.quantity,
                name:i.name
            }))
        }
    }))
    const order=await Order.create({
        user:req.userId,
        paymentMethod,
        deliveryAddress,
        totalAmount,
        shopOrders
    })
    await order.populate("shopOrders.shopOrderItems.item","name price quantity image")
    await order.populate("shopOrders.shop","name")
    return res.status(201).json(new ApiResponse(201,order,"Order placed"))

})
export const getMyorders=asyncHandler(async(req,res)=>{
    const user=await User.findById(req.userId);
    if(user.role=="customer"){
    const orders=await Order.find({user:req.userId}).sort({createdAt:-1})
    .populate("shopOrders.owner","name email phone")
    .populate("shopOrders.shop","name")
    .populate("shopOrders.shopOrderItems.item","name price quantity image")

    return res.status(200).json(new ApiResponse(200,orders,"All my orders"))
    }
    else if(user.role=="restaurant"){
    const orders=await Order.find({"shopOrders.owner":req.userId}).sort({createdAt:-1})
    .populate("user")
    .populate("shopOrders.shop","name")
    .populate("shopOrders.shopOrderItems.item","name price quantity image")

    return res.status(200).json(new ApiResponse(200,orders,"All owner orders"))
    }
})
export const updateOrderStatus=asyncHandler(async(req,res)=>{
    const {orderId,shopId}=req.params;
    const {status}=req.body
    const order=await Order.findById(orderId);
    if(!order){
        throw new ApiError(400,"Order not Found")
    }
    const shopOrder=order.shopOrders.find(o=>o.shop.toString()==shopId)
    if(!shopOrder){
        throw new ApiError(400,"shop Order not Found")
    }
    shopOrder.status=status;
    await shopOrder.save();
    await order.save();
    
    return res.status(200).json(new ApiResponse(200,shopOrder.status,"Status updated"))
})
