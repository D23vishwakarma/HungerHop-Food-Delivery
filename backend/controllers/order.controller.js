import { ApiError } from "../config/apierror";
import { asyncHandler } from "../config/asynchandler";

export const placeOrder=asyncHandler(async(req,res)=>{
    const {cartItems,paymentMethod,deliveryAddress,totalAmount}=req.body;
    if(cartItems.length==0){
        throw new ApiError(400,"Cart is empty");
    }
    if(!deliveryAddress.longitude || !deliveryAddress.latitude||!deliveryAddress.text){
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

})