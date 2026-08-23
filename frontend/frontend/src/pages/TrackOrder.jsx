import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { serverUrl } from '../App'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { Store, MapPin, IndianRupee, User, Phone, PackageSearch } from 'lucide-react'
import DeliveryLiveTracking from '../components/DeliveryLiveTracking'

const orderStatusSteps = ["pending", "preparing", "out for delivery", "delivered"]

function TrackOrder() {
    const { orderId } = useParams()
    const [order, setOrder] = useState(undefined) // undefined = loading, null = not found

    const handleGetOrder = async () => {
        try {
            const result = await axios.get(
                `${serverUrl}/order/getorderbyid/${orderId}`,
                { withCredentials: true }
            )
            setOrder(result.data.data || null)
        } catch (error) {
            console.log(error)
            setOrder(null)
        }
    }

    useEffect(() => {
        handleGetOrder()
        const interval = setInterval(handleGetOrder, 10000) // keep status/map fresh while tracking
        return () => clearInterval(interval)
    }, [orderId])

    // Builds the { deliveryBoyLocation, customerLocation } shape DeliveryLiveTracking expects,
    // derived from the raw populated document (no precomputed location fields on this endpoint).
    const buildMapData = (shopOrder) => {
        const boyCoords = shopOrder.assignedDeliveryBoy?.location?.coordinates
        const hasBoyCoords = Array.isArray(boyCoords) && boyCoords.length === 2

        return {
            deliveryBoyLocation: {
                lati: hasBoyCoords ? boyCoords[1] : null,
                long: hasBoyCoords ? boyCoords[0] : null
            },
            customerLocation: {
                lati: order?.deliveryAddress?.latitude ?? null,
                long: order?.deliveryAddress?.longitude ?? null
            }
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

                {order === undefined ? (

                    /* Loading */
                    <div className="space-y-3">
                        <div className="bg-white rounded-2xl border border-gray-100 h-24 animate-pulse" />
                        <div className="bg-white rounded-2xl border border-gray-100 h-64 animate-pulse" />
                    </div>

                ) : order === null ? (

                    /* Not found */
                    <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 px-6 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-4">
                            <PackageSearch className="w-8 h-8 text-orange-400" />
                        </div>
                        <p className="text-gray-800 font-semibold">Order not found</p>
                        <p className="text-gray-400 text-sm mt-1 max-w-xs">
                            This order may have been removed, or the link is incorrect.
                        </p>
                    </div>

                ) : (

                    <>
                        {/* Header */}
                        <div className="mb-6">
                            <p className="text-[13px] font-semibold text-orange-500 tracking-wide uppercase mb-1">
                                Order #{order._id?.slice(-8).toUpperCase()}
                            </p>
                            <h1 className="text-2xl sm:text-[28px] font-bold text-gray-900 tracking-tight">
                                Tracking your order
                            </h1>
                        </div>

                        {/* Delivery address — shared across all shop orders in this order */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
                            <div className="flex items-start gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                                <span className="text-sm text-gray-600 line-clamp-2">
                                    {order.deliveryAddress?.text}
                                </span>
                            </div>
                        </div>

                        {/* One card per shop order — an order can span multiple shops */}
                        {order.shopOrders?.map((shopOrder) => {
                            const status = shopOrder.status
                            const currentStepIndex = orderStatusSteps.indexOf(status)
                            const showMap = status === "out for delivery" && shopOrder.assignedDeliveryBoy

                            return (
                                <div key={shopOrder._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">

                                    {/* Shop + status header */}
                                    <div className="px-4 pt-4 pb-3 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <Store className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                            <p className="font-semibold text-sm text-gray-800 truncate">
                                                {shopOrder.shop?.name}
                                            </p>
                                        </div>
                                        <span className="text-xs font-semibold text-orange-600 capitalize whitespace-nowrap">
                                            {status}
                                        </span>
                                    </div>

                                    {/* Status progress */}
                                    <div className="px-4 pb-4">
                                        <div className="flex items-center">
                                            {orderStatusSteps.map((step, idx) => (
                                                <React.Fragment key={step}>
                                                    <div className="flex flex-col items-center">
                                                        <div className={`w-2.5 h-2.5 rounded-full ${idx <= currentStepIndex ? "bg-orange-500" : "bg-gray-200"}`} />
                                                        <span className={`text-[10px] mt-1.5 capitalize whitespace-nowrap ${idx <= currentStepIndex ? "text-orange-600 font-semibold" : "text-gray-400"}`}>
                                                            {step}
                                                        </span>
                                                    </div>
                                                    {idx < orderStatusSteps.length - 1 && (
                                                        <div className={`flex-1 h-0.5 mx-1 mb-4 ${idx < currentStepIndex ? "bg-orange-400" : "bg-gray-200"}`} />
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Live map — only while actually out for delivery */}
                                    {showMap && (
                                        <div className="px-3 pb-3">
                                            <DeliveryLiveTracking data={buildMapData(shopOrder)} />
                                        </div>
                                    )}

                                    {/* Delivery partner */}
                                    {shopOrder.assignedDeliveryBoy && (
                                        <div className="px-4 pb-4">
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
                                                {shopOrder.assignedDeliveryBoy.phone && (
                                                    <a
                                                        href={`tel:${shopOrder.assignedDeliveryBoy.phone}`}
                                                        className="flex items-center gap-1 text-xs font-semibold text-blue-600 shrink-0"
                                                    >
                                                        <Phone className="w-3 h-3" /> {shopOrder.assignedDeliveryBoy.phone}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Items */}
                                    <div className="px-4 pb-4">
                                        <div className="bg-gray-50 rounded-xl px-3.5 py-2.5 space-y-1">
                                            {shopOrder.shopOrderItems?.map((item, idx) => (
                                                <div key={idx} className="flex justify-between text-xs text-gray-500">
                                                    <span>{item.name} <span className="text-gray-400">× {item.quantity}</span></span>
                                                    <span className="font-medium text-gray-700">₹{item.price * item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Subtotal */}
                                    <div className="px-4 pb-4 flex items-center justify-between pt-3 border-t border-gray-100">
                                        <span className="text-sm font-semibold text-gray-700">Subtotal</span>
                                        <div className="flex items-center gap-1 text-gray-900 font-bold text-base">
                                            <IndianRupee className="w-3.5 h-3.5" />
                                            <span>{shopOrder.subtotal}</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}

                        {/* Order total */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-700">Order Total</span>
                            <div className="flex items-center gap-1 text-gray-900 font-bold text-lg">
                                <IndianRupee className="w-4 h-4" />
                                <span>{order.totalAmount}</span>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    )
}

export default TrackOrder