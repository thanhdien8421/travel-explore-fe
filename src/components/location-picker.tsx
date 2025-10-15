"use client";

import { useEffect, useRef, useState } from "react";

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (lat: number, lng: number) => void;
  onAddressChange?: (address: string) => void;
}

export default function LocationPicker({ 
  latitude, 
  longitude, 
  onLocationChange, 
  onAddressChange 
}: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Default coordinates (Ho Chi Minh City center)
  const defaultLat = 10.7756;
  const defaultLng = 106.7019;

  useEffect(() => {
    if (typeof window !== "undefined") {
      loadMap();
    }
  }, []);

  const loadMap = async () => {
    try {
      // Dynamically import Leaflet
      const L = await import("leaflet");
      
      // Fix for default markers in Leaflet with Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      if (mapContainerRef.current && !mapRef.current) {
        // Initialize map
        const initialLat = latitude || defaultLat;
        const initialLng = longitude || defaultLng;
        
        mapRef.current = L.map(mapContainerRef.current).setView([initialLat, initialLng], 13);

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapRef.current);

        // Add initial marker if coordinates exist
        if (latitude && longitude) {
          markerRef.current = L.marker([latitude, longitude]).addTo(mapRef.current);
        }

        // Add click event to map
        mapRef.current.on("click", (e: any) => {
          const { lat, lng } = e.latlng;
          updateMarker(lat, lng);
          onLocationChange(lat, lng);
          
          // Reverse geocoding to get address
          reverseGeocode(lat, lng);
        });
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading map:", error);
      setIsLoading(false);
    }
  };

  const updateMarker = async (lat: number, lng: number) => {
    const L = await import("leaflet");
    
    if (mapRef.current) {
      // Remove existing marker
      if (markerRef.current) {
        mapRef.current.removeLayer(markerRef.current);
      }
      
      // Add new marker
      markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
      
      // Center map on new location
      mapRef.current.setView([lat, lng], mapRef.current.getZoom());
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi`
      );
      const data = await response.json();
      
      if (data.display_name && onAddressChange) {
        onAddressChange(data.display_name);
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
    }
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&accept-language=vi&limit=1`
      );
      const data = await response.json();
      
      if (data.length > 0) {
        const { lat, lon } = data[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        
        updateMarker(latitude, longitude);
        onLocationChange(latitude, longitude);
        
        if (onAddressChange) {
          onAddressChange(data[0].display_name);
        }
      }
    } catch (error) {
      console.error("Error searching location:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          updateMarker(lat, lng);
          onLocationChange(lat, lng);
          reverseGeocode(lat, lng);
        },
        (error) => {
          console.error("Error getting current location:", error);
          alert("Không thể lấy vị trí hiện tại. Vui lòng cho phép truy cập vị trí.");
        }
      );
    } else {
      alert("Trình duyệt không hỗ trợ định vị.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm địa chỉ (ví dụ: Chợ Bến Thành, TP.HCM)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
            onKeyPress={(e) => e.key === "Enter" && searchLocation()}
          />
          <button
            type="button"
            onClick={searchLocation}
            disabled={isSearching}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSearching ? "..." : "Tìm"}
          </button>
        </div>
        
        <button
          type="button"
          onClick={getCurrentLocation}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          📍 Sử dụng vị trí hiện tại
        </button>
      </div>

      {/* Coordinates Display */}
      {latitude && longitude && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600">
            <p><strong>Vĩ độ:</strong> {latitude.toFixed(6)}</p>
            <p><strong>Kinh độ:</strong> {longitude.toFixed(6)}</p>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
              <p className="text-gray-600">Đang tải bản đồ...</p>
            </div>
          </div>
        )}
        
        <div
          ref={mapContainerRef}
          className="w-full h-96 rounded-lg border border-gray-300"
          style={{ height: "400px" }}
        />
        
        <div className="mt-2 text-sm text-gray-500 text-center">
          💡 Nhấp vào bản đồ để chọn vị trí chính xác
        </div>
      </div>
    </div>
  );
}