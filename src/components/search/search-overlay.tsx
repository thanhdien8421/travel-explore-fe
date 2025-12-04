"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [isAISearch, setIsAISearch] = useState(false);
  const [mounted, setMounted] = useState(false);

  // For portal - ensure we're on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setSearchQuery("");
      setLocations([]);
      setHasSearched(false);
      setIsAISearch(false);
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
      if (isAISearch) {
        // Use AI-powered search
        const response = await apiService.searchWithAI({ query, limit: 10 });
        // Transform PlaceSummary to Location format
        const transformedLocations: Location[] = (response.data || []).map((place) => ({
          ...place,
          location: place.ward || "",
          image: place.cover_image_url || "",
          rating: place.average_rating || 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        setLocations(transformedLocations);
      } else {
        // Use regular search
        const response = await apiService.getLocations({ search: query, limit: 50 });
        setLocations(response.data);
      }
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

  // Don't render on server or if not open
  if (!mounted || !isOpen) return null;

  // Use portal to render outside of any stacking context
  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-white">
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
                placeholder={isAISearch 
                  ? "Mô tả nơi bạn muốn đến, VD: quán cà phê yên tĩnh để làm việc..." 
                  : "Tìm kiếm địa điểm, điểm tham quan hoặc trải nghiệm..."
                }
                value={searchQuery}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(searchQuery);
                  }
                }}
                className="w-full pl-4 pr-24 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                autoFocus
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {/* AI Search Toggle */}
                <button
                  onClick={() => setIsAISearch(!isAISearch)}
                  className={`p-2 rounded-lg transition-colors ${
                    isAISearch 
                      ? 'bg-purple-100 text-purple-600 hover:bg-purple-200' 
                      : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                  }`}
                  aria-label="Toggle AI search"
                  title={isAISearch ? "Tắt tìm kiếm AI" : "Bật tìm kiếm AI (mô tả tự nhiên)"}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                </button>
                {/* Search Button */}
                <button
                  onClick={() => handleSearch(searchQuery)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                  aria-label="Search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* AI Search Indicator */}
          {isAISearch && (
            <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-xl">
              <div className="flex items-center gap-2 text-purple-700">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
                <span className="text-sm font-medium">Tìm kiếm AI đang bật</span>
              </div>
              <p className="text-sm text-gray-600 mt-1 ml-7">
                Mô tả nơi bạn muốn tìm bằng ngôn ngữ tự nhiên
              </p>
            </div>
          )}

          {/* Popular Searches */}
          {!hasSearched && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">
                {isAISearch ? "Gợi ý mô tả AI" : "Gợi ý tìm kiếm"}
              </h3>
              <div className="flex flex-wrap gap-2">
                {(isAISearch ? [
                  "quán cà phê yên tĩnh để làm việc",
                  "nơi chụp ảnh đẹp về đêm",
                  "địa điểm vui chơi cho gia đình có trẻ nhỏ",
                  "nhà hàng view đẹp cho buổi hẹn hò",
                  "nơi tham quan lịch sử văn hóa",
                  "quán ăn ngon giá rẻ",
                  "công viên rộng rãi để dã ngoại",
                  "địa điểm mua sắm quà lưu niệm"
                ] : [
                  "Bảo tàng", 
                  "Chợ", 
                  "Chùa", 
                  "Nhà thờ", 
                  "Công viên",
                  "Quán cà phê",
                  "Nhà hàng",
                  "Phố đi bộ",
                  "Địa đạo Củ Chi",
                  "Bưu điện",
                  "Dinh Độc Lập",
                  "Bitexco"
                ]).map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchQuery(term);
                      handleSearch(term);
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      isAISearch 
                        ? 'bg-purple-100 hover:bg-purple-200 text-purple-700'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
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
              <div className="relative w-12 h-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300"></div>
                <div className="animate-spin absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent border-t-gray-600 border-r-gray-600"></div>
              </div>
              <p className="text-gray-600 mt-4">
                {isAISearch ? "AI đang tìm kiếm..." : "Đang tìm kiếm..."}
              </p>
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
    </div>,
    document.body
  );
}