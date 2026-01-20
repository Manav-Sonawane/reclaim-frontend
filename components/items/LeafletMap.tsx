'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon not showing
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LeafletMapProps {
  initialLat: number;
  initialLng: number;
  onLocationSelect: (lat: number, lng: number) => void;
  searchResultCenter: [number, number] | null;
}

export default function LeafletMap({ initialLat, initialLng, onLocationSelect, searchResultCenter }: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if ((containerRef.current as any)._leaflet_id) return; // Strict mode safety check

    try {
      const map = L.map(containerRef.current, {
        center: [initialLat, initialLng],
        zoom: 13,
        scrollWheelZoom: true,
      });

      L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }
      ).addTo(map);

      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        
        // Remove old marker
        if (markerRef.current) {
          map.removeLayer(markerRef.current);
        }

        // Add new marker
        markerRef.current = L.marker([lat, lng]).addTo(map);
        onLocationSelect(lat, lng);
      });

      mapRef.current = map;
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      // Cleanup on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [initialLat, initialLng, onLocationSelect]);

  // Handle search result center changes
  useEffect(() => {
    if (searchResultCenter && mapRef.current && markerRef.current === null) {
      const [lat, lng] = searchResultCenter;
      mapRef.current.flyTo([lat, lng], 13);
      markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
    } else if (searchResultCenter && mapRef.current) {
      const [lat, lng] = searchResultCenter;
      mapRef.current.flyTo([lat, lng], 13);
      if (markerRef.current) {
        mapRef.current.removeLayer(markerRef.current);
      }
      markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
    }
  }, [searchResultCenter]);

  return <div ref={containerRef} style={{ height: '100%', width: '100%' }} />;
}
