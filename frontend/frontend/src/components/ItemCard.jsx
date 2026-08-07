import React from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'

function ItemCard({ item, onDelete }) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group">
            <div className="relative h-28 bg-gray-100">
                <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                />
                <span
                    className={`absolute top-2 left-2 w-4 h-4 border-2 rounded-sm flex items-center justify-center bg-white ${
                        item.foodtype === "veg" ? "border-green-600" : "border-red-600"
                    }`}
                >
                    <span
                        className={`w-1.5 h-1.5 rounded-full ${
                            item.foodtype === "veg" ? "bg-green-600" : "bg-red-600"
                        }`}
                    />
                </span>
            </div>

            <div className="p-3">
                <p className="text-[11px] text-orange-500 font-medium mb-0.5">{item.category}</p>
                <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                <p className="text-gray-700 text-sm font-semibold mt-0.5">₹{item.price}</p>

                <div className="flex gap-2 mt-3">
                    <Link
                        to={`/edit-item/${item._id}`}
                        className="flex-1 flex items-center justify-center gap-1 text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg py-1.5 transition"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                    </Link>
                    <button
                        onClick={() => onDelete?.(item._id)}
                        className="flex-1 flex items-center justify-center gap-1 text-xs font-medium border border-red-200 text-red-500 hover:bg-red-50 rounded-lg py-1.5 transition"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ItemCard