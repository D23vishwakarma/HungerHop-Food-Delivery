import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import Navbar from '../components/Navbar'
import { removeFromCart, updateCartQuantity } from '../redux/userSlice'

function CartPage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { cartItems } = useSelector(state => state.user)

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const deliveryFee = cartItems.length > 0 ? 25 : 0
    const total = subtotal + deliveryFee

    const handleIncrement = (item) => {
        dispatch(updateCartQuantity({ id: item.id, quantity: item.quantity + 1 }))
    }

    const handleDecrement = (item) => {
        dispatch(updateCartQuantity({ id: item.id, quantity: item.quantity - 1 }))
    }

    const handleRemove = (id) => {
        dispatch(removeFromCart(id))
    }

    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
                    <div className="bg-orange-100 rounded-full p-6 mb-6">
                        <ShoppingBag className="w-12 h-12 text-orange-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
                    <p className="text-gray-500 max-w-md mb-6">
                        Looks like you haven't added anything yet. Browse restaurants and find something you'll love.
                    </p>
                    <Link
                        to="/"
                        className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 rounded-lg transition"
                    >
                        Browse Restaurants
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Cart</h1>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                    {cartItems.map((item, index) => (
                        <div
                            key={item.id}
                            className={`flex items-center gap-4 p-4 ${
                                index !== cartItems.length - 1 ? "border-b border-gray-100" : ""
                            }`}
                        >
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 rounded-lg object-cover shrink-0"
                            />

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <span
                                        className={`w-3.5 h-3.5 border-2 rounded-sm flex items-center justify-center shrink-0 ${
                                            item.foodtype === "veg" ? "border-green-600" : "border-red-600"
                                        }`}
                                    >
                                        <span
                                            className={`w-1.5 h-1.5 rounded-full ${
                                                item.foodtype === "veg" ? "bg-green-600" : "bg-red-600"
                                            }`}
                                        />
                                    </span>
                                    <p className="font-semibold text-gray-800 truncate">{item.name}</p>
                                </div>
                                <p className="text-sm text-gray-500 mt-0.5">₹{item.price}</p>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-1">
                                    <button
                                        onClick={() => handleDecrement(item)}
                                        className="p-1.5 text-gray-500 hover:text-orange-500 transition"
                                    >
                                        <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => handleIncrement(item)}
                                        className="p-1.5 text-gray-500 hover:text-orange-500 transition"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <p className="font-semibold text-gray-800 w-16 text-right">
                                    ₹{item.price * item.quantity}
                                </p>

                                <button
                                    onClick={() => handleRemove(item.id)}
                                    className="text-gray-300 hover:text-red-500 transition"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span>₹{subtotal}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Delivery Fee</span>
                        <span>₹{deliveryFee}</span>
                    </div>
                    <div className="h-px bg-gray-100" />
                    <div className="flex items-center justify-between font-bold text-gray-800">
                        <span>Total</span>
                        <span>₹{total}</span>
                    </div>

                    <button
                        onClick={() => navigate("/checkout")}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-lg transition mt-2"
                    >
                        Proceed to Checkout
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CartPage