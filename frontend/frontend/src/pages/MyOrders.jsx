import React from 'react'
import { useSelector } from 'react-redux'
import Navbar from '../components/Navbar'
import { Package, MapPin, Wallet, Smartphone, Store, User, Receipt } from 'lucide-react'

function MyOrders() {
    const { userData, myOrders } = useSelector(state => state.user)
    const isOwner = userData?.role === "restaurant"

    const getRelevantShopOrders = (order) => {
        if (!isOwner) return order.shopOrders
        return order.shopOrders.filter(so => so.owner === userData._id || so.owner?._id === userData._id)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-orange-500 p-2.5 rounded-xl">
                        <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
                            {isOwner ? "Incoming Orders" : "My Orders"}
                        </h1>
                        <p className="text-gray-500 text-sm">
                            {isOwner ? "Orders placed by customers for your shop" : "Track and review your past orders"}
                        </p>
                    </div>
                </div>

                {!myOrders ? (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center text-gray-400">
                        Loading orders...
                    </div>
                ) : myOrders.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 px-6 flex flex-col items-center text-center">
                        <Package className="w-10 h-10 text-gray-300 mb-3" />
                        <p className="text-gray-600 font-medium">No orders yet</p>
                        <p className="text-gray-400 text-sm mt-1">
                            {isOwner ? "New orders will show up here." : "Your placed orders will show up here."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {myOrders.map((order) => {
                            const relevantShopOrders = getRelevantShopOrders(order)
                            const relevantTotal = relevantShopOrders.reduce((sum, so) => sum + so.subtotal, 0)
                            const itemCount = relevantShopOrders.reduce(
                                (sum, so) => sum + so.shopOrderItems.reduce((s, i) => s + i.quantity, 0), 0
                            )

                            return (
                                <div
                                    key={order._id}
                                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between gap-3 px-5 py-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                                                <Receipt className="w-4 h-4 text-orange-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-800 truncate">
                                                    #{order._id.slice(-8).toUpperCase()}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                                        day: "numeric",
                                                        month: "short",
                                                        hour: "numeric",
                                                        minute: "2-digit"
                                                    })}
                                                    {" · "}{itemCount} item{itemCount !== 1 ? "s" : ""}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 bg-gray-50 text-gray-600 text-xs font-medium pl-2 pr-3 py-1.5 rounded-full shrink-0">
                                            {order.paymentMethod === "cod" ? (
                                                <Wallet className="w-3.5 h-3.5 text-orange-500" />
                                            ) : (
                                                <Smartphone className="w-3.5 h-3.5 text-orange-500" />
                                            )}
                                            {order.paymentMethod === "cod" ? "COD" : "Online"}
                                        </div>
                                    </div>

                                    {/* Customer info — owner view only */}
                                    {isOwner && order.user && (
                                        <div className="flex items-center gap-2 px-5 pb-3">
                                            <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium text-gray-800">{order.user.fullName}</span>
                                                {order.user.phone && <span className="text-gray-400"> · {order.user.phone}</span>}
                                            </p>
                                        </div>
                                    )}

                                    <div className="h-px bg-gray-100 mx-5" />

                                    {/* Per-shop breakdown */}
                                    <div>
                                        {relevantShopOrders.map((shopOrder, idx) => (
                                            <div
                                                key={shopOrder._id}
                                                className={`px-5 py-4 ${idx !== relevantShopOrders.length - 1 ? "border-b border-gray-50" : ""}`}
                                            >
                                                {!isOwner && (
                                                    <div className="flex items-center gap-1.5 mb-3">
                                                        <Store className="w-3.5 h-3.5 text-gray-400" />
                                                        <p className="font-semibold text-xs text-gray-500 uppercase tracking-wide">
                                                            {shopOrder.shop?.name || "Shop"}
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="space-y-3">
                                                    {shopOrder.shopOrderItems.map((orderItem) => (
                                                        <div key={orderItem._id} className="flex items-center gap-3">
                                                            {orderItem.item?.image ? (
                                                                <img
                                                                    src={orderItem.item.image}
                                                                    alt={orderItem.name}
                                                                    className="w-11 h-11 rounded-xl object-cover shrink-0 ring-1 ring-gray-100"
                                                                />
                                                            ) : (
                                                                <div className="w-11 h-11 rounded-xl bg-gray-50 shrink-0" />
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-800 truncate">
                                                                    {orderItem.name}
                                                                </p>
                                                                <p className="text-xs text-gray-400">
                                                                    Qty {orderItem.quantity} · ₹{orderItem.price} each
                                                                </p>
                                                            </div>
                                                            <span className="text-sm font-semibold text-gray-800 shrink-0">
                                                                ₹{orderItem.price * orderItem.quantity}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Delivery + total footer */}
                                    <div className="px-5 py-4 bg-gray-50/70 border-t border-gray-100 space-y-3">
                                        <div className="flex items-start gap-2 text-xs text-gray-500">
                                            <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                                            <span className="line-clamp-1">{order.deliveryAddress?.text}</span>
                                        </div>
                                        <div className="flex items-center justify-between pt-1">
                                            <span className="text-sm font-semibold text-gray-700">
                                                {isOwner ? "Your Portion" : "Total Paid"}
                                            </span>
                                            <span className="text-lg font-bold text-gray-900">
                                                ₹{isOwner ? relevantTotal : order.totalAmount}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default MyOrders