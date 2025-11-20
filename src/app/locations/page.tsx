"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import NavBar from "@/components/nav-bar";
import LocationBadge from "@/components/location-badge";
import SearchOverlay from "@/components/search/search-overlay";
import LocationCard from "@/components/card-list/location-card";
import LocationSearchBar from "@/components/search/location-search-bar";
import { apiService, PlaceSummary, Category } from "@/lib/api";
import Link from "next/link";

export default function LocationsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const queryQ = searchParams.get("q") || "";
    const queryPage = searchParams.get("page") || "1";
    
    const ITEMS_PER_PAGE = 12;
    
    const [locations, setLocations] = useState<PlaceSummary[]>([]);
    const [filteredLocations, setFilteredLocations] = useState<PlaceSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState(queryQ);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [sortBy, setSortBy] = useState("name_asc");
    const [categories, setCategories] = useState<Category[]>([]);
    const [currentPage, setCurrentPage] = useState(parseInt(queryPage) || 1);
    const [totalResults, setTotalResults] = useState(0);

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

    // Fetch locations on mount and when page/query changes
    useEffect(() => {
        fetchLocations(currentPage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, searchQuery, selectedCategory, sortBy]);

    const fetchLocations = async (page: number) => {
        try {
            setLoading(true);
            setError(null);
            
            // Build query parameters
            const queryParams: {
                limit: number;
                page: number;
                sortBy: string;
                q?: string;
                category?: string;
            } = {
                limit: ITEMS_PER_PAGE,
                page: page,
                sortBy: sortBy,
            };
            
            if (searchQuery.trim()) {
                queryParams.q = searchQuery.trim();
            }
            
            if (selectedCategory) {
                queryParams.category = selectedCategory;
            }
            
            // Call search API with pagination
            const response = await apiService.getLocations(queryParams);
            setLocations(response.data || []);
            setTotalResults(response.total || 0);
        } catch (err) {
            setError("Không thể tải danh sách địa điểm. Vui lòng thử lại sau.");
            console.error("Error fetching locations:", err);
        } finally {
            setLoading(false);
        }
    };

    const applyFiltersAndSort = () => {
        // Filtering and sorting now done server-side via API
        setFilteredLocations(locations);
    };

    // Apply filters and sort whenever locations change
    useEffect(() => {
        applyFiltersAndSort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locations]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1); // Reset to page 1 on new search
    };

    // Update URL when search/filter/sort/page changes
    useEffect(() => {
        const params = new URLSearchParams();
        if (searchQuery) params.set("q", searchQuery);
        if (selectedCategory) params.set("category", selectedCategory);
        if (sortBy !== "name_asc") params.set("sort", sortBy);
        if (currentPage !== 1) params.set("page", currentPage.toString());
        
        const queryString = params.toString();
        router.push(queryString ? `/locations?${queryString}` : "/locations", { scroll: false });
    }, [searchQuery, selectedCategory, sortBy, currentPage, router]);

    const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE);

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
                <div className="max-w-7xl mx-auto px-4 py-6 sm:py-12">
                    <div className="text-center mb-6 sm:mb-8">
                        <h1
                            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            Chưa tìm được địa điểm mong muốn?
                        </h1>
                        <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto px-2">
                            Hãy khám phá bộ sưu tập đầy đủ các địa điểm tuyệt vời tại TP. Hồ Chí Minh dưới đây. <br className="hidden sm:block" />
                            Từ những điểm tham quan nổi tiếng đến những viên ngọc ẩn giấu đang chờ bạn khám phá.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="w-full max-w-3xl mx-auto mb-8">
                        <LocationSearchBar 
                            value={searchQuery}
                            onSearch={handleSearch}
                            className="w-full"
                        />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
                {/* Results Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4 sm:gap-0">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                            {searchQuery ? `Kết quả tìm kiếm cho "${searchQuery}"` : "Tất cả địa điểm"}
                        </h2>
                        {!loading && !error && (
                            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
                                {filteredLocations.length} địa điểm được tìm thấy
                            </p>
                        )}
                    </div>

                    {/* Filter Options */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                        <Link
                            href={`/locations/map${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""}`}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm"
                        >
                            🗺️ Xem trên bản đồ
                        </Link>

                        <select 
                            value={selectedCategory} 
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white"
                        >
                            <option value="">Tất cả danh mục</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.slug}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>

                        <select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white"
                        >
                            <option value="name_asc">Tên A-Z</option>
                            <option value="name_desc">Tên Z-A</option>
                            <option value="rating">Đánh giá cao nhất</option>
                            <option value="newest">Mới nhất</option>
                        </select>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="relative w-20 h-20">
                            <div className="absolute inset-0 rounded-full border-4 border-gray-300"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-gray-700 border-r-gray-700 animate-spin"></div>
                        </div>
                        <p className="text-gray-600 mt-4 text-sm sm:text-base lg:text-lg">Đang tải địa điểm...</p>
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
                            onClick={() => fetchLocations(currentPage)}
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
                {!loading && !error && filteredLocations.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
                        {filteredLocations.map((location) => (
                            <LocationCard key={location.id} location={location}/>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!loading && !error && filteredLocations.length > 0 && totalPages > 1 && (
                    <div className="flex justify-center mt-12">
                        <nav className="flex items-center space-x-2">
                            <button 
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                ← Trước
                            </button>
                            
                            {/* Page numbers */}
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(page => {
                                    // Show first page, last page, current page, and 2 pages around current
                                    const start = Math.max(1, currentPage - 1);
                                    const end = Math.min(totalPages, currentPage + 1);
                                    return page === 1 || page === totalPages || (page >= start && page <= end);
                                })
                                .map((page, idx, arr) => {
                                    // Add ellipsis if there's a gap
                                    const prevPage = arr[idx - 1];
                                    const showEllipsis = prevPage && page - prevPage > 1;
                                    
                                    return (
                                        <div key={`page-${page}`} className="flex items-center">
                                            {showEllipsis && <span className="px-2 text-gray-400">...</span>}
                                            <button
                                                onClick={() => setCurrentPage(page)}
                                                className={`px-4 py-2 border rounded-lg transition-colors ${
                                                    currentPage === page
                                                        ? 'text-white bg-gray-800 border-gray-800 hover:bg-gray-900'
                                                        : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        </div>
                                    );
                                })}
                            
                            <button 
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sau →
                            </button>
                        </nav>
                        <div className="ml-8 text-gray-600">
                            Trang {currentPage} / {totalPages} ({totalResults} kết quả)
                        </div>
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