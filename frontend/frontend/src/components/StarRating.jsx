import React from 'react'
import { Star } from 'lucide-react'

function StarRating({ rating = 0, size = 13 }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => {
                const fillPercent = Math.max(0, Math.min(1, rating - (n - 1))) * 100
                return (
                    <span
                        key={n}
                        className="relative inline-block"
                        style={{ width: size, height: size }}
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