import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from './Navbar'
import ItemCard from './ItemCard'
import { useDispatch, useSelector } from 'react-redux'
import { Store, PlusCircle } from 'lucide-react'
import axios from 'axios'
import { serverUrl } from '../App'
import { setMyShopData } from '../redux/ownerSlice'

function OwnerDashBoard() {
    const { myShopData } = useSelector(state => state.owner);
    const dispatch=useDispatch();
    const handleDeleteItem = async (itemId) => {
        try {
            await axios.delete(`${serverUrl}/item/delete/${itemId}`, { withCredentials: true });
            dispatch(setMyShopData({
                ...myShopData,
                items: myShopData.items.filter(item => item._id !== itemId)
            }))
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {!myShopData && (
                <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
                    <div className="bg-orange-100 rounded-full p-6 mb-6">
                        <Store className="w-12 h-12 text-orange-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        You haven't added a shop yet
                    </h2>
                    <p className="text-gray-500 max-w-md mb-6">
                        Set up your restaurant to start adding items, receiving orders, and reaching customers on HungerHop.
                    </p>
                    <Link
                        to="/add-shop"
                        className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 rounded-lg transition"
                    >
                        Add Your Shop
                    </Link>
                </div>
            )}

            {myShopData && (
                <div className="px-4 py-8 max-w-5xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                        <div className="h-40 sm:h-56 w-full bg-gray-100">
                            <img
                                src={myShopData.image}
                                alt={myShopData.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">{myShopData.name}</h1>
                                <p className="text-gray-500 text-sm mt-1">
                                    {myShopData.address}, {myShopData.city}, {myShopData.state}
                                </p>
                            </div>
                            <Link
                                to="/add-shop"
                                className="shrink-0 border border-orange-300 text-orange-600 hover:bg-orange-50 font-medium px-5 py-2.5 rounded-lg transition text-center"
                            >
                                Edit Shop
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-800">Menu Items</h2>
                        <Link
                            to="/add-item"
                            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                        >
                            <PlusCircle className="w-4 h-4" />
                            Add Item
                        </Link>
                    </div>

                    {(!myShopData.items || myShopData.items.length === 0) ? (
                        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 flex flex-col items-center text-center">
                            <p className="text-gray-500 mb-1">No items added yet</p>
                            <p className="text-gray-400 text-sm mb-5">Start building your menu so customers can order from you.</p>
                            <Link
                                to="/add-item"
                                className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-5 py-2.5 rounded-lg transition"
                            >
                                Add Your First Item
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {myShopData.items.map((item) => (
                                <ItemCard key={item._id} item={item} onDelete={handleDeleteItem} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default OwnerDashBoard