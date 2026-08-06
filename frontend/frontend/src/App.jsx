import { useState } from 'react'

import './App.css'
import { Navigate, Route,Routes } from 'react-router-dom'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Home from './pages/Home'
import ForgotPassword from './pages/ForgotPassword'
import useGetCurrUser from './hooks/useGetCurrUser'
import { useSelector } from 'react-redux'
import UseGetCity from './hooks/useGetCity'
export const serverUrl="http://localhost:8000/api/v1";

function App() {
  useGetCurrUser();
  UseGetCity();
  const {userData}=useSelector(state=>state.user);
  return (
    <Routes>
      <Route path='/' element={userData?<Home/>:<Navigate to={'/login'}/>}/>
      <Route path='/signup' element={userData?<Navigate to={'/'}/>:<Signup/>}/>
      <Route path='/login' element={userData?<Navigate to={'/'}/>:<Login/>}/>
      <Route path='/forgot-password' element={userData?<Navigate to={'/'}/>:<ForgotPassword/>}/>
    </Routes>
  )
}

export default App
