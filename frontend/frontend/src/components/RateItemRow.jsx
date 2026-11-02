import { useState } from 'react'
import axios from 'axios'
import { serverUrl } from '../App'
import StarRating from './StarRating'
import { CheckCircle2 } from 'lucide-react'

function RateItemRow({ itemId, itemName, itemImage, orderId, shopOrderId }) {
    const [rating, setRating] = useState(0)
    const [submitted, setSubmitted] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (value) => {
        setSubmitting(true)
        try {
            await axios.post(
                `${serverUrl}/item/rating`,
                { itemId, rating: value, orderId, shopOrderId },
                { withCredentials: true }
            )
            setRating(value)
            setSubmitted(true)
        } catch (error) {
            alert(error.response?.data?.message || "Failed to submit rating")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border transition-colors ${
            submitted ? "bg-green-50/60 border-green-100" : "bg-gray-50/80 border-gray-100"
        }`}>
            {/* Thumbnail */}
            {itemImage ? (
                <img
                    src={itemImage}
                    alt={itemName}
                    className="w-10 h-10 rounded-lg object-cover shrink-0 ring-1 ring-gray-100"
                />
            ) : (
                <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0" />
            )}

            {/* Name */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{itemName}</p>
                {submitted && (
                    <p className="text-[11px] text-green-600 font-medium flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Rated {rating} star{rating !== 1 ? "s" : ""}
                    </p>
                )}
            </div>

            {/* Stars */}
            <div className={submitting ? "opacity-40 pointer-events-none shrink-0" : "shrink-0"}>
                <StarRating
                    rating={rating}
                    size={submitted ? 16 : 20}
                    interactive={!submitted}
                    onRate={handleSubmit}
                />
            </div>
        </div>
    )
}

export default RateItemRow