import { useState, useEffect } from 'react';
import { Navigation, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { SimpleMap, type Location } from './SimpleMap';

export type { Location };

interface DesktopLocationPickerProps {
  location: Location | null;
  onChange: (location: Location | null) => void;
}

export function DesktopLocationPicker({
  location,
  onChange,
}: DesktopLocationPickerProps) {
  const [expanded, setExpanded] = useState(false);
  const [position, setPosition] = useState<[number, number] | null>(
    location ? [location.latitude, location.longitude] : null
  );
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.505, -0.09]); // Default to London

  useEffect(() => {
    if (position) {
      onChange({
        latitude: position[0],
        longitude: position[1],
      });
    }
  }, [position]);

  useEffect(() => {
    if (location) {
      setMapCenter([location.latitude, location.longitude]);
      setPosition([location.latitude, location.longitude]);
    }
  }, [location]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setPosition([lat, lng]);
        setMapCenter([lat, lng]);
        setLoadingLocation(false);
        setExpanded(true);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location. Please drop a pin manually on the map.');
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleClearLocation = () => {
    setPosition(null);
    onChange(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: '#1f2a4e' }}>
          Location (Optional)
        </h3>
        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-neutral-100"
            style={{ color: '#6b7280' }}
          >
            <ChevronDown className="size-4" />
            Show Map
          </button>
        )}
        {expanded && (
          <button
            onClick={() => setExpanded(false)}
            className="text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-neutral-100"
            style={{ color: '#6b7280' }}
          >
            <ChevronUp className="size-4" />
            Hide Map
          </button>
        )}
      </div>

      {!expanded && (
        <div className="flex gap-2">
          <button
            onClick={handleUseCurrentLocation}
            disabled={loadingLocation}
            className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: '#5b9bd5', color: 'white' }}
          >
            <Navigation className="size-4" />
            {loadingLocation ? 'Getting...' : 'Use Current Location'}
          </button>
          {position && (
            <button
              onClick={handleClearLocation}
              className="px-3 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: '#FFFFF0', color: '#6b7280' }}
            >
              Clear
            </button>
          )}
        </div>
      )}

      {position && !expanded && (
        <p className="text-xs mt-2" style={{ color: '#6b7280' }}>
          📍 {position[0].toFixed(6)}, {position[1].toFixed(6)}
        </p>
      )}

      {expanded && (
        <div className="space-y-2">
          <div className="h-64 rounded-lg overflow-hidden" style={{ border: '2px solid #d4d0b8' }}>
            <SimpleMap
              center={mapCenter}
              position={position}
              onPositionChange={setPosition}
              style={{ height: '100%', width: '100%' }}
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={handleUseCurrentLocation}
              disabled={loadingLocation}
              className="px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              style={{ backgroundColor: '#5b9bd5', color: 'white' }}
            >
              <Navigation className="size-4" />
              {loadingLocation ? 'Getting Location...' : 'Use My Location'}
            </button>

            {position && (
              <button
                onClick={handleClearLocation}
                className="px-3 py-2 rounded-lg text-sm font-medium"
                style={{ backgroundColor: '#FFFFF0', color: '#6b7280' }}
              >
                Clear Location
              </button>
            )}
          </div>

          {!position && (
            <div className="text-center py-2 text-xs" style={{ color: '#6b7280' }}>
              <MapPin className="size-4 mx-auto mb-1" style={{ color: '#1f2a4e' }} />
              Click anywhere on the map to drop a pin
            </div>
          )}

          {position && (
            <p className="text-xs text-center" style={{ color: '#6b7280' }}>
              📍 {position[0].toFixed(6)}, {position[1].toFixed(6)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
