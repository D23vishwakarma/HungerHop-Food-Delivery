import React from 'react'

function CategoryCard({ category, isSelected, onClick }) {
    return (
        <button
            onClick={() => onClick?.(category.name)}
            className="flex flex-col items-center gap-2.5 shrink-0 snap-start group"
        >
            <div
                className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden transition-all duration-200 ${
                    isSelected
                        ? "ring-[3px] ring-orange-500 ring-offset-2 shadow-lg shadow-orange-200"
                        : "ring-1 ring-black/5 shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5"
                }`}
            >
                <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                />
                {isSelected && (
                    <div className="absolute inset-0 bg-orange-500/10" />
                )}
            </div>
            <span
                className={`text-xs sm:text-[13px] font-semibold text-center leading-tight transition-colors ${
                    isSelected ? "text-orange-600" : "text-gray-700 group-hover:text-orange-500"
                }`}
            >
                {category.name}
            </span>
        </button>
    )
}

export default CategoryCard