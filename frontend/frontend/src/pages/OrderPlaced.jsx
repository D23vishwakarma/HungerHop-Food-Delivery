import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle2, MapPin, Wallet, Smartphone, ArrowRight } from 'lucide-react'
import Navbar from '../components/Navbar'

function OrderPlaced() {
    const location = useLocation()
    const navigate = useNavigate()
    const order = location.state?.order

    // If someone lands here directly (no order in state), don't show fake confirmation details
    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">No recent order found</h2>
                    <p className="text-gray-500 mb-6">Looks like you got here directly. Check your orders instead.</p>
                    <Link
                        to="/orders"
                        className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 rounded-lg transition"
                    >
                        View My Orders
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-lg mx-auto px-4 sm:px-6 py-10 sm:py-16">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 text-center">
                    <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-5">
                        <CheckCircle2 className="w-9 h-9 text-green-600" />
                    </div>

                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                        Order Placed Successfully!
                    </h1>
                    <p className="text-gray-500 text-sm mb-6">
                        Your order has been sent to the restaurant. You'll get updates as it's prepared and delivered.
                    </p>

                    <div className="bg-gray-50 rounded-xl p-4 text-left space-y-3 mb-6">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Order ID</span>
                            <span className="font-medium text-gray-800">#{order._id?.slice(-8).toUpperCase()}</span>
                        </div>

                        <div className="flex items-start gap-2 text-sm pt-2 border-t border-gray-100">
                            <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                            <span className="text-gray-600">{order.deliveryAddress?.text}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                            {order.paymentMethod === "cod" ? (
                                <Wallet className="w-4 h-4 text-orange-500 shrink-0" />
                            ) : (
                                <Smartphone className="w-4 h-4 text-orange-500 shrink-0" />
                            )}
                            <span className="text-gray-600">
                                {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online / UPI"}
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                            <span className="text-gray-500">Total Amount</span>
                            <span className="font-bold text-gray-800">₹{order.totalAmount}</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => navigate("/orders")}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-lg transition"
                        >
                            Track Order
                            <ArrowRight className="w-4 h-4" />
                        </button>
                        <Link
                            to="/"
                            className="flex-1 flex items-center justify-center border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium py-3 rounded-lg transition"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderPlaced