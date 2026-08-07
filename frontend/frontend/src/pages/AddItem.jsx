import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import { UtensilsCrossed } from 'lucide-react'
import { setMyShopData } from '../redux/ownerSlice'

const categories = [
    "Snacks",
    "Main Course",
    "Desserts",
    "Pizza",
    "Burgers",
    "Sandwiches",
    "South Indian",
    "North Indian",
    "Chinese",
    "Fast Food",
    "Others"
]

function AddItem() {
    const navigate = useNavigate()
    const { myShopData } = useSelector(state => state.owner)

    const [name, setName] = useState("")
    const [category, setCategory] = useState(categories[0])
    const [price, setPrice] = useState("")
    const [foodtype, setFoodtype] = useState("veg")
    const [image, setImage] = useState(null)
    const [preview, setPreview] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const dispatch=useDispatch();

    const handleImage = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImage(file)
            setPreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (!image) {
            setError("Please upload an item image")
            return
        }

        const formData = new FormData()
        formData.append("name", name)
        formData.append("category", category)
        formData.append("price", price)
        formData.append("foodtype", foodtype)
        formData.append("image", image)

        try {
            setLoading(true)
            const result=await axios.post(
                `${serverUrl}/item/create`,
                formData,
                { withCredentials: true }
            )
            dispatch(setMyShopData(result.data.data));
            navigate("/owner-dashboard")
        } catch (err) {
            setError(err?.response?.data?.message || "Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-orange-500 p-2.5 rounded-xl">
                        <UtensilsCrossed className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Add Item</h2>
                        <p className="text-gray-500 text-sm">
                            Add a new dish to {myShopData?.name || "your menu"}.
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2 mb-4 border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="flex flex-col items-center">
                        <label htmlFor="item-image" className="cursor-pointer">
                            <div className="w-28 h-28 rounded-xl bg-orange-50 border-2 border-dashed border-orange-300 flex items-center justify-center overflow-hidden">
                                {preview ? (
                                    <img src={preview} alt="Item preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-orange-400 text-sm text-center px-2">Upload Item Image</span>
                                )}
                            </div>
                        </label>
                        <input
                            id="item-image"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImage}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="e.g. Paneer Tikka Pizza"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                            <input
                                type="number"
                                min="0"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                                placeholder="e.g. 249"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Food Type</label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setFoodtype("veg")}
                                className={`flex-1 flex items-center justify-center gap-2 border rounded-lg py-2.5 text-sm font-medium transition ${
                                    foodtype === "veg"
                                        ? "border-green-500 bg-green-50 text-green-700"
                                        : "border-gray-300 text-gray-600"
                                }`}
                            >
                                <span className="w-3.5 h-3.5 border-2 border-green-600 rounded-sm flex items-center justify-center">
                                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                                </span>
                                Veg
                            </button>
                            <button
                                type="button"
                                onClick={() => setFoodtype("non veg")}
                                className={`flex-1 flex items-center justify-center gap-2 border rounded-lg py-2.5 text-sm font-medium transition ${
                                    foodtype === "non veg"
                                        ? "border-red-500 bg-red-50 text-red-700"
                                        : "border-gray-300 text-gray-600"
                                }`}
                            >
                                <span className="w-3.5 h-3.5 border-2 border-red-600 rounded-sm flex items-center justify-center">
                                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                                </span>
                                Non-Veg
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? "Adding..." : "Add Item"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default AddItem
