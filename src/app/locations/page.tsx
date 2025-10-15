"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/nav-bar";
import LocationBadge from "@/components/location-badge";
import SearchOverlay from "@/components/search/search-overlay";
import LocationCard from "@/components/card-list/location-card";
import { apiService, PlaceSummary } from "@/lib/api";
import Link from "next/link";

export default function LocationsPage() {
    const [locations, setLocations] = useState<PlaceSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async (search?: string) => {
        try {
            setLoading(true);
            setError(null);
            // For now, get all places since search is not implemented in new API
            const places = await apiService.getAllPlaces(50);
            setLocations(places);
        } catch (err) {
            setError("Không thể tải danh sách địa điểm. Vui lòng thử lại sau.");
            console.error("Error fetching locations:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        // For now, just filter locally since search is not implemented in new API
        if (query.trim()) {
            const filtered = locations.filter(location => 
                location.name.toLowerCase().includes(query.toLowerCase()) ||
                (location.description && location.description.toLowerCase().includes(query.toLowerCase())) ||
                (location.district && location.district.toLowerCase().includes(query.toLowerCase()))
            );
            setLocations(filtered);
        } else {
            fetchLocations();
        }
    };

    return (
        <div className="min-h-screen bg-[rgb(252,252,252)]">
            <NavBar onSearchClick={() => setIsSearchOpen(true)} />
            <LocationBadge />

            {/* Full-screen Search Overlay */}
            <SearchOverlay
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
            />

            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="text-center mb-8">
                        <h1
                            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            Chưa tìm được địa điểm mong muốn?
                        </h1>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Hãy khám phá bộ sưu tập đầy đủ các địa điểm tuyệt vời tại TP. Hồ Chí Minh dưới đây. <br />
                            Từ những điểm tham quan nổi tiếng đến những viên ngọc ẩn giấu đang chờ bạn khám phá.
                        </p>
                    </div>

                    {/* Search Button */}
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="w-full max-w-3xl mx-auto flex items-center gap-3 px-6 py-4 bg-white border-2 border-gray-200 rounded-full hover:border-gray-400 hover:shadow-lg transition-all duration-300 text-left"
                    >
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="text-gray-500 text-lg">Tìm kiếm địa điểm, điểm tham quan hoặc trải nghiệm...</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Results Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {searchQuery ? `Kết quả tìm kiếm cho "${searchQuery}"` : "Tất cả địa điểm"}
                        </h2>
                        {!loading && !error && (
                            <p className="text-gray-600 mt-2">
                                {locations.length} địa điểm được tìm thấy
                            </p>
                        )}
                    </div>

                    {/* Filter Options */}
                    <div className="flex items-center space-x-4">
                        <select className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white">
                            <option value="">Tất cả danh mục</option>
                            <option value="tourist">Du lịch</option>
                            <option value="food">Ẩm thực</option>
                            <option value="culture">Văn hóa</option>
                            <option value="shopping">Mua sắm</option>
                        </select>

                        <select className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white">
                            {/* <option value="rating">Đánh giá cao nhất</option> */}
                            <option value="name">Tên A-Z</option>
                            <option value="newest">Mới nhất</option>
                        </select>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-800"></div>
                            <div className="animate-ping absolute top-0 left-0 w-16 h-16 rounded-full bg-gray-800 opacity-20"></div>
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
                            onClick={() => fetchLocations(searchQuery)}
                            className="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition-colors font-medium"
                        >
                            Thử Lại
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && locations.length === 0 && (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
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
                            {searchQuery
                                ? `Không có kết quả cho "${searchQuery}". Hãy thử tìm kiếm với từ khóa khác.`
                                : "Chưa có địa điểm nào được thêm vào hệ thống."}
                        </p>
                    </div>
                )}

                {/* Locations Grid */}
                {!loading && !error && locations.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
                        {locations.map((location) => (
                            <LocationCard key={location.id} location={location}/>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!loading && !error && locations.length > 0 && (
                    <div className="flex justify-center mt-12">
                        <nav className="flex items-center space-x-2">
                            <button className="px-4 py-2 text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                                Trước
                            </button>
                            <button className="px-4 py-2 text-white bg-gray-800 border border-gray-800 rounded-lg hover:bg-gray-900">
                                1
                            </button>
                            <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                                2
                            </button>
                            <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                                3
                            </button>
                            <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                                Sau
                            </button>
                        </nav>
                    </div>
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
                                Khám phá những điểm đến mới mẻ và những trải nghiệm độc đáo <br /> tại Việt Nam cùng chúng tôi.
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