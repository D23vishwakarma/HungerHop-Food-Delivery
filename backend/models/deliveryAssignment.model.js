import mongoose from "mongoose";

const deliverySchema=new mongoose.Schema({
    order:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Order"
    },
    shop:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Shop"
    },
    shopOrderId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    broadcastedTo:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    assignedTo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:null
    },
    status:{
        type:String,
        enum:["broadcasted", "assigned", "delivered", "expired", "cancelled"],
        default:"broadcasted"
    },
    acceptedAt:Date
},{timestamps:true})

export const DeliveryAssignment=mongoose.model("DeliveryAssignment",deliverySchema);