import { useState } from 'react'

import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Home from './pages/Home'
import ForgotPassword from './pages/ForgotPassword'
import useGetCurrUser from './hooks/useGetCurrUser'
import { useSelector } from 'react-redux'
import UseGetCity from './hooks/useGetCity'
import useGetShop from './hooks/useGetShop'
import CreateEditShop from './pages/CreateEditShop'
import OwnerDashBoard from './components/OwnerDashBoard'
import AddItem from './pages/AddItem'
import EditItem from './pages/EditItem'
import useGetShopByCity from './hooks/useGetShopBycity'
import useGetItemByCity from './hooks/useGetItemByCity'
import CartPage from './pages/CartPage'
import Checkout from './pages/Checkout'
import OrderPlaced from './pages/OrderPlaced'
import MyOrders from './pages/MyOrders'
import useGetMyOrders from './hooks/useGetMyOrders'
import UseUpdateLocation from './hooks/useUpdateLocation'
import TrackOrder from './pages/TrackOrder'
import Shop from './pages/Shop'
export const serverUrl = "http://localhost:8000/api/v1";

function App() {
  useGetShop();
  useGetCurrUser();
  UseGetCity();
  useGetShopByCity();
  useGetItemByCity();
  useGetMyOrders();
  UseUpdateLocation();
  const { userData } = useSelector(state => state.user);
  return (
    <Routes>
      <Route path='/' element={userData ? <Home /> : <Navigate to={'/login'} />} />
      <Route path='/signup' element={userData ? <Navigate to={'/'} /> : <Signup />} />
      <Route path='/login' element={userData ? <Navigate to={'/'} /> : <Login />} />
      <Route path='/forgot-password' element={userData ? <Navigate to={'/'} /> : <ForgotPassword />} />
      <Route path='/add-shop' element={<CreateEditShop />} />
      <Route path='/owner-dashboard' element={<OwnerDashBoard />} />
      <Route path='/add-item' element={<AddItem />} />
      <Route path='/edit-item/:itemId' element={<EditItem />} />
      <Route path='/cart' element={<CartPage />} />
      <Route path='/checkout' element={<Checkout />} />
      <Route path='/order-placed' element={<OrderPlaced />} />
      <Route path='/orders' element={<MyOrders />} />
      <Route path='/track-order/:orderId' element={<TrackOrder />} />
      <Route path='/shop/:shopId' element={<Shop/>}/>
    </Routes>
  )
}

export default App
