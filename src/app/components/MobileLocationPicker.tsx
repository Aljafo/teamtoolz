import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Navigation } from 'lucide-react';
import { motion } from 'motion/react';
import { SimpleMap, type Location } from './SimpleMap';

export type { Location };

interface MobileLocationPickerProps {
  onBack: () => void;
  onConfirm: (location: Location | null) => void;
  initialLocation?: Location;
}

export function MobileLocationPicker({
  onBack,
  onConfirm,
  initialLocation,
}: MobileLocationPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    initialLocation ? [initialLocation.latitude, initialLocation.longitude] : null
  );
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.505, -0.09]); // Default to London

  useEffect(() => {
    if (initialLocation) {
      setMapCenter([initialLocation.latitude, initialLocation.longitude]);
    }
  }, [initialLocation]);

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
        setCurrentLocation([lat, lng]);
        setLoadingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location. Please drop a pin manually.');
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleConfirm = () => {
    if (position) {
      onConfirm({
        latitude: position[0],
        longitude: position[1],
        accuracy: currentLocation ? undefined : undefined,
      });
    }
  };

  const handleSkip = () => {
    onConfirm(null);
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="absolute inset-0 bg-white z-[100] flex flex-col"
      style={{ borderRadius: '32px' }}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-neutral-200">
        <button onClick={onBack} className="flex items-center gap-2 text-neutral-700">
          <ArrowLeft className="size-5" />
          <span>Back</span>
        </button>
        <span className="font-medium" style={{ color: '#1f2a4e' }}>Location</span>
        <button
          onClick={handleSkip}
          className="text-sm"
          style={{ color: '#6b7280' }}
        >
          Skip
        </button>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <SimpleMap
          center={mapCenter}
          position={position}
          onPositionChange={setPosition}
          style={{ height: '100%', width: '100%' }}
        />

        {/* Floating Action Buttons */}
        <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2">
          <button
            onClick={handleUseCurrentLocation}
            disabled={loadingLocation}
            className="w-full py-3 px-4 rounded-xl font-medium text-white flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            style={{ backgroundColor: '#5b9bd5' }}
          >
            <Navigation className="size-5" />
            {loadingLocation ? 'Getting Location...' : 'Use My Current Location'}
          </button>

          {!position && (
            <div className="bg-white/90 backdrop-blur p-3 rounded-xl text-center text-sm" style={{ color: '#6b7280' }}>
              <MapPin className="size-5 mx-auto mb-1" style={{ color: '#1f2a4e' }} />
              Tap anywhere on the map to drop a pin
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      {position && (
        <div className="p-4 border-t border-neutral-200 bg-white">
          <button
            onClick={handleConfirm}
            className="w-full py-3 rounded-xl font-medium text-white"
            style={{ backgroundColor: '#4dd0e1' }}
          >
            Confirm Location
          </button>
          <p className="text-xs text-center mt-2" style={{ color: '#6b7280' }}>
            {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </p>
        </div>
      )}
    </motion.div>
  );
}
