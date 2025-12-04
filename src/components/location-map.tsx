"use client";

import { useEffect, useRef, useState } from 'react';

interface LocationMapProps {
  latitude: number;
  longitude: number;
  placeName: string;
  address?: string;
}

export default function LocationMap({ latitude, longitude, placeName, address }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Dynamic import of Leaflet to avoid SSR issues
    const initMap = async () => {
      if (typeof window === 'undefined') return;

      try {
        setLoading(true);
        setError(null);

        const L = (await import('leaflet')).default;
        
        // Fix for default markers in Leaflet with Next.js
        const DefaultIcon = L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
        
        L.Marker.prototype.options.icon = DefaultIcon;

        if (mapRef.current && !mapInstanceRef.current) {
          // Initialize the map
          const map = L.map(mapRef.current).setView([latitude, longitude], 15);

          // Add OpenStreetMap tiles
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          }).addTo(map);

          // Add a marker for the place with a nice custom style
          const marker = L.marker([latitude, longitude]).addTo(map);
          
          // Create popup content (user can click marker to view)
          // const popupContent = `
          //   <div class="text-center p-2">
          //     <h3 class="font-bold text-lg mb-2 text-gray-800">${placeName}</h3>
          //     ${address ? `<p class="text-sm text-gray-600 mb-2">${address}</p>` : ''}
          //     <p class="text-xs text-gray-500">
          //       <span class="font-medium">Tọa độ:</span><br/>
          //       ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
          //     </p>
          //   </div>
          // `;
          
          // marker.bindPopup(popupContent);

          // Add a small delay to ensure the map loads properly
          setTimeout(() => {
            map.invalidateSize();
            setLoading(false);
          }, 500);

          mapInstanceRef.current = map;
        }
      } catch (err) {
        console.error('Error loading map:', err);
        setError('Không thể tải bản đồ');
        setLoading(false);
      }
    };

    initMap();

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, placeName, address]);

  if (error) {
    return (
      <div className="w-full h-96 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto mb-4 w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-500 mt-1">Vui lòng thử lại sau</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-200 relative">
      {loading && (
        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="relative mx-auto mb-4 w-8 h-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300"></div>
              <div className="animate-spin absolute top-0 left-0 w-8 h-8 rounded-full border-4 border-transparent border-t-gray-600 border-r-gray-600"></div>
            </div>
            <p className="text-gray-600 text-sm">Đang tải bản đồ...</p>
          </div>
        </div>
      )}
      <div 
        ref={mapRef} 
        className="w-full h-full"
        style={{ minHeight: '384px' }}
      />
    </div>
  );
}