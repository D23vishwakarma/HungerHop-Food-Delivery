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
    shopOrder:{
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
        enum:["assigned","broadcasted","expired"],
        default:"broadcasted"
    }
},{timestamps:true})

export const DeliveryAssignment=mongoose.model("DeliveryAssignment",deliverySchema);