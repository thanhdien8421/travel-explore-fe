"use client";

import { useState, useEffect } from "react";
import LocationListCard from "../card-list/location-list-card";
import { apiService, Location } from "@/lib/api";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
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
      const response = await apiService.getLocations({ search: query, limit: 20 });
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
    
    // Debounce search
    const timer = setTimeout(() => {
      handleSearch(value);
    }, 300);

    return () => clearTimeout(timer);
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
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm địa điểm, điểm tham quan hoặc trải nghiệm..."
                value={searchQuery}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                autoFocus
              />
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
      <div className="max-w-4xl mx-auto px-4 py-6 overflow-y-auto" style={{ maxHeight: "calc(100vh - 180px)" }}>
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
          <div className="space-y-4">
            <p className="text-sm text-gray-500 mb-4">
              Tìm thấy {locations.length} kết quả
            </p>
            {locations.map((location) => (
              <LocationListCard key={location.id} location={location} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}