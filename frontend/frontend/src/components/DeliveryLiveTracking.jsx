import React from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import scooter from '../assets/scooter.jpg'
import home from '../assets/home.jpg'
import L from 'leaflet'

const deliveryIcon = new L.Icon({
    iconUrl: scooter,
    iconSize: [40, 40],
    iconAnchor: [20, 40]
})
const customerIcon = new L.Icon({
    iconUrl: home,
    iconSize: [40, 40],
    iconAnchor: [20, 40]
})

// Re-centers/fits the map whenever the two points change,
// e.g. as the delivery boy's live location updates.
function FitBounds({ bounds }) {
    const map = useMap()
    React.useEffect(() => {
        if (bounds.length === 2) {
            map.fitBounds(bounds, { padding: [50, 50] })
        }
    }, [bounds, map])
    return null
}

function DeliveryLiveTracking({ data }) {
    const deliveryBoyLati = data?.deliveryBoyLocation?.lati
    const deliveryBoyLong = data?.deliveryBoyLocation?.long
    const customerLati = data?.customerLocation?.lati
    const customerLong = data?.customerLocation?.long

    const hasDeliveryBoyLocation = deliveryBoyLati != null && deliveryBoyLong != null
    const hasCustomerLocation = customerLati != null && customerLong != null

    if (!hasDeliveryBoyLocation && !hasCustomerLocation) {
        return (
            <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-gray-100 rounded-2xl text-sm text-gray-400">
                Waiting for location data...
            </div>
        )
    }

    const path = hasDeliveryBoyLocation && hasCustomerLocation
        ? [
              [deliveryBoyLati, deliveryBoyLong],
              [customerLati, customerLong]
          ]
        : []

    const center = hasDeliveryBoyLocation
        ? [deliveryBoyLati, deliveryBoyLong]
        : [customerLati, customerLong]

    return (
        <div className="w-full h-full min-h-[300px] rounded-2xl overflow-hidden">
            <MapContainer
                center={center}
                zoom={14}
                scrollWheelZoom={true}
                style={{ width: '100%', height: '100%', minHeight: '300px' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {path.length === 2 && (
                    <>
                        <Polyline positions={path} pathOptions={{ color: '#f97316', weight: 4, dashArray: '9, 12' }} />
                        <FitBounds bounds={path} />
                    </>
                )}

                {hasDeliveryBoyLocation && (
                    <Marker position={[deliveryBoyLati, deliveryBoyLong]} icon={deliveryIcon}>
                        <Popup>Delivery partner</Popup>
                    </Marker>
                )}

                {hasCustomerLocation && (
                    <Marker position={[customerLati, customerLong]} icon={customerIcon}>
                        <Popup>Delivery address</Popup>
                    </Marker>
                )}
            </MapContainer>
        </div>
    )
}

export default DeliveryLiveTracking