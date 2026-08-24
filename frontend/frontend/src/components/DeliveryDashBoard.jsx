import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Navbar from './Navbar'
import { serverUrl } from '../App'
import { useSelector } from 'react-redux'
import { Store, MapPin, IndianRupee, Zap, CheckCircle2, PackageSearch, Navigation, Phone, Truck } from 'lucide-react'
import DeliveryLiveTracking from './DeliveryLiveTracking'

function getGreeting() {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    if (hour < 21) return "Good evening"
    return "Still on the road"
}

const orderStatusSteps = ["preparing", "out for delivery", "delivered"]

function DeliveryDashBoard() {
    const { userData } = useSelector(state => state.user)
    const [assignments, setAssignments] = useState(null)
    const [acceptingId, setAcceptingId] = useState(null)
    const [justAcceptedId, setJustAcceptedId] = useState(null)
    const [currOrder, setCurrOrder] = useState(undefined) // undefined = not fetched yet, null = confirmed none
    const [otpSent, setOtpSent] = useState(false)
    const [otpInput, setOtpInput] = useState("")
    const [sendingOtp, setSendingOtp] = useState(false)
    const [verifyingOtp, setVerifyingOtp] = useState(false)
    const [otpError, setOtpError] = useState("")

    const fetchAssignments = async () => {
        try {
            const result = await axios.get(
                `${serverUrl}/order/order-assignment`,
                { withCredentials: true }
            )
            setAssignments(result.data.data || [])
        } catch (error) {
            console.log(error)
            setAssignments([])
        }
    }

    const getCurrOrder = async () => {
        try {
            const result = await axios.get(
                `${serverUrl}/order/getcurrorder`,
                { withCredentials: true }
            )
            setCurrOrder(result.data.data || null)
        } catch (error) {
            console.log(error)
            setCurrOrder(null)
        }
    }

    useEffect(() => {
        getCurrOrder()
        fetchAssignments()
        const interval = setInterval(() => {
            getCurrOrder()
            fetchAssignments()
        }, 10000)
        return () => clearInterval(interval)
    }, [])

    const handleAccept = async (assignmentId) => {
        setAcceptingId(assignmentId)
        try {
            await axios.put(
                `${serverUrl}/order/accept-order/${assignmentId}`,
                {},
                { withCredentials: true }
            )
            await getCurrOrder()
            setJustAcceptedId(assignmentId)
            setTimeout(() => {
                setAssignments(prev => prev.filter(a => a.assignmentId !== assignmentId))
                setJustAcceptedId(null)
            }, 900)
        } catch (error) {
            alert(error.response?.data?.message || "Failed to accept order")
            fetchAssignments()
        } finally {
            setAcceptingId(null)
        }
    }

    const handleSendOtp = async () => {
        if (!currOrder) return
        setSendingOtp(true)
        setOtpError("")
        try {
            await axios.post(
                `${serverUrl}/order/senddeliveryotp`,
                { orderId: currOrder._id, shopOrderId: currOrder.shopOrder._id },
                { withCredentials: true }
            )
            setOtpSent(true)
        } catch (error) {
            alert(error.response?.data?.message || "Failed to send OTP")
        } finally {
            setSendingOtp(false)
        }
    }

    const handleVerifyOtp = async () => {
        if (!currOrder || !otpInput) return
        setVerifyingOtp(true)
        setOtpError("")
        try {
            await axios.post(
                `${serverUrl}/order/verify-otp`,
                { orderId: currOrder._id, shopOrderId: currOrder.shopOrder._id, otp: otpInput },
                { withCredentials: true }
            )
            // ✅ assignment is deleted server-side on success, so the next getCurrOrder
            // call correctly returns null and the dashboard falls back to the broadcast list
            setOtpSent(false)
            setOtpInput("")
            await getCurrOrder()
            fetchAssignments()
        } catch (error) {
            setOtpError(error.response?.data?.message || "Invalid or expired OTP")
        } finally {
            setVerifyingOtp(false)
        }
    }

    const hasActiveOrder = currOrder && currOrder !== null
    const currentStepIndex = hasActiveOrder ? orderStatusSteps.indexOf(currOrder.shopOrder?.status) : -1

    return (
        <div className="min-h-screen bg-[#FAF7F2]">
            <Navbar />

            <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

                {/* Greeting */}
                <div className="mb-7 sm:mb-9">
                    <p className="text-[13px] font-semibold text-orange-500 tracking-wide uppercase mb-1">
                        {getGreeting()}{userData?.fullName ? `, ${userData.fullName.split(" ")[0]}` : ""}
                    </p>
                    <h1 className="text-2xl sm:text-[28px] font-bold text-gray-900 tracking-tight">
                        {hasActiveOrder
                            ? "You're on a run"
                            : assignments?.length > 0
                                ? `${assignments.length} run${assignments.length !== 1 ? "s" : ""} waiting nearby`
                                : "Ready when you are"}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1.5">
                        {hasActiveOrder
                            ? "Finish this delivery to see new requests again."
                            : "New pickups appear here the moment a nearby shop needs a rider."}
                    </p>
                </div>

                {/* Still loading initial state */}
                {currOrder === undefined || !assignments ? (
                    <div className="space-y-3">
                        {[0, 1].map(i => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 h-40 animate-pulse" />
                        ))}
                    </div>

                ) : hasActiveOrder ? (

                    /* Active order — takes over the screen */
                    <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">

                        {/* Status progress */}
                        <div className="px-5 pt-5 pb-4 bg-orange-50/60">
                            <div className="flex items-center gap-1.5 mb-3">
                                <Truck className="w-4 h-4 text-orange-500" />
                                <span className="text-xs font-bold text-orange-600 uppercase tracking-wide">
                                    Active delivery
                                </span>
                            </div>
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

                        {/* Live tracking map */}
                        <div className="px-5 pt-5">
                            <DeliveryLiveTracking data={currOrder} />
                        </div>

                        <div className="p-5">
                            {/* Route line — pickup to drop */}
                            <div className="flex gap-4 mb-4">
                                <div className="flex flex-col items-center pt-1 shrink-0">
                                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                                    <div className="w-px flex-1 my-1 border-l-2 border-dashed border-gray-200" />
                                    <Navigation className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Store className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                        <p className="font-semibold text-sm text-gray-800 truncate">
                                            {currOrder.shop?.name}
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-400 mb-4">Pickup point</p>

                                    <div className="flex items-start gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                                        <span className="text-sm text-gray-600 line-clamp-2">
                                            {currOrder.deliveryAddress?.text}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="bg-gray-50 rounded-xl px-3.5 py-2.5 space-y-1 mb-4">
                                {currOrder.shopOrder?.shopOrderItems?.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-xs text-gray-500">
                                        <span>{item.name} <span className="text-gray-400">× {item.quantity}</span></span>
                                        <span className="font-medium text-gray-700">₹{item.price * item.quantity}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Customer contact + total */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <div className="flex items-center gap-1 text-gray-900 font-bold text-sm">
                                    <IndianRupee className="w-3.5 h-3.5" />
                                    <span>{currOrder.shopOrder?.subtotal}</span>
                                </div>

                                {currOrder.user?.phone && (
                                    <a
                                        href={`tel:${currOrder.user.phone}`}
                                        className="flex items-center gap-1.5 bg-blue-50 text-blue-600 text-sm font-semibold px-4 py-2 rounded-full hover:bg-blue-100 transition-colors"
                                    >
                                        <Phone className="w-3.5 h-3.5" /> Call customer
                                    </a>
                                )}
                            </div>

                            {/* Delivery OTP */}
                            {!otpSent ? (
                                <button
                                    onClick={handleSendOtp}
                                    disabled={sendingOtp}
                                    className="w-full mt-4 flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-3 rounded-xl disabled:opacity-60 transition-all active:scale-[0.98]"
                                >
                                    {sendingOtp ? (
                                        "Sending OTP…"
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-4 h-4" /> Send Delivery OTP
                                        </>
                                    )}
                                </button>
                            ) : (
                                <div className="mt-4 bg-green-50 rounded-xl p-4 border border-green-100">
                                    <p className="text-xs font-semibold text-green-700 mb-2">
                                        OTP sent to the customer — ask them for the 4-digit code
                                    </p>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={4}
                                            value={otpInput}
                                            onChange={(e) => {
                                                setOtpInput(e.target.value.replace(/\D/g, ""))
                                                setOtpError("")
                                            }}
                                            placeholder="4-digit OTP"
                                            className="flex-1 text-center tracking-[0.3em] text-lg font-semibold border border-green-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
                                        />
                                        <button
                                            onClick={handleVerifyOtp}
                                            disabled={verifyingOtp || otpInput.length !== 4}
                                            className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-50 transition-colors"
                                        >
                                            {verifyingOtp ? "Verifying…" : "Verify"}
                                        </button>
                                    </div>
                                    {otpError && (
                                        <p className="text-xs text-red-500 mt-2">{otpError}</p>
                                    )}
                                    <button
                                        onClick={handleSendOtp}
                                        disabled={sendingOtp}
                                        className="text-xs text-green-600 font-medium mt-2 hover:underline disabled:opacity-50"
                                    >
                                        {sendingOtp ? "Resending…" : "Resend OTP"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                ) : assignments.length === 0 ? (

                    /* Empty state */
                    <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 px-6 flex flex-col items-center text-center">
                        <div className="relative w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-4">
                            <PackageSearch className="w-8 h-8 text-orange-400" />
                            <span className="absolute inset-0 rounded-full border-2 border-orange-200 animate-ping opacity-40" />
                        </div>
                        <p className="text-gray-800 font-semibold">No delivery requests right now</p>
                        <p className="text-gray-400 text-sm mt-1 max-w-xs">
                            Keep this tab open — as soon as a nearby shop marks an order "out for delivery," it'll show up here.
                        </p>
                    </div>

                ) : (

                    /* Assignment cards */
                    <div className="space-y-4">
                        {assignments.map((a) => {
                            const isAccepting = acceptingId === a.assignmentId
                            const isDone = justAcceptedId === a.assignmentId

                            return (
                                <div
                                    key={a.assignmentId}
                                    className={`relative bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 ${
                                        isDone ? "border-green-200 ring-2 ring-green-100" : "border-gray-100 hover:border-orange-200 hover:shadow-md"
                                    }`}
                                >
                                    <div className="flex p-4 sm:p-5 gap-4">

                                        {/* Route line — pickup to drop */}
                                        <div className="flex flex-col items-center pt-1 shrink-0">
                                            <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                                            <div className="w-px flex-1 my-1 border-l-2 border-dashed border-gray-200" />
                                            <Navigation className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">

                                            <div className="flex items-center gap-1.5 mb-1">
                                                <Store className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                <p className="font-semibold text-sm text-gray-800 truncate">
                                                    {a.shopName}
                                                </p>
                                            </div>
                                            <p className="text-xs text-gray-400 mb-4">Pickup point</p>

                                            <div className="flex items-start gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                                                <span className="text-sm text-gray-600 line-clamp-2">
                                                    {a.deliveryAddress?.text}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items */}
                                    <div className="px-4 sm:px-5 pb-4">
                                        <div className="bg-gray-50 rounded-xl px-3.5 py-2.5 space-y-1">
                                            {a.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between text-xs text-gray-500">
                                                    <span>{item.name} <span className="text-gray-400">× {item.quantity}</span></span>
                                                    <span className="font-medium text-gray-700">₹{item.price * item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 bg-gray-50/60 border-t border-gray-100">
                                        <div className="flex items-center gap-1 text-gray-900 font-bold text-sm">
                                            <IndianRupee className="w-3.5 h-3.5" />
                                            <span>{a.subtotal}</span>
                                        </div>

                                        <button
                                            onClick={() => handleAccept(a.assignmentId)}
                                            disabled={isAccepting || isDone}
                                            className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full transition-all active:scale-95 disabled:active:scale-100 ${
                                                isDone
                                                    ? "bg-green-500 text-white"
                                                    : "bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-60"
                                            }`}
                                        >
                                            {isDone ? (
                                                <>
                                                    <CheckCircle2 className="w-4 h-4" /> On your way
                                                </>
                                            ) : isAccepting ? (
                                                "Accepting…"
                                            ) : (
                                                <>
                                                    <Zap className="w-3.5 h-3.5" /> Accept run
                                                </>
                                            )}
                                        </button>
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

export default DeliveryDashBoard