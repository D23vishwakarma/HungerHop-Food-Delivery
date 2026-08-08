import axios from 'axios'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrAddress, setCurrCity, setCurrState } from '../redux/userSlice'
import { setAddress, setLocation } from '../redux/mapSlice'

function UseGetCity() {
    const dispatch = useDispatch()
    const { userData } = useSelector(state => state.user)

    useEffect(() => {
        if (!navigator.geolocation) {
            console.error("Geolocation is not supported by this browser")
            return
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords
                    dispatch(setLocation({lati:latitude,long:longitude}))
                    const result = await axios.get(
                        `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${import.meta.env.VITE_GEOAPIKEY}`
                    )
                    const place = result.data.results[0]
                    dispatch(setCurrCity(place.city))
                    dispatch(setCurrState(place.state))
                    dispatch(setCurrAddress(place.address_line2 || place.address_line1))
                    dispatch(setAddress(place.address_line2))
                } catch (err) {
                    console.error("Reverse geocoding failed:", err)
                }
            },
            (error) => {
                console.error("Geolocation permission denied or unavailable:", error.message)
            }
        )
    }, [userData])

    return null
}

export default UseGetCity