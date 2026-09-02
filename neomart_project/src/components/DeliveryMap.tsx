import React, { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

declare global {
  interface Window {
    google?: any;
  }
}

interface DeliveryMapProps {
  deliveryAddress: string;
  currentLat?: number;
  currentLng?: number;
  destinationLat?: number;
  destinationLng?: number;
  isDelivering: boolean;
}

export const DeliveryMap: React.FC<DeliveryMapProps> = ({
  deliveryAddress,
  currentLat = 6.5244,
  currentLng = 3.3792,
  destinationLat = 6.5244,
  destinationLng = 3.3792,
  isDelivering
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = React.useState(false);

  useEffect(() => {
    // Check if Google Maps API is loaded
    if (!window.google?.maps) {
      console.warn('Google Maps not loaded. Add API key to .env: VITE_GOOGLE_MAPS_API_KEY');
      return;
    }

    if (!mapContainer.current) return;

    // Create map
    map.current = new window.google.maps.Map(mapContainer.current, {
      zoom: 15,
      center: { lat: currentLat, lng: currentLng },
      mapTypeControl: true,
      fullscreenControl: true,
      streetViewControl: false,
    });

    // Add current location marker (delivery person)
    const currentMarker = new window.google.maps.Marker({
      position: { lat: currentLat, lng: currentLng },
      map: map.current,
      title: 'Delivery Person',
      icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    });

    // Add destination marker
    const destMarker = new window.google.maps.Marker({
      position: { lat: destinationLat, lng: destinationLng },
      map: map.current,
      title: 'Delivery Address',
      icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
    });

    // Draw route line
    const routePath = new window.google.maps.Polyline({
      path: [
        { lat: currentLat, lng: currentLng },
        { lat: destinationLat, lng: destinationLng }
      ],
      geodesic: true,
      strokeColor: '#4285F4',
      strokeOpacity: 0.8,
      strokeWeight: 3,
      map: map.current,
    });

    setMapLoaded(true);

    return () => {
      if (currentMarker) currentMarker.setMap(null);
      if (destMarker) destMarker.setMap(null);
    };
  }, [currentLat, currentLng, destinationLat, destinationLng]);

  return (
    <div className="w-full rounded-lg overflow-hidden shadow-lg bg-gray-100">
      {!mapLoaded && (
        <div className="h-96 flex items-center justify-center bg-gray-200">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-600">Map loading...</p>
            <p className="text-sm text-gray-500 mt-1">
              {!window.google?.maps && 'Google Maps not configured'}
            </p>
          </div>
        </div>
      )}
      <div 
        ref={mapContainer} 
        className="w-full h-96"
        style={{ display: mapLoaded ? 'block' : 'none' }}
      />
      {isDelivering && (
        <div className="bg-green-50 p-3 border-t border-green-200">
          <p className="text-sm text-green-700 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live tracking active
          </p>
        </div>
      )}
    </div>
  );
};
