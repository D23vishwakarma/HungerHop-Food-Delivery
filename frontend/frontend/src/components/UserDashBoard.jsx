import React, { useState } from 'react'
import Navbar from './Navbar'
import { categories } from '../category'
import CategoryCard from './CategoryCard'
import ShopCard from './ShopCard'
import { useSelector } from 'react-redux'
import ItemCard from './ItemCard'

function UserDashBoard() {
    const [selectedCategory, setSelectedCategory] = useState(null)
    const { currCity, shops, items } = useSelector(state => state.user)

    const handleSelectCategory = (categoryName) => {
        setSelectedCategory(prev => prev === categoryName ? null : categoryName)
        // TODO: filter shops/items by selectedCategory once shop-browsing data is wired up
    }

    return (
        <div className='bg-orange-50/60 min-h-screen w-full'>
            <Navbar />

            {/* Categories */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-2">
                <h2 className="text-xl font-bold text-gray-800 mb-5 tracking-tight">
                    What's on your mind?
                </h2>
                <div className="relative">
                    <div className="flex gap-6 sm:gap-8 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide">
                        {categories.map((cat) => (
                            <CategoryCard
                                key={cat.name}
                                category={cat}
                                isSelected={selectedCategory === cat.name}
                                onClick={handleSelectCategory}
                            />
                        ))}
                    </div>
                    <div className="pointer-events-none absolute right-0 top-0 bottom-3 w-12 bg-gradient-to-l from-orange-50/60 to-transparent" />
                </div>
            </section>

            {/* Divider */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="h-px bg-orange-200/60 my-4" />
            </div>

            {/* Nearby shops */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-2 pb-10">
                <h2 className="text-xl font-bold text-gray-800 tracking-tight">
                    Best Shops in <span className="text-orange-500">{currCity || "your area"}</span>
                </h2>
                <p className="text-sm text-gray-500 mt-1 mb-6">
                    Top-rated restaurants and shops people are ordering from right now
                </p>

                {(!shops || shops.length === 0) ? (
                    <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 px-6 flex flex-col items-center text-center">
                        <p className="text-gray-600 font-medium">No shops found near {currCity || "you"} yet</p>
                        <p className="text-gray-400 text-sm mt-1">Check back soon as more restaurants join HungerHop.</p>
                    </div>
                ) : (
                    <div className="relative">
                        <div className="flex gap-5 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide">
                            {shops.map((shop) => (
                                <div key={shop._id} className="snap-start shrink-0 w-56 sm:w-64">
                                    <ShopCard shop={shop} />
                                </div>
                            ))}
                        </div>
                        <div className="pointer-events-none absolute right-0 top-0 bottom-3 w-12 bg-gradient-to-l from-orange-50/60 to-transparent" />
                    </div>
                )}
            </section>
            {items && items.length > 0 && (
                <>
                    <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-2">
                        <h2 className="text-xl font-bold text-gray-800 tracking-tight mb-5">
                            Suggested Food Items
                        </h2>
                        <div className="relative">
                            <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide">
                                {items.map((item) => (
                                    <div key={item._id} className="snap-start">
                                        <ItemCard item={item} mode="customer" />
                                    </div>
                                ))}
                            </div>
                            <div className="pointer-events-none absolute right-0 top-0 bottom-3 w-12 bg-gradient-to-l from-orange-50/60 to-transparent" />
                        </div>
                    </section>

                    <div className="max-w-6xl mx-auto px-4 sm:px-6">
                        <div className="h-px bg-orange-200/60 my-4" />
                    </div>
                </>
            )}
        </div>
    )
}

export default UserDashBoard