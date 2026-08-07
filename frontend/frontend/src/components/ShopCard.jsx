import React from 'react'
import { Link } from 'react-router-dom'
import { Star, Clock } from 'lucide-react'

function ShopCard({ shop }) {
    return (
        <Link
            to={`/shop/${shop._id}`}
            className="bg-white rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
        >
            <div className="h-36 sm:h-40 w-full bg-gray-100 overflow-hidden">
                <img
                    src={shop.image}
                    alt={shop.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
            </div>
            <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-gray-800 truncate">{shop.name}</h3>
                    <span className="shrink-0 flex items-center gap-1 bg-green-600 text-white text-xs font-semibold px-1.5 py-0.5 rounded">
                        <Star className="w-3 h-3 fill-white" />
                        {shop.rating || "New"}
                    </span>
                </div>
                <p className="text-sm text-gray-500 mt-1 truncate">{shop.city}, {shop.state}</p>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>25–35 mins</span>
                </div>
            </div>
        </Link>
    )
}

export default ShopCard