import mongoose from "mongoose";

const shopOrderItemSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item"
    },
    name: String,
    price: Number,
    quantity: Number
}, { timestamps: true })

const shopOrderSchema = new mongoose.Schema({
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop"
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    subtotal: { type: Number },
    shopOrderItems: [shopOrderItemSchema],
    status: {
        type: String,
        enum: ["pending", "preparing", "out for delivery", "delivered"],
        default: "pending"
    },
    assignedDeliveryBoy: {       
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    assignment: {                 
        type: mongoose.Schema.Types.ObjectId,
        ref: "DeliveryAssignment",
        default: null
    },
    deliveryOtp:{
        type:String,
        default:null
    },
    otpExpires:{
        type:Date,
        default:null
    },
    deliveredAt:{
        type:Date,
        default:null
    }
}, { timestamps: true })

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    paymentMethod: {
        type: String,
        enum: ["cod", "online"],
        required: true
    },
    deliveryAddress: {
        text: { type: String, required: true },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    totalAmount: {
        type: Number
    },
    shopOrders: [shopOrderSchema],
    assignment:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"DeliveryAssignment",
        default:null
    },
    payment:{
        type:Boolean,
        default:false
    },
    razorpayOrderId:{
        type:String,
        default:""
    },
    razorpayPaymentId:{
        type:String,
        default:""
    }
}, { timestamps: true })

export const Order = mongoose.model("Order", orderSchema);