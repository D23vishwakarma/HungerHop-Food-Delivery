import React from 'react'
import { useSelector } from 'react-redux'
import UserDashBoard from '../components/UserDashBoard';
import OwnerDashBoard from '../components/OwnerDashBoard';
import DeliveryDashBoard from '../components/DeliveryDashBoard';

function Home() {
    const {userData}=useSelector(state=>state.user);
    if(!userData) return null;
    return (
        <div className='bg-orange-50/70 min-h-full w-full'>
            {userData.role=="customer"&& <UserDashBoard/>}
            {userData.role=="restaurant"&& <OwnerDashBoard/>}
            {userData.role=="delivery"&&<DeliveryDashBoard/>}
        </div>
    )
}

export default Home
