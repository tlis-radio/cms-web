import React from 'react';
import 'leaflet/dist/leaflet.css';
import { LatLngTuple, Icon } from 'leaflet';
import logo from "../../../public/03_TLIS_logo2020_white_no-bkg.svg";
import { MapContainer,TileLayer,Marker } from "react-leaflet";

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
        iconUrl: logo.src,
        iconSize: [50, 50],
    });

    return (
        <div className="h-[30vh] w-[90%] sm:w-[50%] lg:w-[33%] z-0">
            <MapContainer center={tlis_marker.geocode} zoom={17} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                />
                <Marker position={tlis_marker.geocode} icon={tlis_icon}>
                </Marker>
            </MapContainer>
        </div>
    );
};

export default MapComponent;