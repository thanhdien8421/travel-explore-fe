"use client";

import { useEffect, useState, useRef } from "react";
import NavBar from "@/components/nav-bar";
import LocationSearchBar from "@/components/search/location-search-bar";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import { apiService, PlaceSummary, Category } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/lib/image-utils";
import { formatRating } from "@/lib/rating-utils";

export default function MapPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [locations, setLocations] = useState<PlaceSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isAISearch, setIsAISearch] = useState(false);
    const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
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

    const handleSearch = async (query: string, isAI?: boolean) => {
        setSearchQuery(query);
        setIsAISearch(isAI || false);
        if (!query.trim()) {
            setLocations([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            let resultData: PlaceSummary[] = [];

            if (isAI) {
                // Use AI search
                const response = await apiService.searchWithAI({ query, limit: 50 });
                resultData = response.data || [];
            } else {
                // Use regular search
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
                resultData = response.data || [];
            }

            setLocations(resultData);

            // Zoom to fit all markers if we have results
            if (resultData && resultData.length > 0) {
                zoomToMarkers(resultData);
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
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
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
            const mapElement = mapRef.current as unknown as { 
                _leafletMap?: L.Map & { 
                    placeMarkers?: Map<string, L.Marker>;
                    defaultIcon?: L.Icon;
                    selectedIcon?: L.Icon;
                } 
            };
            if (!mapElement?._leafletMap) return;

            try {
                const L = (await import('leaflet')).default;
                const map = mapElement._leafletMap;

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
                locations.forEach(place => {
                    if (!place.latitude || !place.longitude) return;

                    const marker = L.marker([place.latitude, place.longitude], {
                        icon: map.defaultIcon
                    }).addTo(map);

                    // Get image URL
                    let imageUrl = place.cover_image_url;
                    if (place.images && place.images.length > 0) {
                        const coverImage = place.images.find(img => img.is_cover);
                        imageUrl = coverImage ? coverImage.image_url : place.images[0].image_url;
                    }
                    imageUrl = imageUrl ? getImageUrl(imageUrl) : '/images/placeholder.png';

                    const popupContent = `
                        <div class="w-64 overflow-hidden rounded-lg">
                            <div class="relative h-32 w-full">
                                <img src="${imageUrl}" alt="${place.name}" class="w-full h-full object-cover" />
                                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                <div class="absolute bottom-2 left-2 right-2">
                                    <h3 class="text-white font-bold text-sm line-clamp-1">${place.name}</h3>
                                </div>
                                <div class="absolute top-2 right-2 flex items-center gap-1 bg-yellow-500/90 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                                    <svg class="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                    ${place.average_rating && place.average_rating > 0 ? place.average_rating.toFixed(1) : '--'}
                                </div>
                            </div>
                            <div class="p-3 bg-white">
                                <div class="flex items-center text-xs text-gray-500 mb-2">
                                    <svg class="w-3 h-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    </svg>
                                    ${place.ward || place.district || 'TP. Hồ Chí Minh'}
                                </div>
                                <p class="text-xs text-gray-600 line-clamp-5 mb-3">${place.description || 'Khám phá địa điểm thú vị này'}</p>
                                <a href="/locations/${place.slug}" class="block w-full text-end text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-gray-600/10 transition-colors">
                                    Xem chi tiết →
                                </a>
                            </div>
                        </div>
                    `;

                    marker.bindPopup(popupContent, {
                        maxWidth: 280,
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
                        // Update selected place in sidebar
                        setSelectedPlaceId(place.id);
                        
                        // Scroll to the card in sidebar
                        setTimeout(() => {
                            const cardElement = document.getElementById(`place-card-${place.id}`);
                            if (cardElement) {
                                cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        }, 100);
                    });

                    // Store marker with place id
                    map.placeMarkers!.set(place.id, marker);
                });

                // Auto-fit bounds if we have markers
                if (map.placeMarkers && map.placeMarkers.size > 0) {
                    const markers = Array.from(map.placeMarkers.values());
                    const bounds = L.latLngBounds(
                        markers.map((m: L.Marker) => m.getLatLng())
                    );
                    map.fitBounds(bounds, { padding: [50, 50] });
                }
            } catch (err) {
                console.error('Error updating markers:', err);
            }
        };

        updateMarkers();
    }, [locations]);

    // Handle card click - highlight marker and open popup
    const handleCardClick = async (place: PlaceSummary) => {
        setSelectedPlaceId(place.id);
        
        const mapElement = mapRef.current as unknown as { 
            _leafletMap?: L.Map & { 
                placeMarkers?: Map<string, L.Marker>;
                defaultIcon?: L.Icon;
                selectedIcon?: L.Icon;
            } 
        };
        if (!mapElement?._leafletMap) return;

        const L = (await import('leaflet')).default;
        const map = mapElement._leafletMap;

        if (!map.placeMarkers || !(map.placeMarkers instanceof Map)) return;

        // Reset all markers to default icon
        map.placeMarkers.forEach((marker: L.Marker) => {
            if (map.defaultIcon) {
                marker.setIcon(map.defaultIcon);
            }
        });

        // Highlight selected marker
        const selectedMarker = map.placeMarkers.get(place.id);
        if (selectedMarker && map.selectedIcon) {
            selectedMarker.setIcon(map.selectedIcon);
            
            // Pan to marker and open popup
            if (place.latitude && place.longitude) {
                map.setView([place.latitude, place.longitude], 16, { animate: true });
            }
            selectedMarker.openPopup();
        }
    };

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
                    <CustomDropdown
                        value={selectedCategory}
                        onChange={(value) => handleCategoryChange(value)}
                        placeholder="Tất cả danh mục"
                        options={[
                            { value: "", label: "Tất cả danh mục" },
                            ...categories.map((cat) => ({
                                value: cat.slug,
                                label: cat.name,
                            })),
                        ]}
                    />
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
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            {isAISearch && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                    </svg>
                                    AI
                                </span>
                            )}
                            {loading ? "Đang tìm kiếm..." : `${locations.length} địa điểm`}
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
                    <div className="flex-1 overflow-y-auto p-2">
                        {locations.length === 0 && !loading && (
                            <div className="p-4 text-center text-gray-500">
                                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <p className="text-sm">Không tìm thấy địa điểm</p>
                                <p className="text-xs text-gray-400 mt-1">Thử tìm kiếm với từ khóa khác</p>
                            </div>
                        )}
                        {locations.map((place) => {
                            // Get image URL
                            let imageUrl = place.cover_image_url;
                            if (place.images && place.images.length > 0) {
                                const coverImage = place.images.find(img => img.is_cover);
                                imageUrl = coverImage ? coverImage.image_url : place.images[0].image_url;
                            }
                            imageUrl = imageUrl ? getImageUrl(imageUrl) : '/images/placeholder.png';

                            const isSelected = selectedPlaceId === place.id;

                            return (
                                <article
                                    key={place.id}
                                    id={`place-card-${place.id}`}
                                    onClick={() => handleCardClick(place)}
                                    className={`bg-white rounded-xl my-1.5 border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex gap-3 p-3 cursor-pointer ${
                                        isSelected 
                                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                                            : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                    }`}
                                >
                                    {/* Image */}
                                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                                        <Image
                                            src={imageUrl}
                                            alt={place.name}
                                            fill
                                            className="object-cover"
                                            sizes="80px"
                                        />
                                        {/* Rating badge on image */}
                                        <div className="absolute top-1 right-1 flex items-center gap-0.5 bg-yellow-500/90 text-white px-1.5 py-0.5 rounded-full text-[10px] font-medium">
                                            <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            {formatRating(place.average_rating, "- -")}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 flex flex-col">
                                        <Link 
                                            href={`/locations/${place.slug}`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="font-semibold text-sm text-gray-900 hover:text-blue-600 transition-colors truncate"
                                        >
                                            {place.name}
                                        </Link>
                                        
                                        <div className="flex items-center text-xs text-gray-500 mt-1">
                                            <svg className="w-3 h-3 mr-1 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="truncate">{place.ward || place.district || 'TP. Hồ Chí Minh'}</span>
                                        </div>

                                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                            {place.description || 'Khám phá địa điểm thú vị này'}
                                        </p>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
