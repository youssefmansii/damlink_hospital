'use client';

import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix for default marker icon in Next.js
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

export default function Map({ center = [30.0444, 31.2357], zoom = 13, markers = [] }: any) {
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
    });
  }, []);

  // Custom Icons
  const hospitalIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  });

  const requestIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  });

  const donorIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  });

  return (
    <div style={{ height: '100%', width: '100%', borderRadius: '12px', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%', zIndex: 1 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center} icon={hospitalIcon}>
          <Popup>City Hospital</Popup>
        </Marker>
        <Circle center={center} pathOptions={{ color: '#2563EB', fillColor: '#2563EB', fillOpacity: 0.1 }} radius={2000} />

        {markers.map((m: any, i: number) => (
          <Marker 
            key={i} 
            position={m.position} 
            icon={m.type === 'request' ? requestIcon : donorIcon}
          >
            <Popup>{m.label}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
