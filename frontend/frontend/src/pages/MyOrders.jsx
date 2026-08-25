import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { serverUrl } from '../App'
import Navbar from '../components/Navbar'
import { Package, MapPin, Wallet, Smartphone, Store, User, Receipt, ArrowRight } from 'lucide-react'
import { setMyOrders,addMyOrders } from '../redux/userSlice'
import { useEffect } from 'react'
import { socket } from '../socket'

const statusStyles = {
    "pending": "bg-gray-100 text-gray-600",
    "preparing": "bg-orange-100 text-orange-600",
    "out for delivery": "bg-blue-100 text-blue-600",
    "delivered": "bg-green-100 text-green-600"
}

const statusOptions = ["pending", "preparing", "out for delivery", "delivered"]

function MyOrders() {
    const dispatch = useDispatch()
    const { userData, myOrders} = useSelector(state => state.user)
    const isOwner = userData?.role === "restaurant"
    const [updatingId, setUpdatingId] = useState(null)
    const [availableBoysMap, setAvailableBoysMap] = useState({}) // keyed by shopOrderId

    const getRelevantShopOrders = (order) => {
        if (!isOwner) return order.shopOrders
        return order.shopOrders.filter(so => {
            const ownerId = so.owner?._id ? so.owner._id : so.owner
            return String(ownerId) === String(userData._id)
        })
    }

    const handleStatusChange = async (orderId, shopId, shopOrderId, newStatus) => {
        setUpdatingId(shopOrderId)
        try {
            const result = await axios.put(
                `${serverUrl}/order/updatestatus/${orderId}/${shopId}`,
                { status: newStatus },
                { withCredentials: true }
            )

            const { shopOrder: updatedShopOrder, assignedDeliveryBoy, availableBoys, warning } = result.data.data

            if (warning) {
                alert(warning)
            }

            // store available boys for this specific shop order
            setAvailableBoysMap(prev => ({
                ...prev,
                [shopOrderId]: availableBoys || []
            }))

            const updatedOrders = myOrders.map(order => {
                if (order._id !== orderId) return order

                return {
                    ...order,
                    shopOrders: order.shopOrders.map(so =>
                        so._id === shopOrderId
                            ? { ...so, status: updatedShopOrder.status, assignedDeliveryBoy, assignment: updatedShopOrder.assignment }
                            : so
                    )
                }
            })

            dispatch(setMyOrders(updatedOrders))
        } catch (error) {
            console.log(error)
            alert("Failed to update status")
        } finally {
            setUpdatingId(null)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="w-full max-w-5xl mx-auto px-3 sm:px-5 lg:px-8 py-5 sm:py-8">

                {/* Page Header */}
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                    <div className="bg-orange-500 p-2.5 sm:p-3 rounded-xl shadow-sm shrink-0">
                        <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>

                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">
                            {isOwner ? "Incoming Orders" : "My Orders"}
                        </h1>

                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                            {isOwner
                                ? "Orders placed by customers for your shop"
                                : "Track and review your past orders"}
                        </p>
                    </div>
                </div>

                {/* Loading */}
                {!myOrders ? (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-14 sm:py-16 text-center text-gray-400">
                        Loading orders...
                    </div>

                ) : myOrders.length === 0 ? (

                    /* Empty State */
                    <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-14 sm:py-16 px-5 flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mb-4">
                            <Package className="w-7 h-7 text-orange-400" />
                        </div>

                        <p className="text-gray-700 font-semibold">
                            No orders yet
                        </p>

                        <p className="text-gray-400 text-xs sm:text-sm mt-1">
                            {isOwner
                                ? "New orders will show up here."
                                : "Your placed orders will show up here."}
                        </p>
                    </div>

                ) : (

                    /* Orders */
                    <div className="space-y-4 sm:space-y-5">

                        {myOrders.map((order) => {

                            const relevantShopOrders =
                                getRelevantShopOrders(order)

                            const relevantTotal =
                                relevantShopOrders.reduce(
                                    (sum, so) => sum + so.subtotal,
                                    0
                                )

                            const itemCount =
                                relevantShopOrders.reduce(
                                    (sum, so) =>
                                        sum +
                                        so.shopOrderItems.reduce(
                                            (s, i) => s + i.quantity,
                                            0
                                        ),
                                    0
                                )

                            // order counts as "trackable" for the customer if at least one
                            // relevant shop order hasn't been delivered yet
                            const isTrackable = !isOwner && relevantShopOrders.some(so => so.status !== "delivered")

                            return (
                                <div
                                    key={order._id}
                                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                                >

                                    {/* Order Header */}
                                    <div className="px-4 sm:px-5 lg:px-6 py-4">

                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                                            {/* Order ID */}
                                            <div className="flex items-center gap-3 min-w-0">

                                                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                                                    <Receipt className="w-4 h-4 text-orange-500" />
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="text-sm sm:text-base font-semibold text-gray-800 truncate">
                                                        #{order._id.slice(-8).toUpperCase()}
                                                    </p>

                                                    <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">
                                                        {new Date(
                                                            order.createdAt
                                                        ).toLocaleDateString("en-IN", {
                                                            day: "numeric",
                                                            month: "short",
                                                            hour: "numeric",
                                                            minute: "2-digit"
                                                        })}

                                                        {" · "}

                                                        {itemCount} item
                                                        {itemCount !== 1 ? "s" : ""}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Payment */}
                                            <div className="self-start sm:self-auto flex items-center gap-1.5 bg-gray-50 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full">

                                                {order.paymentMethod === "cod" ? (
                                                    <Wallet className="w-3.5 h-3.5 text-orange-500" />
                                                ) : (
                                                    <Smartphone className="w-3.5 h-3.5 text-orange-500" />
                                                )}

                                                {order.paymentMethod === "cod"
                                                    ? "Cash on Delivery"
                                                    : `Online Payment: ${order.payment?'Done':'pending'}`}
                                            </div>
                                        </div>

                                        {/* Customer */}
                                        {isOwner && order.user && (
                                            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">

                                                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                                    <User className="w-3.5 h-3.5 text-gray-500" />
                                                </div>

                                                <p className="text-xs sm:text-sm text-gray-600 truncate">
                                                    <span className="font-semibold text-gray-800">
                                                        {order.user.fullName}
                                                    </span>

                                                    {order.user.phone && (
                                                        <span className="text-gray-400">
                                                            {" · "}
                                                            {order.user.phone}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="h-px bg-gray-100" />

                                    {/* Shop Orders */}
                                    <div>
                                        {relevantShopOrders.map((shopOrder, idx) => (

                                            <div
                                                key={shopOrder._id}
                                                className={`px-4 sm:px-5 lg:px-6 py-4 sm:py-5 ${idx !== relevantShopOrders.length - 1
                                                        ? "border-b border-gray-100"
                                                        : ""
                                                    }`}
                                            >

                                                {/* Shop + Status */}
                                                <div className="flex items-center justify-between gap-3 mb-4">

                                                    {!isOwner ? (
                                                        <div className="flex items-center gap-1.5 min-w-0">

                                                            <Store className="w-4 h-4 text-gray-400 shrink-0" />

                                                            <p className="font-semibold text-xs sm:text-sm text-gray-500 uppercase tracking-wide truncate">
                                                                {shopOrder.shop?.name || "Shop"}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <span />
                                                    )}

                                                    {/* Status */}
                                                    {isOwner ? (
                                                        <select
                                                            value={shopOrder.status}
                                                            onChange={(e) =>
                                                                handleStatusChange(
                                                                    order._id,
                                                                    shopOrder.shop._id,
                                                                    shopOrder._id,
                                                                    e.target.value
                                                                )
                                                            }
                                                            disabled={
                                                                updatingId === shopOrder._id
                                                            }
                                                            className={`text-xs sm:text-sm font-semibold rounded-full px-3 py-1.5 border-0 focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:opacity-50 capitalize ${statusStyles[shopOrder.status]} -mt-52 sm:-mt-25`}
                                                        >
                                                            {statusOptions.map((s) => (
                                                                <option
                                                                    key={s}
                                                                    value={s}
                                                                    className="bg-white text-gray-700"
                                                                >
                                                                    {s}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <span
                                                            className={`text-[11px] sm:text-xs font-semibold rounded-full px-3 py-1.5 capitalize whitespace-nowrap ${statusStyles[shopOrder.status]}`}
                                                        >
                                                            {shopOrder.status}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Items */}
                                                <div className="space-y-3">

                                                    {shopOrder.shopOrderItems.map(
                                                        (orderItem) => (

                                                            <div
                                                                key={orderItem._id}
                                                                className="flex items-center gap-3"
                                                            >

                                                                {/* Image */}
                                                                {orderItem.item?.image ? (
                                                                    <img
                                                                        src={orderItem.item.image}
                                                                        alt={orderItem.name}
                                                                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover shrink-0 ring-1 ring-gray-100"
                                                                    />
                                                                ) : (
                                                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gray-100 shrink-0" />
                                                                )}

                                                                {/* Details */}
                                                                <div className="flex-1 min-w-0">

                                                                    <p className="text-sm font-semibold text-gray-800 truncate">
                                                                        {orderItem.name}
                                                                    </p>

                                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                                        Qty {orderItem.quantity}
                                                                        {" · "}
                                                                        ₹{orderItem.price} each
                                                                    </p>
                                                                </div>

                                                                {/* Price */}
                                                                <span className="text-sm sm:text-base font-bold text-gray-800 shrink-0">
                                                                    ₹
                                                                    {orderItem.price *
                                                                        orderItem.quantity}
                                                                </span>
                                                            </div>
                                                        )
                                                    )}
                                                </div>

                                                {/* Assigned or Available Delivery Boys — restaurant owner view */}
                                                {isOwner && shopOrder.status === "out for delivery" && (
                                                    <div className="mt-4 pt-3 border-t border-gray-100">
                                                        {shopOrder.assignedDeliveryBoy ? (
                                                            <>
                                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                                                    Assigned Delivery Boy
                                                                </p>
                                                                <div className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2">
                                                                    <div className="flex items-center gap-2 min-w-0">
                                                                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                                                            <User className="w-3.5 h-3.5 text-blue-500" />
                                                                        </div>
                                                                        <span className="text-sm font-medium text-gray-700 truncate">
                                                                            {shopOrder.assignedDeliveryBoy.fullName}
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-xs text-gray-500 shrink-0">
                                                                        {shopOrder.assignedDeliveryBoy.phone}
                                                                    </span>
                                                                </div>
                                                            </>
                                                        ) : availableBoysMap[shopOrder._id]?.length > 0 ? (
                                                            <>
                                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                                                    Available Delivery Boys
                                                                </p>
                                                                <div className="space-y-2">
                                                                    {availableBoysMap[shopOrder._id].map((boy) => (
                                                                        <div
                                                                            key={boy.id}
                                                                            className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2"
                                                                        >
                                                                            <div className="flex items-center gap-2 min-w-0">
                                                                                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                                                                    <User className="w-3.5 h-3.5 text-blue-500" />
                                                                                </div>
                                                                                <span className="text-sm font-medium text-gray-700 truncate">
                                                                                    {boy.fullName}
                                                                                </span>
                                                                            </div>
                                                                            <span className="text-xs text-gray-500 shrink-0">
                                                                                {boy.phone}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <p className="text-xs text-gray-400">
                                                                No delivery boys available nearby right now.
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Assigned Delivery Boy — customer view */}
                                                {!isOwner && shopOrder.assignedDeliveryBoy && (
                                                    <div className="mt-4 pt-3 border-t border-gray-100">
                                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                                            Your Delivery Partner
                                                        </p>
                                                        <div className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                                                    <User className="w-3.5 h-3.5 text-blue-500" />
                                                                </div>
                                                                <span className="text-sm font-medium text-gray-700 truncate">
                                                                    {shopOrder.assignedDeliveryBoy.fullName}
                                                                </span>
                                                            </div>
                                                            <a
                                                                href={`tel:${shopOrder.assignedDeliveryBoy.phone}`}
                                                                className="text-xs font-semibold text-blue-600 shrink-0"
                                                            >
                                                                {shopOrder.assignedDeliveryBoy.phone}
                                                            </a>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Footer */}
                                    <div className="px-4 sm:px-5 lg:px-6 py-4 bg-gray-50/80 border-t border-gray-100">

                                        {/* Address */}
                                        <div className="flex items-start gap-2 mb-4">

                                            <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />

                                            <span className="text-xs sm:text-sm text-gray-500 line-clamp-2">
                                                {order.deliveryAddress?.text}
                                            </span>
                                        </div>

                                        {/* Total */}
                                        <div className="flex items-center justify-between mb-3">

                                            <span className="text-sm sm:text-base font-semibold text-gray-700">
                                                {isOwner
                                                    ? "Your Portion"
                                                    : "Total Paid"}
                                            </span>

                                            <span className="text-xl sm:text-2xl font-bold text-gray-900">
                                                ₹
                                                {isOwner
                                                    ? relevantTotal
                                                    : order.totalAmount}
                                            </span>
                                        </div>

                                        {/* Track Order — customer view, only while order is still in progress */}
                                        {isTrackable && (
                                            <Link
                                                to={`/track-order/${order._id}`}
                                                className="-ml-1 w-30 flex items-center justify-center gap-1 bg-orange-400/10 hover:bg-orange-500/20 text-orange-500 text-sm font-semibold py-2 rounded-lg transition-colors"
                                            >
                                                Track Order
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>
        </div>
    )
}

export default MyOrders