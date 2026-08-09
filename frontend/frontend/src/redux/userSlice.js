import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        userData: null,
        currCity: null,
        currState: null,
        currAddress: null,
        shops: null,
        items: null,
        cartItems: [],
        myOrders:[]
    },
    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload
        },
        setCurrCity: (state, action) => {
            state.currCity = action.payload
        },
        setCurrState: (state, action) => {
            state.currState = action.payload
        },
        setCurrAddress: (state, action) => {
            state.currAddress = action.payload
        },
        setShops: (state, action) => {
            state.shops = action.payload
        },
        setItems: (state, action) => {
            state.items = action.payload
        },
        addToCart: (state, action) => {
            const item = action.payload
            const existing = state.cartItems.find(cartItem => cartItem.id === item.id)

            if (existing) {
                existing.quantity += item.quantity || 1
            } else {
                state.cartItems.push({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    image: item.image,
                    foodtype: item.foodtype,
                    shop: item.shop,
                    quantity: item.quantity || 1
                })
            }
        },
        removeFromCart: (state, action) => {
            state.cartItems = state.cartItems.filter(cartItem => cartItem.id !== action.payload)
        },
        updateCartQuantity: (state, action) => {
            const { id, quantity } = action.payload
            const item = state.cartItems.find(cartItem => cartItem.id === id)
            if (item) {
                if (quantity <= 0) {
                    state.cartItems = state.cartItems.filter(cartItem => cartItem.id !== id)
                } else {
                    item.quantity = quantity
                }
            }
        },
        clearCart: (state) => {
            state.cartItems = []
        },
        setMyOrders: (state, action) => {
            state.myOrders = action.payload
        },
        addMyOrders:(state,action)=>{
            state.myOrders=[action.payload,...state.myOrders]
        }
    }
})

export const {
    setUserData,
    setCurrCity,
    setCurrState,
    setCurrAddress,
    setShops,
    setItems,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    setMyOrders,
    addMyOrders
} = userSlice.actions

export default userSlice.reducer