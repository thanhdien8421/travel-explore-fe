"use client";

import { useEffect, useRef, useState } from "react";
import type * as L from "leaflet";

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
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
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
      const iconDefault = L.Icon.Default.prototype as unknown as { _getIconUrl?: string };
      delete iconDefault._getIconUrl;
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
        mapRef.current.on("click", (e: L.LeafletMouseEvent) => {
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
      {/* Search and Controls - OpenStreetMap Style */}
      <div className="space-y-3">
        {/* Search Box */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm địa chỉ, địa điểm..."
            className="w-full pl-4 pr-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            onKeyPress={(e) => e.key === "Enter" && searchLocation()}
          />
          <button
            type="button"
            onClick={searchLocation}
            disabled={isSearching}
            className="absolute inset-y-0 right-0 px-4 flex items-center text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 text-sm"
          >
            {/* {isSearching ? "..." : "Tìm"} */}
            <div className="absolute inset-y-0 left-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </button>
        </div>

        {/* Current Location Button */}
        <button
          type="button"
          onClick={getCurrentLocation}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium text-gray-700"
        >
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Sử dụng vị trí hiện tại
        </button>
      </div>

      {/* Coordinates Display */}
      {latitude && longitude && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span className="text-blue-900 font-medium">
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </span>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white rounded-lg flex items-center justify-center z-10 border border-gray-300">
            <div className="text-center">
              <div className="relative mx-auto mb-3 w-10 h-10">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300"></div>
                <div className="animate-spin absolute top-0 left-0 w-10 h-10 rounded-full border-4 border-transparent border-t-gray-600 border-r-gray-600"></div>
              </div>
              <p className="text-gray-600 text-sm font-medium">Đang tải bản đồ...</p>
            </div>
          </div>
        )}

        <div
          ref={mapContainerRef}
          className="w-full rounded-lg border-2 border-gray-300 shadow-sm overflow-hidden"
          style={{ height: "400px" }}
        />

        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Nhấp vào bản đồ để chọn vị trí chính xác</span>
        </div>
      </div>
    </div>
  );
}