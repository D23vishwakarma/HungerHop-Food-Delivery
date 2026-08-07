import React, { useState,useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { serverUrl } from '../App'
import { setMyShopData } from '../redux/ownerSlice'
import axios from 'axios'
import logo from '../assets/logo.svg'

function CreateEditShop() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { myShopData } = useSelector(state => state.owner)
    const { currCity, currState, currAddress } = useSelector(state => state.user)
    const [name, setName] = useState(myShopData?.name || "")
    const [address, setAddress] = useState(myShopData?.address || "")
    const [city, setCity] = useState(myShopData?.city || "")
    const [state, setState] = useState(myShopData?.state || "")
    const [image, setImage] = useState(null)
    const [preview, setPreview] = useState(myShopData?.image || null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

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

        if (!myShopData && !image) {
            setError("Please upload a shop image")
            return
        }

        const formData = new FormData()
        formData.append("name", name)
        formData.append("address", address)
        formData.append("city", city)
        formData.append("state", state)
        if (image) formData.append("image", image)

        try {
            setLoading(true)
            const result = await axios.post(
                `${serverUrl}/shop/create-edit`,
                formData,
                { withCredentials: true }
            )
            console.log(result.data)
            dispatch(setMyShopData(result.data.data))
            navigate("/owner-dashboard")
        } catch (err) {
            setError(err?.response?.data?.message || "Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        if (!myShopData) {
            if (currCity) setCity(currCity)
            if (currState) setState(currState)
            if (currAddress) setAddress(currAddress)
        }
    }, [currCity, currState, currAddress, myShopData])

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10 -mt-2">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

                <div className="flex items-center gap-4 mb-7">
                    <Link to="/" className='-ml-1'>
                        <img src={logo} alt="HungerHop" className="w-12 h-12 rounded-xl object-cover" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold text-zinc-800">
                            {myShopData ? "Edit Shop" : "Add Your Shop"}
                        </h2>
                        <p className="text-gray-500 text-[12px]">
                            This information will be shown to customers on HungerHop.
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
                        <label htmlFor="shop-image" className="cursor-pointer">
                            <div className="w-28 h-28 rounded-full bg-orange-50 border-2 border-dashed border-orange-300 flex items-center justify-center overflow-hidden">
                                {preview ? (
                                    <img src={preview} alt="Shop preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-orange-400 text-sm text-center px-2">Upload Shop Image</span>
                                )}
                            </div>
                        </label>
                        <input
                            id="shop-image"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImage}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="e.g. Spice Garden Restaurant"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                required
                                placeholder="e.g. Gorakhpur"
                                className="w-full border text-zinc-800 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                            <input
                                type="text"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                required
                                placeholder="e.g. Uttar Pradesh"
                                className="w-full border text-zinc-800 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <textarea
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                            rows={3}
                            placeholder="Full shop address"
                            className="w-full text-zinc-800 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? "Saving..." : myShopData ? "Update Shop" : "Create Shop"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default CreateEditShop