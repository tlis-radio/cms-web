import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngTuple, Icon } from 'leaflet';

/**
 * npm install leaflet
 * npm install @types/leaflet
 * npm install react-leaflet
 */

const MapComponent = () => {

    const tlis_marker = {
        geocode: [48.15812, 17.064] as LatLngTuple,
        popup: 'Tu sme!'
    };

    const tlis_icon = new Icon({
        iconUrl: 'https://tlis.sk/assets/tlis-white-no-bkg.0998e327.svg',
        iconSize: [50, 50],
    });

    return (
        <MapContainer center={[48.15812, 17.064]} zoom={17} style={{ height: "50vh", width: "50%" }}>
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={tlis_marker.geocode} icon={tlis_icon}>
        </Marker>
        </MapContainer>
    );
};

export default MapComponent;