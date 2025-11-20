"use client";

import { useEffect, useState, useRef } from "react";
import NavBar from "@/components/nav-bar";
import LocationSearchBar from "@/components/search/location-search-bar";
import { apiService, PlaceSummary, Category } from "@/lib/api";
import Link from "next/link";

export default function MapPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [locations, setLocations] = useState<PlaceSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const mapRef = useRef(null);

    // Default Ho Chi Minh City center
    const DEFAULT_LAT = 10.7769;
    const DEFAULT_LNG = 106.7009;

    // Fetch categories on mount
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const cats = await apiService.getCategories();
                setCategories(cats);
            } catch (err) {
                console.error("Error fetching categories:", err);
            }
        };
        loadCategories();
    }, []);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setLocations([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const params: {
                q: string;
                limit: number;
                category?: string;
            } = {
                q: query,
                limit: 50,
            };

            if (selectedCategory) {
                params.category = selectedCategory;
            }

            const response = await apiService.getLocations(params);
            setLocations(response.data || []);

            // Zoom to fit all markers if we have results
            if (response.data && response.data.length > 0) {
                zoomToMarkers(response.data);
            }
        } catch (err) {
            setError("Không thể tải dữ liệu. Vui lòng thử lại.");
            console.error("Error searching places:", err);
        } finally {
            setLoading(false);
        }
    };

    const zoomToMarkers = (places: PlaceSummary[]) => {
        // Calculate bounds from all markers
        const validPlaces = places.filter(p => p.latitude && p.longitude);
        if (validPlaces.length === 0) return;

        const lats = validPlaces.map(p => p.latitude as number);
        const lngs = validPlaces.map(p => p.longitude as number);

        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        // Fit bounds with padding
        const bounds = [
            [minLat, minLng],
            [maxLat, maxLng],
        ];

        // Use setTimeout to ensure map is ready
        setTimeout(() => {
            const mapElement = mapRef.current as unknown as {
                fitBounds?: (bounds: number[][], options: { padding: number[] }) => void;
            } | null;
            if (mapElement && mapElement.fitBounds) {
                mapElement.fitBounds(bounds, { padding: [50, 50] });
            }
        }, 100);
    };

    const handleCategoryChange = async (category: string) => {
        setSelectedCategory(category);
        // Re-search with new category
        if (searchQuery.trim()) {
            handleSearch(searchQuery);
        }
    };

    // Initialize Leaflet map with proper marker setup
    useEffect(() => {
        const initMap = async () => {
            if (typeof window === 'undefined') return;

            try {
                const L = (await import('leaflet')).default;

                // Fix for default markers in Leaflet with Next.js
                const DefaultIcon = L.icon({
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                });

                L.Marker.prototype.options.icon = DefaultIcon;

                const mapElement = mapRef.current as unknown as { _leaflet?: boolean; _leafletMap?: L.Map & { placeMarkers?: L.Marker[] }; _layerGroup?: L.LayerGroup };
                if (mapElement && !mapElement._leaflet) {
                    // Initialize map
                    const map = L.map(mapRef.current as unknown as HTMLElement).setView([DEFAULT_LAT, DEFAULT_LNG], 13) as L.Map & { placeMarkers?: L.Marker[] };

                    // Add OSM tiles
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                        maxZoom: 19,
                    }).addTo(map);

                    // Store layerGroup for later cleanup and init placeMarkers
                    mapElement._layerGroup = L.layerGroup().addTo(map);
                    mapElement._leaflet = true;
                    mapElement._leafletMap = map;
                    map.placeMarkers = [];
                }
            } catch (err) {
                console.error('Error initializing map:', err);
            }
        };

        initMap();
    }, []);

    // Update markers when locations change
    useEffect(() => {
        const updateMarkers = async () => {
            const mapElement = mapRef.current as unknown as { _leafletMap?: L.Map & { placeMarkers?: L.Marker[] } };
            if (!mapElement?._leafletMap) return;

            try {
                const L = (await import('leaflet')).default;
                const map = mapElement._leafletMap;

                // Ensure placeMarkers array exists
                if (!map.placeMarkers) {
                    map.placeMarkers = [];
                }

                // Clear old markers
                map.placeMarkers.forEach((marker: L.Marker) => marker.remove());
                map.placeMarkers = [];

                // Add new markers
                locations.forEach(place => {
                    if (!place.latitude || !place.longitude) return;

                    const marker = L.marker([place.latitude, place.longitude]).addTo(map);

                    const popupContent = `
                        <div class="min-w-48">
                            <h3 class="font-bold text-gray-900 mb-1">${place.name}</h3>
                            ${place.cover_image_url ? `<img src="${place.cover_image_url}" alt="${place.name}" class="w-full h-32 object-cover rounded mb-2" />` : ''}
                            <p class="text-sm text-gray-600 mb-2">${place.district || ''}</p>
                            ${place.average_rating && place.average_rating > 0 ? `<p class="text-sm text-yellow-600 mb-3">⭐ ${place.average_rating.toFixed(1)}/5</p>` : '<p class="text-sm text-gray-500 mb-3">Chưa có đánh giá</p>'}
                            <a href="/locations/${place.slug}" class="inline-block bg-gray-800 text-white px-4 py-2 rounded text-sm hover:bg-gray-900 transition-colors">Xem chi tiết</a>
                        </div>
                    `;

                    marker.bindPopup(popupContent);
                    map.placeMarkers!.push(marker);
                });

                // Auto-fit bounds if we have markers
                if (map.placeMarkers && map.placeMarkers.length > 0) {
                    const bounds = L.latLngBounds(
                        map.placeMarkers.map((m: L.Marker) => m.getLatLng())
                    );
                    map.fitBounds(bounds, { padding: [50, 50] });
                }
            } catch (err) {
                console.error('Error updating markers:', err);
            }
        };

        updateMarkers();
    }, [locations]);

    return (
        <div className="w-full h-screen bg-white flex flex-col">
            {/* Header - NavBar */}
            <NavBar />

            {/* Search Panel - Centered */}
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-40 bg-transparent pointer-events-none">
                <div className="px-4 py-4 flex gap-3 items-center pointer-events-auto">
                    <div className="w-96">
                        <LocationSearchBar
                            value={searchQuery}
                            onSearch={handleSearch}
                            className="w-full"
                        />
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white"
                    >
                        <option value="">Tất cả danh mục</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.slug}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Toggle Sidebar Button - Top right corner */}
            {searchQuery && !sidebarOpen && (
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="absolute top-24 right-4 z-50 bg-white text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
                    aria-label="Open sidebar"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            )}

            {/* Main Layout - Map only (Sidebar overlaid on top) */}
            <div className="flex-1 relative w-full h-full overflow-hidden">
                {/* Map Container - Full height */}
                <div 
                    ref={mapRef}
                    className="w-full h-full" 
                    style={{ minHeight: "100%" }}
                />

                {/* Results Sidebar - Absolute positioning with strong shadow */}
                <div
                    className={`absolute top-0 right-0 bottom-0 w-80 bg-white border-l border-gray-200 flex flex-col transition-transform duration-300 ease-in-out z-50 ${
                        sidebarOpen && searchQuery ? "translate-x-0" : "translate-x-full"
                    }`}
                    style={{
                        boxShadow: "-4px 0 16px rgba(0, 0, 0, 0.15)"
                    }}
                >
                    {/* Sidebar Header with Toggle Button */}
                    <div className="p-4 border-b border-gray-200 flex-shrink-0 flex items-center justify-between relative">
                        <h3 className="font-semibold text-gray-900">
                            {loading ? "Đang tải..." : `${locations.length} địa điểm`}
                        </h3>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="text-gray-600 hover:text-gray-800 transition-colors p-1"
                            aria-label="Close sidebar"
                            title="Thu gọn"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {error && <p className="px-4 py-2 text-red-600 text-sm border-b border-gray-200">{error}</p>}

                    {/* Scrollable Results List */}
                    <div className="flex-1 overflow-y-auto">
                        {locations.length === 0 && !loading && (
                            <div className="p-4 text-center text-gray-500">
                                <p>Không tìm thấy địa điểm</p>
                            </div>
                        )}
                        {locations.map((place) => (
                            <Link
                                key={place.id}
                                href={`/locations/${place.slug}`}
                                className="block p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex gap-3">
                                    {place.cover_image_url && (
                                        <img
                                            src={place.cover_image_url}
                                            alt={place.name}
                                            className="w-16 h-16 object-cover rounded flex-shrink-0"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-gray-900 truncate">{place.name}</p>
                                        <p className="text-xs text-gray-600 truncate">{place.district}</p>
                                        {place.average_rating && place.average_rating > 0 ? (
                                            <p className="text-xs text-yellow-600 mt-1">
                                                ⭐ {place.average_rating.toFixed(1)}/5
                                            </p>
                                        ) : (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Chưa có đánh giá
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
