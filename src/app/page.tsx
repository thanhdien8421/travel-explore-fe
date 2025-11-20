"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import NavBar from "@/components/nav-bar";
import HeroSection from "@/components/hero-section";
import LocationCarousel from "@/components/card-list/location-carousel";
import SearchOverlay from "@/components/search/search-overlay";
import { apiService, PlaceSummary } from "@/lib/api";
import LocationBadge from "@/components/location-badge";

export default function HomePage() {
  const [locations, setLocations] = useState<PlaceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const places = await apiService.getFeaturedPlaces(12); // Get featured places for carousel
      console.log("Featured places:", places);
      console.log("First place:", places[0]);
      setLocations(places);
    } catch (err) {
      setError("Không thể tải danh sách địa điểm. Vui lòng thử lại sau.");
      console.error("Error fetching locations:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(250,250,250)]">
      {/* Navigation - Pass search handler */}
      <NavBar onSearchClick={() => setIsSearchOpen(true)} />

      <LocationBadge />

      {/* Search Overlay */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Hero Section */}
      <HeroSection />

      {/* Search Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Tìm kiếm điểm đến của bạn
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Khám phá những địa điểm độc đáo, yêu thích của người dân địa phương và những điểm tham quan không thể bỏ lỡ
            </p>
          </div>

          {/* Search Button - Opens overlay */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full max-w-3xl mx-auto flex items-center gap-3 px-6 py-4 bg-white border-2 border-gray-200 rounded-full hover:border-blue-500 hover:shadow-lg transition-all duration-300 text-left"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-gray-500 text-lg">Tìm kiếm địa điểm, điểm tham quan hoặc trải nghiệm...</span>
          </button>
        </div>
      </section>

      {/* Featured Locations Section */}
      <main id="featured-locations" className="mx-auto px-4 py-16 border-t border-gray-200">
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Địa điểm nổi bật
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Những điểm đến phổ biến và những viên ngọc ẩn tại TP. Hồ Chí Minh
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
              <div className="animate-ping absolute top-0 left-0 w-16 h-16 rounded-full bg-blue-600 opacity-20"></div>
            </div>
            <p className="text-gray-600 mt-4 text-lg">Đang tải địa điểm...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-red-800 mb-2">Oops! Có lỗi xảy ra</h3>
            <p className="text-red-700 mb-6">{error}</p>
            <button
              onClick={() => fetchLocations()}
              className="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition-colors font-medium"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && locations.length === 0 && (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              Không tìm thấy địa điểm
            </h3>
            <p className="text-gray-600 mb-8 text-lg">
              Chưa có địa điểm nào được thêm vào hệ thống.
            </p>
            <Link
              href="/admin/locations/add"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-medium shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Thêm địa điểm mới
            </Link>
          </div>
        )}

        {/* Locations Carousel */}
        {!loading && !error && locations.length > 0 && (
          <>
            <LocationCarousel locations={locations} />

            {/* View More Link */}
            <div className="text-center mt-12">
              <Link
                href="/locations"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-800 font-semibold text-lg transition-colors"
              >
                Xem thêm
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex-shrink-0">
                <Link href="/" className="flex items-center">
                  <img src="/logo.png" alt="Travel Explore Logo" className="h-16 w-auto mr-3 mb-2 rounded-2xl" />
                </Link>
              </div>
              <p className="text-gray-400 mb-4 max-w-md text-sm">
                Khám phá những điểm đến mới mẻ và những trải nghiệm độc đáo <br/> tại Việt Nam cùng chúng tôi.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Liên kết</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Trang chủ</Link></li>
                <li><Link href="/locations" className="text-gray-400 hover:text-white transition-colors">Địa điểm</Link></li>
                {/* <li><Link href="/locations/add" className="text-gray-400 hover:text-white transition-colors">Thêm địa điểm</Link></li>
                <li><Link href="/admin" className="text-gray-400 hover:text-white transition-colors">Quản lý</Link></li> */}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Email: contact@travelexplore.vn</li>
                <li>Phone: +84 123 456 789</li>
                <li>Địa chỉ: TP. Hồ Chí Minh, Việt Nam</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Travel Explore. All right reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}