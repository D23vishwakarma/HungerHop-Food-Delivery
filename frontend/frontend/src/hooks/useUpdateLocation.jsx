import axios from 'axios'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrAddress, setCurrCity, setCurrState } from '../redux/userSlice'
import { setAddress, setLocation } from '../redux/mapSlice'
import { serverUrl } from '../App'

function UseUpdateLocation() {
    const dispatch = useDispatch()
    const { userData } = useSelector(state => state.user)

    useEffect(() => {
        if (!userData) return 

        const updateLocation = async (lati, long) => {
            try {
                const result = await axios.put(
                    `${serverUrl}/user/updatelocation`,
                    { lati, long },
                    { withCredentials: true }
                )
                console.log("Location updated:", result.data)
            } catch (error) {
                console.error("Failed to update location on server:", error.response?.data?.message || error.message)
            }
        }

        if (!navigator.geolocation) {
            console.error("Geolocation is not supported by this browser")
            return
        }

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                updateLocation(pos.coords.latitude, pos.coords.longitude)
            },
            (err) => {
                console.error("Geolocation error:", err.code, err.message)
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        )

        return () => {
            navigator.geolocation.clearWatch(watchId)
        }
    }, [userData])

    return null
}

export default UseUpdateLocation