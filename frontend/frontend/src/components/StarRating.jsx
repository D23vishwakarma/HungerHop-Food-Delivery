import React, { useState } from 'react'
import { Star } from 'lucide-react'

function StarRating({ rating = 0, size = 13, interactive = false, onRate }) {
    const [hoverRating, setHoverRating] = useState(0)

    const displayRating = interactive && hoverRating ? hoverRating : rating

    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => {
                const fillPercent = Math.max(0, Math.min(1, displayRating - (n - 1))) * 100
                return (
                    <span
                        key={n}
                        className={`relative inline-block ${interactive ? "cursor-pointer" : ""}`}
                        style={{ width: size, height: size }}
                        onMouseEnter={interactive ? () => setHoverRating(n) : undefined}
                        onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
                        onClick={interactive ? () => onRate?.(n) : undefined}
                    >
                        <Star
                            className="absolute inset-0 text-gray-300"
                            style={{ width: size, height: size }}
                        />
                        <span
                            className="absolute inset-0 overflow-hidden"
                            style={{ width: `${fillPercent}%` }}
                        >
                            <Star
                                className="text-yellow-400 fill-yellow-400"
                                style={{ width: size, height: size }}
                            />
                        </span>
                    </span>
                )
            })}
        </div>
    )
}

export default StarRating