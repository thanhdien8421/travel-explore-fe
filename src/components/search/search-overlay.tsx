"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LocationListCard from "../card-list/location-list-card";
import { apiService, Location } from "@/lib/api";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setSearchQuery("");
      setLocations([]);
      setHasSearched(false);
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setLocations([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const response = await apiService.getLocations({ search: query, limit: 50 });
      setLocations(response.data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    // Không gọi API, chỉ update input
  };

  const handleViewAll = () => {
    if (searchQuery.trim()) {
      onClose();
      router.push(`/locations?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close search"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Tìm kiếm địa điểm, điểm tham quan hoặc trải nghiệm..."
                value={searchQuery}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(searchQuery);
                  }
                }}
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                autoFocus
              />
              <button
                onClick={() => handleSearch(searchQuery)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Popular Searches */}
          {!hasSearched && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">TÌM KIẾM PHỔ BIẾN</h3>
              <div className="flex flex-wrap gap-2">
                {["Bảo tàng", "Chợ", "Chùa", "Nhà thờ", "Công viên"].map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchQuery(term);
                      handleSearch(term);
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-700 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-4xl mx-auto px-4 flex flex-col" style={{ height: "calc(100vh - 180px)" }}>
        {/* Results Header - Sticky */}
        {!loading && hasSearched && locations.length > 0 && (
          <div className="sticky top-0 z-20 bg-white border-b border-gray-200 py-4 flex items-center justify-between flex-shrink-0">
            <p className="text-sm text-gray-500">
              Tìm thấy {locations.length} kết quả
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  router.push(`/locations/map?q=${encodeURIComponent(searchQuery)}`);
                }}
                className="px-4 py-2 hover:bg-gray-100 text-gray-700 hover:text-gray-900 font-medium text-sm rounded-lg transition-colors flex items-center gap-2"
                title="Search on map"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Bản đồ
              </button>
              <button
                onClick={handleViewAll}
                className="px-4 py-2 hover:bg-gray-100 text-indigo-700 hover:text-indigo-900 font-medium text-sm rounded-lg transition-colors"
              >
                Xem tất cả →
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Results */}
        <div className="overflow-y-auto flex-1">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Đang tìm kiếm...</p>
            </div>
          )}

          {!loading && hasSearched && locations.length === 0 && (
            <div className="text-center py-20">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy kết quả</h3>
              <p className="text-gray-600">Thử tìm kiếm với từ khóa khác</p>
            </div>
          )}

          {!loading && locations.length > 0 && (
            <div className="py-4 space-y-4">
              {locations.map((location) => (
                <LocationListCard key={location.id} location={location} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}