'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon not showing
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ onLocationSelect, position, setPosition }: { onLocationSelect: (lat: number, lng: number) => void, position: [number, number] | null, setPosition: (pos: [number, number] | null) => void }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

function MapUpdater({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13);
    }
  }, [center, map]);
  return null;
}

interface LeafletMapProps {
  initialLat: number;
  initialLng: number;
  onLocationSelect: (lat: number, lng: number) => void;
  searchResultCenter: [number, number] | null;
}

export default function LeafletMap({ initialLat, initialLng, onLocationSelect, searchResultCenter }: LeafletMapProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  // Update position if searchResultCenter changes (optional, usually handled by map flyTo and user click)
  useEffect(() => {
    if (searchResultCenter) {
      setPosition(searchResultCenter);
    }
  }, [searchResultCenter]);

  return (
    <MapContainer 
        center={[initialLat, initialLng]} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
    >
        <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onLocationSelect={onLocationSelect} position={position} setPosition={setPosition} />
        <MapUpdater center={searchResultCenter} />
    </MapContainer>
  );
}
