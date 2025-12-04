"use client";

import { useEffect, useRef, useState } from "react";
import { TravelPlanItem } from "@/lib/api";
import { getImageUrl } from "@/lib/image-utils";

interface PlanMapProps {
  items: TravelPlanItem[];
  selectedPlaceId: string | null;
  onPlaceSelect: (placeId: string) => void;
}

export default function PlanMap({ items, selectedPlaceId, onPlaceSelect }: PlanMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default Ho Chi Minh City center
  const DEFAULT_LAT = 10.7769;
  const DEFAULT_LNG = 106.7009;

  // Initialize Leaflet map with proper marker setup (same as map page)
  useEffect(() => {
    const initMap = async () => {
      if (typeof window === "undefined") return;

      try {
        const L = (await import("leaflet")).default;
        
        // Fix for default markers in Leaflet with Next.js
        const DefaultIcon = L.icon({
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });

        L.Marker.prototype.options.icon = DefaultIcon;

        if (mapRef.current && !mapInstanceRef.current) {
          // Initialize the map
          const map = L.map(mapRef.current).setView([DEFAULT_LAT, DEFAULT_LNG], 13);

          // Add OpenStreetMap tiles
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          }).addTo(map);

          mapInstanceRef.current = map;

          // Add a small delay to ensure the map loads properly, then load markers
          setTimeout(() => {
            map.invalidateSize();
            // Markers will be added in the second useEffect
            setLoading(false);
          }, 500);
        }
      } catch (err) {
        console.error("Error loading map:", err);
        setError("Không thể tải bản đồ");
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
  }, []);

  // Update markers when items change
  useEffect(() => {
    const updateMarkers = async () => {
      if (!mapInstanceRef.current) return;

      try {
        const L = (await import("leaflet")).default;
        const map = mapInstanceRef.current as L.Map & {
          placeMarkers?: Map<string, L.Marker>;
          defaultIcon?: L.Icon;
          selectedIcon?: L.Icon;
        };

        // Create icons if not exists
        if (!map.defaultIcon) {
          map.defaultIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          });
        }
        if (!map.selectedIcon) {
          map.selectedIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          });
        }

        // Ensure placeMarkers map exists
        if (!map.placeMarkers || !(map.placeMarkers instanceof Map)) {
          map.placeMarkers = new Map();
        }

        // Clear old markers
        map.placeMarkers.forEach((marker: L.Marker) => marker.remove());
        map.placeMarkers.clear();

        // Add new markers
        items.forEach((item) => {
          const place = item.place;
          if (!place.latitude || !place.longitude) return;

          // Get image URL
          const imageUrl = place.cover_image_url ? getImageUrl(place.cover_image_url) : '/images/placeholder.png';

          const isSelected = selectedPlaceId === place.id;
          const marker = L.marker([place.latitude, place.longitude], {
            icon: isSelected ? map.selectedIcon : map.defaultIcon
          }).addTo(map);

          const popupContent = `
            <div class="w-48 sm:w-56 md:w-64 overflow-hidden rounded-lg">
              <div class="relative h-24 sm:h-28 md:h-32 w-full">
                <img src="${imageUrl}" alt="${place.name}" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div class="absolute bottom-2 left-2 right-2">
                  <h3 class="text-white font-bold text-xs sm:text-sm line-clamp-1">${place.name}</h3>
                </div>
                <div class="absolute top-2 right-2 flex items-center gap-1 bg-yellow-500/90 text-white px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium">
                  <svg class="w-2.5 sm:w-3 h-2.5 sm:h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  ${place.average_rating != null && Number(place.average_rating) > 0 ? Number(place.average_rating).toFixed(1) : '--'}
                </div>
              </div>
              <div class="p-2 sm:p-3 bg-white">
                <div class="flex items-center text-[10px] sm:text-xs text-gray-500 mb-1.5 sm:mb-2">
                  <svg class="w-2.5 sm:w-3 h-2.5 sm:h-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  ${place.ward || 'TP. Hồ Chí Minh'}
                </div>
                <a href="/locations/${place.slug}" class="block w-full text-end text-blue-600 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-medium hover:bg-gray-100 transition-colors">
                  Xem chi tiết →
                </a>
              </div>
            </div>
          `;

          marker.bindPopup(popupContent, {
            maxWidth: window.innerWidth < 640 ? 200 : 280,
            className: 'custom-popup'
          });

          // Add click event to marker
          marker.on('click', () => {
            // Reset all markers to default icon
            map.placeMarkers!.forEach((m: L.Marker) => {
              if (map.defaultIcon) m.setIcon(map.defaultIcon);
            });
            // Set this marker to selected icon
            if (map.selectedIcon) marker.setIcon(map.selectedIcon);
            // Update selected place
            onPlaceSelect(place.id);
          });

          // Store marker with place id
          map.placeMarkers!.set(place.id, marker);

          // Open popup for selected marker
          if (isSelected) {
            marker.openPopup();
          }
        });

        // Auto-fit bounds if we have items
        if (map.placeMarkers && map.placeMarkers.size > 0) {
          const markers = Array.from(map.placeMarkers.values());
          const bounds = L.latLngBounds(
            markers.map((m: L.Marker) => m.getLatLng())
          );
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
          }
        }
      } catch (err) {
        console.error("Error updating markers:", err);
      }
    };

    if (mapInstanceRef.current && !loading) {
      updateMarkers();
    }
  }, [items, selectedPlaceId, onPlaceSelect, loading]);

  if (error) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <p className="text-gray-600 text-sm">Vui lòng thử lại</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full" style={{ minHeight: "384px" }}>
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
        style={{ minHeight: "384px" }}
      />

      {/* Map Legend */}
      {items.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10 text-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Địa điểm</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Được chọn</span>
          </div>
        </div>
      )}
    </div>
  );
}
