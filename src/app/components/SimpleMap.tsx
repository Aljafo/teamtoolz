import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface SimpleMapProps {
  center: [number, number];
  position: [number, number] | null;
  onPositionChange: (pos: [number, number]) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function SimpleMap({ center, position, onPositionChange, className, style }: SimpleMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(containerRef.current).setView(center, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Handle map clicks
    map.on('click', (e) => {
      onPositionChange([e.latlng.lat, e.latlng.lng]);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update map center when it changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, 13);
    }
  }, [center]);

  // Update marker when position changes
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove old marker
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    // Add new marker if position exists
    if (position) {
      const marker = L.marker(position, { draggable: true }).addTo(mapRef.current);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onPositionChange([pos.lat, pos.lng]);
      });

      markerRef.current = marker;
    }
  }, [position]);

  return <div ref={containerRef} className={className} style={style} />;
}
