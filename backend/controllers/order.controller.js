import { ApiError } from "../config/apierror.js";
import { ApiResponse } from "../config/apiresponse.js";
import { asyncHandler } from "../config/asynchandler.js";
import { DeliveryAssignment } from "../models/deliveryAssignment.model.js";
import { Order } from "../models/order.model.js";
import { Shop } from "../models/shop.model.js";
import { User } from "../models/user.model.js";
import { sentDeliveryOtp } from "../utils/mail.js";
import Razorpay from 'razorpay';
import dotenv from 'dotenv'
import { orderRouter } from "../routes/order.route.js";
dotenv.config()

let instance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_API_SECRET,
});

export const placeOrder = asyncHandler(async (req, res) => {
    const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body;
    if (cartItems.length == 0) {
        throw new ApiError(400, "Cart is empty");
    }
    if (!deliveryAddress || !deliveryAddress.longitude || !deliveryAddress.latitude || !deliveryAddress.text) {
        throw new ApiError(400, "Full delivery address required")
    }
    const groupItemByShop = {}
    cartItems.forEach(item => {
        const shopId = item.shop
        if (!groupItemByShop[shopId]) {
            groupItemByShop[shopId] = []
        }
        groupItemByShop[shopId].push(item)
    })
    const shopOrders = await Promise.all(Object.keys(groupItemByShop).map(async shopId => {
        const shop = await Shop.findById(shopId).populate("owner");
        if (!shop) {
            throw new ApiError(400, "Shop not found");
        }
        const items = groupItemByShop[shopId]
        const subtotal = items.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0);
        return {
            shop: shop._id,
            owner: shop.owner,
            subtotal,
            shopOrderItems: items.map((i) => ({
                item: i._id,
                price: i.price,
                quantity: i.quantity,
                name: i.name
            }))
        }
    }))

    if (paymentMethod == "online") {
        const razorOrder = await instance.orders.create({
            amount: Math.round(totalAmount * 100),
            currency: 'INR',
            receipt: `receipt_${Date.now()}`
        })
        const order = await Order.create({
            user: req.userId,
            paymentMethod,
            deliveryAddress,
            totalAmount,
            shopOrders,
            razorpayOrderId: (await razorOrder).id,
            payment: false
        })
        return res.status(200).json(new ApiResponse(200, {
            razorOrder,
            orderId: order._id
        }, "Online payment order fetched"))
    }
    const order = await Order.create({
        user: req.userId,
        paymentMethod,
        deliveryAddress,
        totalAmount,
        shopOrders
    })
    await order.populate("shopOrders.shopOrderItems.item", "name price quantity image")
    await order.populate("shopOrders.shop", "name")
    await order.populate("shopOrders.owner", "fullName socketId")
    await order.populate("user")

    const io = req.app.get("io")
    if (io) {
        order.shopOrders.forEach(shopOrder => {
            const ownerSocketId = shopOrder.owner.socketId;
            
            if (ownerSocketId) {
                
                io.to(ownerSocketId).emit("newOrder", {
                    _id: order._id,
                    paymentMethod: order.paymentMethod,
                    user: order.user,
                    shopOrder: shopOrder,
                    createdAt: order.createdAt,
                    deliveryAddress: order.deliveryAddress,
                    payment: order.payment
                });
            }
        });
    }

    return res.status(201).json(new ApiResponse(201, order, "Order placed"))

})
export const verifyPayment = asyncHandler(async (req, res) => {
    const { razorpay_paymentId, orderId } = req.body;
    const payment = await instance.payments.fetch(razorpay_paymentId);
    if (!payment || payment.status != "captured") {
        throw new ApiError(400, "Payment not captured")
    }
    const order = await Order.findById(orderId)
    if (!order) {
        throw new ApiError(400, "Order not found")
    }
    order.payment = true;
    order.razorpayPaymentId = razorpay_paymentId
    await order.save()
    await order.populate("shopOrders.shopOrderItems.item", "name price image")
    await order.populate("shopOrders.shop", "name")
    await order.populate("shopOrders.owner", "fullName socketId")
    await order.populate("user")

    const io=req.app.get("io")
    if (io) {
    order.shopOrders.forEach(shopOrder => {
        const ownerSocketId = shopOrder.owner.socketId;
        
        if (ownerSocketId) {
        
            io.to(ownerSocketId).emit("newOrder", {
                _id: order._id,
                paymentMethod: order.paymentMethod,
                user: order.user,
                shopOrder: shopOrder,
                createdAt: order.createdAt,
                deliveryAddress: order.deliveryAddress,
                payment: order.payment
            });
        }
        
    });
}
    return res.status(200).json(new ApiResponse(200, order, "Order verified successfully"))
})

export const getMyorders = asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId);
    if (user.role == "customer") {
        const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 })
            .populate("shopOrders.owner", "name email phone")
            .populate("shopOrders.shop", "name")
            .populate("shopOrders.shopOrderItems.item", "name price quantity image")
            .populate("shopOrders.assignedDeliveryBoy", "fullName email phone")

        return res.status(200).json(new ApiResponse(200, orders, "All my orders"))
    }
    else if (user.role == "restaurant") {
        const orders = await Order.find({ "shopOrders.owner": req.userId }).sort({ createdAt: -1 })
            .populate("user")
            .populate("shopOrders.shop", "name")
            .populate("shopOrders.shopOrderItems.item", "name price quantity image")
            .populate("shopOrders.assignedDeliveryBoy", "fullName email phone")

        return res.status(200).json(new ApiResponse(200, orders, "All owner orders"))
    }
})
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { orderId, shopId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(400, "Order not Found");
    }

    const shopOrder = order.shopOrders.find(o => o.shop.toString() === shopId);
    if (!shopOrder) {
        throw new ApiError(400, "shop Order not Found");
    }

    shopOrder.status = status;

    // Close out the delivery assignment when the order is marked delivered,
    // so that delivery boy becomes available again for future orders
    if (status === "delivered" && shopOrder.assignment) {
        await DeliveryAssignment.findByIdAndUpdate(shopOrder.assignment, {
            status: "delivered"
        });
    }

    let deliveryBoysPayload = [];

    if (shopOrder.status === "out for delivery" && !shopOrder.assignment) {
        const { latitude, longitude } = order.deliveryAddress;
        let deliveryAssignment = await DeliveryAssignment.findOne({
            shopOrderId: shopOrder._id,
            status: "broadcasted"
        });

        if (!deliveryAssignment) {
            const nearByDeliveryBoy = await User.find({
                role: "delivery",
                location: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [Number(longitude), Number(latitude)]
                        },
                        $maxDistance: 5000
                    }
                }
            });

            const nearByIds = nearByDeliveryBoy.map(b => b._id);

            const busyIds = await DeliveryAssignment.find({
                assignedTo: { $in: nearByIds },
                status: "assigned"
            }).distinct("assignedTo");

            const busyIdSet = new Set(busyIds.map(id => String(id)));
            const availableBoys = nearByDeliveryBoy.filter(b => !busyIdSet.has(String(b._id)));
            const candidates = availableBoys.map(b => b._id);

            if (candidates.length === 0) {
                await order.save();
                await order.populate("shopOrders.shop", "name");
                const updatedShopOrderNoBoy = order.shopOrders.find(o => o.shop._id.toString() === shopId);

                return res.status(200).json(new ApiResponse(200, {
                    shopOrder: updatedShopOrderNoBoy,
                    assignedDeliveryBoy: null,
                    availableBoys: [],
                    warning: "Status updated, but no delivery boy is available nearby"
                }, "Status updated (no delivery boy available)"));
            }

            deliveryAssignment = await DeliveryAssignment.create({
                order: orderId,
                shop: shopOrder.shop,
                shopOrderId: shopOrder._id,
                broadcastedTo: candidates,
                status: "broadcasted"
            });

            deliveryBoysPayload = availableBoys.map(b => ({
                id: b._id,
                fullName: b.fullName,
                latitude: b.location.coordinates?.[1],
                longitude: b.location.coordinates?.[0],
                phone: b.phone
            }));
        } else {
            const existingCandidates = await User.find({ _id: { $in: deliveryAssignment.broadcastedTo } });
            deliveryBoysPayload = existingCandidates.map(b => ({
                id: b._id,
                fullName: b.fullName,
                latitude: b.location.coordinates?.[1],
                longitude: b.location.coordinates?.[0],
                phone: b.phone
            }));
        }

        shopOrder.assignment = deliveryAssignment._id;
    }

    await order.save();

    await order.populate("shopOrders.shop", "name");
    await order.populate("shopOrders.assignedDeliveryBoy", "fullName email phone");

    const updatedShopOrder = order.shopOrders.find(o => o.shop._id.toString() === shopId);

    return res.status(200).json(new ApiResponse(200, {
        shopOrder: updatedShopOrder,
        assignedDeliveryBoy: updatedShopOrder?.assignedDeliveryBoy,
        availableBoys: deliveryBoysPayload,
        assignment: updatedShopOrder?.assignment
    }, "Status updated"));
});
export const deliveryBoyAssignment = asyncHandler(async (req, res) => {
    const assignments = await DeliveryAssignment.find({
        broadcastedTo: req.userId,
        status: "broadcasted"
    }).populate("shop").populate("order")

    const formatted = assignments
        .filter(b => b.shop && b.order)   // ✅ skip any assignment with a deleted/missing shop or order
        .map(b => {
            const shopOrder = b.order.shopOrders.find(
                a => a._id.toString() === b.shopOrderId.toString()
            )
            return {
                assignmentId: b._id,
                orderId: b.order._id,
                shopName: b.shop.name,
                deliveryAddress: b.order.deliveryAddress,
                items: shopOrder?.shopOrderItems || [],
                subtotal: shopOrder?.subtotal || 0
            }
        })

    return res.status(200).json(new ApiResponse(200, formatted, "Broadcasted assignments fetched"))
})
export const acceptOrder = asyncHandler(async (req, res) => {
    const { assignmentId } = req.params;
    const alreadyAssigned = await DeliveryAssignment.findOne({
        assignedTo: req.userId,
        status: { $nin: ["broadcasted", "delivered"] }
    })
    if (alreadyAssigned) {
        throw new ApiError(400, "You are already assigned to another order")
    }
    const assignment = await DeliveryAssignment.findOneAndUpdate(
        { _id: assignmentId, status: "broadcasted" },
        { assignedTo: req.userId, status: "assigned", acceptedAt: new Date() },
        { returnDocument: 'after' }
    )
    if (!assignment) {
        throw new ApiError(400, "This assignment is no longer available")
    }

    const order = await Order.findById(assignment.order)
    if (!order) {
        throw new ApiError(400, "Order not found")
    }

    const shopOrder = order.shopOrders.find(a => a._id.toString() === assignment.shopOrderId.toString())
    if (!shopOrder) {
        throw new ApiError(400, "Shop order not found")
    }

    shopOrder.assignedDeliveryBoy = req.userId
    await order.save()
    await order.populate("shopOrders.assignedDeliveryBoy", "fullName email phone")

    const updatedShopOrder = order.shopOrders.find(a => a._id.toString() === assignment.shopOrderId.toString())

    return res.status(200).json(new ApiResponse(200, {
        assignment,
        shopOrder: updatedShopOrder
    }, "Order accepted"))
})
export const getCurrOrder = asyncHandler(async (req, res) => {
    const assignment = await DeliveryAssignment.findOne({
        assignedTo: req.userId,
        status: "assigned"
    }).populate("shop", "name")
        .populate("assignedTo", "fullname email phone location")
        .populate({
            path: "order",
            populate: [{ path: "user", select: "fullName email phone location" }]
        })
    if (!assignment) {
        throw new ApiError(400, "assignment not found")
    }
    if (!assignment.order) {
        throw new ApiError(400, "order not found")
    }
    const shopOrder = assignment.order.shopOrders.find(a => String(a.id) === String(assignment.shopOrderId))
    if (!shopOrder) {
        throw new ApiError(400, "shopOrder not found")
    }
    let deliveryBoyLocation = { lati: null, long: null }
    if (assignment.assignedTo.location.coordinates.length == 2) {
        deliveryBoyLocation.lati = assignment.assignedTo.location.coordinates[1];
        deliveryBoyLocation.long = assignment.assignedTo.location.coordinates[0];
    }

    let customerLocation = { lati: null, long: null }
    if (assignment.order.deliveryAddress) {
        customerLocation.lati = assignment.order.deliveryAddress.latitude
        customerLocation.long = assignment.order.deliveryAddress.longitude
    }
    return res.status(200).json(
        new ApiResponse(200, {
            _id: assignment.order._id,
            shop: assignment.shop,
            user: assignment.order.user,
            shopOrder,
            deliveryAddress: assignment.order.deliveryAddress,
            deliveryBoyLocation,
            customerLocation
        }, "Current order has been fetched successfully")
    )
})
export const getOrderById = asyncHandler(async (req, res) => {
    const { orderId } = req.params
    const order = await Order.findById(orderId).populate("user").populate({
        path: "shopOrders.shop",
        model: "Shop"
    }).populate({ path: "shopOrders.assignedDeliveryBoy", model: "User" })
        .populate({ path: "shopOrders.shopOrderItems.item", model: "Item" }).lean()

    if (!order) {
        throw new ApiError(400, "Order not found")
    }
    return res.status(200).json(new ApiResponse(200, order, "order fetched succesfully"))
})
export const sendDeliveryOtp = asyncHandler(async (req, res) => {
    const { orderId, shopOrderId } = req.body;
    const order = await Order.findById(orderId).populate("user")
    if (!order) {
        throw new ApiError(400, "Order not found")
    }
    const shopOrder = order.shopOrders.id(shopOrderId)
    if (!shopOrder) {
        throw new ApiError(400, "shopOrder not found")
    }
    const otp = Math.floor(Math.random() * 9000 + 1000).toString();
    shopOrder.deliveryOtp = otp
    shopOrder.otpExpires = Date.now() + 5 * 60 * 1000
    await order.save()
    await sentDeliveryOtp(order.user, otp)

    return res.status(200).json(new ApiResponse(200, {}, "Otp sent successfully"))

})
export const verifyOtp = asyncHandler(async (req, res) => {
    const { orderId, shopOrderId, otp } = req.body;
    const order = await Order.findById(orderId).populate("user")
    const shopOrder = order.shopOrders.id(shopOrderId)
    if (!order || !shopOrder) {
        throw new ApiError(400, "Order or shopOrder not found")
    }
    if (shopOrder.deliveryOtp !== otp || !shopOrder.otpExpires || shopOrder.otpExpires < Date.now()) {
        throw new ApiError(400, "Invalid or expired OTP")
    }
    shopOrder.status = "delivered"
    shopOrder.deliveredAt = Date.now()
    await order.save()
    await DeliveryAssignment.deleteOne({
        shopOrderId,
        order: orderId,
        assignedTo: shopOrder.assignedDeliveryBoy
    })
    return res.status(200).json(new ApiResponse(200, {}, "Otp verified successfully"))
})