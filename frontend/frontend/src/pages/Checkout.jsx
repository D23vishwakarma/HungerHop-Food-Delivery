import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { MapPin, LocateFixed, Search, Wallet, Smartphone, ShoppingBag } from 'lucide-react'
import { setLocation, setAddress } from '../redux/mapSlice'
import { serverUrl } from '../App'
import { useNavigate } from 'react-router-dom'
import { addMyOrders } from '../redux/userSlice'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function RecenterMap({ position }) {
    const map = useMap()
    map.setView(position, map.getZoom())
    return null
}

function LocationMarker({ position, onPick }) {
    useMapEvents({
        click(e) {
            onPick(e.latlng.lat, e.latlng.lng)
        }
    })

    return position ? (
        <Marker
            position={position}
            draggable
            eventHandlers={{
                dragend: (e) => {
                    const { lat, lng } = e.target.getLatLng()
                    onPick(lat, lng)
                }
            }}
        />
    ) : null
}

function Checkout() {
    const dispatch = useDispatch()
    const navigate=useNavigate();
    const { location, address } = useSelector(state => state.map)
    const { cartItems } = useSelector(state => state.user)

    const [locating, setLocating] = useState(false)
    const [searching, setSearching] = useState(false)
    const [searchText, setSearchText] = useState("")
    const [addressInput, setAddressInput] = useState(address || "")
    const [paymentMethod, setPaymentMethod] = useState("cod")
    const [placing, setPlacing] = useState(false)

    const position = (location?.lati && location?.long)
        ? [location.lati, location.long]
        : [26.7606, 83.3732]

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const deliveryFee = subtotal === 0 ? 0 : subtotal > 100 ? 0 : 25
    const totalAmount = subtotal + deliveryFee

    const reverseGeocode = async (lat, lng) => {
        try {
            const result = await axios.get(
                `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${import.meta.env.VITE_GEOAPIKEY}`
            )
            const place = result.data.results[0]
            const fullAddress = place.formatted || place.address_line1 || place.address_line2 || ""
            dispatch(setAddress(fullAddress))
            setAddressInput(fullAddress)
        } catch (error) {
            console.log("Reverse geocoding failed:", error)
        }
    }

    const handlePick = (lat, lng) => {
        dispatch(setLocation({ lati: lat, long: lng }))
        reverseGeocode(lat, lng)
    }

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) return
        setLocating(true)
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords
                dispatch(setLocation({ lati: latitude, long: longitude }))
                await reverseGeocode(latitude, longitude)
                setLocating(false)
            },
            (error) => {
                console.log("Geolocation error:", error.message)
                setLocating(false)
            }
        )
    }

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!searchText.trim()) return

        setSearching(true)
        try {
            const result = await axios.get(
                `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(searchText)}&apiKey=${import.meta.env.VITE_GEOAPIKEY}`
            )
            const place = result.data.features?.[0]
            if (!place) {
                console.log("No results found for that address")
                setSearching(false)
                return
            }

            const [lng, lat] = place.geometry.coordinates
            const fullAddress = place.properties.formatted || searchText

            dispatch(setLocation({ lati: lat, long: lng }))
            dispatch(setAddress(fullAddress))
            setAddressInput(fullAddress)
        } catch (error) {
            console.log("Address search failed:", error)
        } finally {
            setSearching(false)
        }
    }

    const handleAddressChange = (e) => {
        setAddressInput(e.target.value)
        dispatch(setAddress(e.target.value))
    }

    const handlePlaceOrder = async () => {
        if (!addressInput.trim()) {
            alert("Please provide a delivery address")
            return
        }
        if (!location?.lati || !location?.long) {
            alert("Please set a delivery location on the map")
            return
        }
        if (cartItems.length === 0) {
            alert("Your cart is empty")
            return
        }

        setPlacing(true)
        try {
            const result = await axios.post(`${serverUrl}/order/place-order`, {
                cartItems: cartItems.map(item => ({
                    _id: item.id,
                    shop: item.shop,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                deliveryAddress: {
                    text: addressInput,
                    latitude: location.lati,
                    longitude: location.long
                },
                paymentMethod,
                totalAmount
            }, { withCredentials: true })
        dispatch(addMyOrders(result.data.data));
           navigate("/order-placed", { state: { order: result.data.data } })
        } catch (error) {
            console.log(error)
        } finally {
            setPlacing(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-[1050px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-orange-500 p-2 sm:p-2.5 rounded-xl shrink-0">
                        <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-xl font-bold text-gray-800">Checkout</h1>
                        <p className="text-gray-500 text-xs sm:text-sm">Confirm your delivery details and payment method</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
                    {/* Left column: address + payment */}
                    <div className="lg:col-span-2 space-y-5 sm:space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                                <h2 className="font-bold text-gray-800 flex items-center gap-2 text-sm sm:text-base">
                                    <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                                    Delivery Address
                                </h2>
                                <button
                                    onClick={handleUseCurrentLocation}
                                    disabled={locating}
                                    className="flex items-center gap-1.5 text-xs font-medium text-orange-600 hover:text-orange-700 disabled:opacity-50 transition self-start sm:self-auto"
                                >
                                    <LocateFixed className="w-3.5 h-3.5" />
                                    {locating ? "Locating..." : "Use Current Location"}
                                </button>
                            </div>

                            <form onSubmit={handleSearch} className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    placeholder="Search area, street, or landmark"
                                    className="w-full pl-9 pr-16 sm:pr-20 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                                />
                                <button
                                    type="submit"
                                    disabled={searching}
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium px-2.5 sm:px-3 py-1.5 rounded-md transition disabled:opacity-60"
                                >
                                    {searching ? "..." : "Search"}
                                </button>
                            </form>

                            <textarea
                                value={addressInput}
                                onChange={handleAddressChange}
                                rows={2}
                                placeholder="Full delivery address"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none mb-4"
                            />

                            <p className="text-xs text-gray-400 mb-2">
                                Search above, tap on the map, or drag the pin to set your exact drop-off point.
                            </p>
                            <div className="h-52 sm:h-64 lg:h-72 rounded-xl overflow-hidden border border-gray-200">
                                <MapContainer
                                    center={position}
                                    zoom={14}
                                    style={{ height: "100%", width: "100%" }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; OpenStreetMap contributors'
                                    />
                                    <LocationMarker position={position} onPick={handlePick} />
                                    <RecenterMap position={position} />
                                </MapContainer>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
                            <h2 className="font-bold text-gray-800 mb-4 text-sm sm:text-base">Payment Method</h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod("cod")}
                                    className={`flex items-center gap-3 border rounded-xl p-3.5 sm:p-4 text-left transition ${paymentMethod === "cod"
                                            ? "border-orange-500 bg-orange-50 ring-1 ring-orange-500"
                                            : "border-gray-200 hover:border-orange-200"
                                        }`}
                                >
                                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${paymentMethod === "cod" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500"
                                        }`}>
                                        <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm text-gray-800">Cash on Delivery</p>
                                        <p className="text-xs text-gray-500 mt-0.5">Pay when your order arrives</p>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod("online")}
                                    className={`flex items-center gap-3 border rounded-xl p-3.5 sm:p-4 text-left transition ${paymentMethod === "online"
                                            ? "border-orange-500 bg-orange-50 ring-1 ring-orange-500"
                                            : "border-gray-200 hover:border-orange-200"
                                        }`}
                                >
                                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${paymentMethod === "online" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500"
                                        }`}>
                                        <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm text-gray-800">Online / UPI</p>
                                        <p className="text-xs text-gray-500 mt-0.5">Pay now via UPI, card, or wallet</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right column: order summary, sticky on desktop */}
                    <div className="lg:sticky lg:top-20 h-fit">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
                            <h2 className="font-bold text-gray-800 mb-4 text-sm sm:text-base">Order Summary</h2>

                            {cartItems.length === 0 ? (
                                <p className="text-sm text-gray-400">Your cart is empty</p>
                            ) : (
                                <div className="space-y-2 mb-4 max-h-56 overflow-y-auto pr-1">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600 truncate pr-2">
                                                {item.name} <span className="text-gray-400">x{item.quantity}</span>
                                            </span>
                                            <span className="text-gray-800 font-medium shrink-0">
                                                ₹{item.price * item.quantity}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="h-px bg-gray-100 mb-3" />

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                    <span>Delivery Fee</span>
                                    <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span>
                                </div>
                                <div className="h-px bg-gray-100 my-2" />
                                <div className="flex items-center justify-between font-bold text-gray-800">
                                    <span>Total</span>
                                    <span>₹{totalAmount}</span>
                                </div>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={placing || cartItems.length === 0}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-lg transition mt-5 disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base"
                            >
                                {placing ? "Placing Order..." : `Place Order — ₹${totalAmount}`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Checkout