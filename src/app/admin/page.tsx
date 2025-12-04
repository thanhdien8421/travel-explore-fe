"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import NavBar from "@/components/nav-bar";
import AdminSidebar from "@/components/admin-sidebar";
import LoginModal from "@/components/auth/login-modal";
import { AdminSkeleton } from "@/components/skeleton/admin-skeleton";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import { apiService, AdminPlacesResponse, AdminStats } from "@/lib/api";
import { getImageUrl } from "@/lib/image-utils";
import { useAuth } from "@/contexts/auth-context";

interface Statistics {
  totalLocations: number;
  averageRating: number;
  highQualityLocations: number;
  ratedCount: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [response, setResponse] = useState<AdminPlacesResponse | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [hardDeleteConfirm, setHardDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user } = useAuth();
  
  // Filter and pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<"name" | "createdAt" | "featured">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showDeleted, setShowDeleted] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    // Get token from localStorage and validate
    const savedToken = localStorage.getItem("auth_token");
    
    // If no token, show login modal
    if (!savedToken) {
      setShowLoginModal(true);
      setLoading(false);
      return;
    }
    
    // Try to decode token to check if it has admin role
    try {
      // Token format: JWT with payload containing {id, role}
      const payload = JSON.parse(atob(savedToken.split('.')[1]));
      if (payload.role !== "ADMIN") {
        // Not an admin, redirect away
        router.push("/");
        return;
      }
    } catch (err) {
      // Invalid token format, show login modal
      console.error("Invalid token format:", err);
      setShowLoginModal(true);
      setLoading(false);
      return;
    }
    
    setToken(savedToken);
    setIsAuthenticated(true);
    setLoading(false);
  }, [router]);

  // Fetch data function
  const fetchData = async () => {
    console.log('🔄 fetchData called');
    try {
      setTableLoading(true);
      setError(null);
      
      // Fetch table data with pagination (fast)
      const result = await apiService.getAdminPlaces({
        search: searchQuery || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        sortBy,
        sortOrder,
        page: currentPage,
        limit: itemsPerPage
      }, token || "");
      
      console.log('📊 Admin places response:', result);
      console.log('First location:', result.data[0]);
      
      setResponse(result);
      
      // Fetch stats async (non-blocking)
      apiService.getAdminStats({
        search: searchQuery || undefined,
      }, token || "")
        .then((statsData: AdminStats) => {
          setStatistics(statsData);
        })
        .catch((err) => {
          console.error("Error fetching stats:", err);
        });
    } catch (err) {
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      console.error("Error fetching data:", err);
    } finally {
      setTableLoading(false);
    }
  };

  // Fetch data on initial auth and when filters/pagination changes
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchData();
    }
  }, [isAuthenticated, token, searchQuery, sortBy, sortOrder, currentPage, itemsPerPage, statusFilter]);

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    // Re-check authentication after login
    const savedToken = localStorage.getItem("auth_token");
    if (savedToken) {
      try {
        const payload = JSON.parse(atob(savedToken.split('.')[1]));
        if (payload.role === "ADMIN") {
          setToken(savedToken);
          setIsAuthenticated(true);
        } else {
          router.push("/");
        }
      } catch (err) {
        console.error("Token validation failed:", err);
      }
    }
  };

  const handleDelete = async (placeId: string) => {
    if (!token) {
      setError("Vui lòng đăng nhập để xóa địa điểm.");
      return;
    }

    setIsDeleting(true);
    try {
      await apiService.deletePlace(placeId, token);
      setDeleteConfirm(null);
      // Refresh the list after deletion
      fetchData();
    } catch (err) {
      setError("Không thể xóa địa điểm. Vui lòng thử lại sau.");
      console.error("Error deleting location:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestore = async (placeId: string) => {
    if (!token) {
      setError("Vui lòng đăng nhập để khôi phục địa điểm.");
      return;
    }

    setRestoringId(placeId);
    try {
      await apiService.updatePlace(placeId, { isActive: true }, token);
      // Refresh the list after restoration
      fetchData();
    } catch (err) {
      setError("Không thể khôi phục địa điểm. Vui lòng thử lại sau.");
      console.error("Error restoring location:", err);
    } finally {
      setRestoringId(null);
    }
  };

  const handleHardDelete = async (placeId: string) => {
    if (!token) {
      setError("Vui lòng đăng nhập để xóa vĩnh viễn địa điểm.");
      return;
    }

    setIsDeleting(true);
    try {
      await apiService.deletePlaceWithOption(placeId, token, true);
      setHardDeleteConfirm(null);
      // Refresh the list after deletion
      fetchData();
    } catch (err) {
      setError("Không thể xóa vĩnh viễn địa điểm. Vui lòng thử lại sau.");
      console.error("Error hard deleting location:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Show loading only on first load
  if (loading && !isAuthenticated && !showLoginModal) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300"></div>
            <div className="animate-spin absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-transparent border-t-gray-700 border-r-gray-700"></div>
          </div>
          <p className="text-gray-600 mt-4 text-lg">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Show login modal if not authenticated
  // if (!isAuthenticated) {
  //   return (
  //     <>
  //       <LoginModal 
  //         isOpen={showLoginModal} 
  //         onClose={() => {}} 
  //         onSwitchToRegister={() => {}}
  //         isAdminPage={true}
  //       />
  //       <div className="flex items-center justify-center min-h-screen bg-gray-50">
  //         <div className="text-center">
  //           <p className="text-gray-600">Vui lòng đăng nhập để truy cập trang quản trị...</p>
  //         </div>
  //       </div>
  //     </>
  //   );
  // }

  if (!isAuthenticated) router.push("/");

  // Show loading state for data fetch
  if (loading) {
    return <AdminSkeleton />;
  }

  if (error && !response) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
            <p className="text-red-800 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                fetchData();
              }}
              className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition-colors"
            >
              Thử Lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <NavBar />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50" style={{ scrollbarGutter: 'stable' }}>
          <div className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-4 lg:px-8">
            {/* Header */}
            <div className="mb-6 lg:mb-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h1 
                    className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Xin chào, {user?.fullName? user.fullName.split(" ").at(-1) : "Quản trị viên"}!
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600">
                    Quản lý tất cả địa điểm du lịch trong hệ thống
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link
                    href="/admin/locations/add"
                    className="bg-gray-900 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm sm:text-base"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="hidden sm:inline">Thêm địa điểm</span>
                    <span className="sm:hidden">Thêm</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-gray-100 text-gray-800">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Tổng số địa điểm</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {statistics?.totalLocations || '--'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-50 text-yellow-600">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Đánh giá trung bình</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {statistics?.averageRating.toFixed(1) || "--"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {statistics?.ratedCount || '--'} địa điểm đã được đánh giá
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-50 text-green-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Địa điểm nổi bật</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {statistics?.highQualityLocations || '--'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Locations Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 flex flex-col max-h-[600px]" style={{ scrollbarGutter: 'stable' }}>
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                <h2 
                  className="text-xl font-bold text-gray-900 mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Danh sách địa điểm
                </h2>
                
                {/* Search and Filter Controls */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tìm kiếm
                    </label>
                    <input
                      type="text"
                      placeholder="Nhập tên địa điểm..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trạng thái
                    </label>
                    <CustomDropdown
                      value={statusFilter}
                      onChange={(value) => {
                        setStatusFilter(value);
                        setCurrentPage(1);
                      }}
                      options={[
                        { value: "ALL", label: "Tất cả" },
                        { value: "APPROVED", label: "Đã duyệt" },
                        { value: "PENDING", label: "Chờ duyệt" },
                        { value: "REJECTED", label: "Từ chối" },
                      ]}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sắp xếp theo
                    </label>
                    <CustomDropdown
                      value={sortBy}
                      onChange={(value) => {
                        setSortBy(value as "name" | "createdAt" | "featured");
                        setCurrentPage(1);
                      }}
                      options={[
                        { value: "createdAt", label: "Ngày tạo" },
                        { value: "name", label: "Tên A - Z" },
                        { value: "featured", label: "Nổi bật" },
                      ]}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thứ tự
                    </label>
                    <CustomDropdown
                      value={sortOrder}
                      onChange={(value) => {
                        setSortOrder(value as "asc" | "desc");
                        setCurrentPage(1);
                      }}
                      options={[
                        { value: "desc", label: "Mới nhất trước" },
                        { value: "asc", label: "Cũ nhất trước" },
                      ]}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hiển thị
                    </label>
                    <CustomDropdown
                      value={String(itemsPerPage)}
                      onChange={(value) => {
                        setItemsPerPage(parseInt(value));
                        setCurrentPage(1);
                      }}
                      options={[
                        { value: "5", label: "5 mục" },
                        { value: "10", label: "10 mục" },
                        { value: "20", label: "20 mục" },
                        { value: "50", label: "50 mục" },
                      ]}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("ALL");
                        setSortBy("createdAt");
                        setSortOrder("desc");
                        setCurrentPage(1);
                        setItemsPerPage(10);
                        setShowDeleted(false);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-white bg-gray-800 hover:bg-gray-900 transition-colors"
                    >
                      Đặt lại
                    </button>
                  </div>
                </div>
                
                {/* Show Deleted Checkbox */}
                <div className="mt-4 flex items-center gap-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showDeleted}
                      onChange={(e) => {
                        setShowDeleted(e.target.checked);
                        setCurrentPage(1);
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Hiển thị những địa điểm đã xóa</span>
                  </label>
                  {showDeleted && response?.data.some(loc => !loc.isActive) && (
                    <span className="text-xs text-red-600 font-medium">
                      ({response?.data.filter(loc => !loc.isActive).length} đã xóa)
                    </span>
                  )}
                </div>
              </div>
            
              <div className="overflow-x-auto overflow-y-auto flex-1" style={{ scrollbarGutter: 'stable' }}>
                <table className="w-full divide-y divide-gray-200 table-fixed">
                  <colgroup>
                    <col className="w-[40%]" />
                    <col className="w-[20%]" />
                    <col className="w-[15%]" />
                    <col className="w-[25%]" />
                  </colgroup>
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider overflow-hidden text-ellipsis">
                        Địa điểm
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider overflow-hidden text-ellipsis">
                        Khu vực
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider overflow-hidden text-ellipsis">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider overflow-hidden text-ellipsis">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tableLoading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center">
                          <div className="flex justify-center items-center">
                            <div className="relative">
                              <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300"></div>
                              <div className="animate-spin absolute top-0 left-0 w-8 h-8 rounded-full border-4 border-transparent border-t-gray-700 border-r-gray-700"></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : response?.data.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                          Không tìm thấy địa điểm nào
                        </td>
                      </tr>
                    ) : (
                      response?.data
                        .filter(location => showDeleted || location.isActive)
                        .map((location) => (
                        <tr key={location.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 overflow-hidden">
                            <div className="flex items-center min-w-0">
                              <div className="flex-shrink-0 h-16 w-16">
                                {(() => {
                                  // Get cover image - prioritize images array
                                  let imageUrl = location.coverImageUrl;
                                  if (location.images && location.images.length > 0) {
                                    const coverImage = location.images.find(img => img.is_cover);
                                    if (coverImage) {
                                      imageUrl = getImageUrl(coverImage.image_url);
                                    } else if (location.images[0]) {
                                      imageUrl = getImageUrl(location.images[0].image_url);
                                    }
                                  }
                                  imageUrl = getImageUrl(imageUrl);
                                  
                                  return (
                                    <Image
                                      src={imageUrl}
                                      alt={location.name}
                                      width={64}
                                      height={64}
                                      className="h-16 w-16 rounded-lg object-cover"
                                    />
                                  );
                                })()}
                              </div>
                              <div className="ml-4 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {location.name}
                                </div>
                                <div className="text-sm text-gray-500 truncate">
                                  {location.description || "Chưa có mô tả"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 overflow-hidden">
                            <div className="text-sm text-gray-900 truncate">
                              {location.ward || location.district || "Chưa cập nhật"}
                            </div>
                          </td>
                          <td className="px-6 py-4 overflow-hidden">
                            <div className="flex items-center min-w-0 gap-2 flex-wrap">
                              {/* Status badge */}
                              {location.status === "PENDING" && (
                                <span className="inline-flex items-center justify-center min-w-[120px] px-3 py-1.5 rounded-full text-sm font-bold bg-orange-100 text-orange-800">
                                  Chờ duyệt
                                </span>
                              )}
                              {location.status === "REJECTED" && (
                                <span className="inline-flex items-center justify-center min-w-[120px] px-3 py-1.5 rounded-full text-sm font-bold bg-red-100 text-red-800">
                                  Từ chối
                                </span>
                              )}
                              {location.status === "APPROVED" && location.isFeatured && (
                                <span className="inline-flex items-center justify-center min-w-[120px] px-3 py-1.5 rounded-full text-sm font-bold bg-yellow-100 text-yellow-800">
                                  <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  Nổi bật
                                </span>
                              )}
                              {location.status === "APPROVED" && !location.isFeatured && (
                                <span className="inline-flex items-center justify-center min-w-[120px] px-3 py-1.5 rounded-full text-sm font-bold bg-green-100 text-green-800">
                                  Đã duyệt
                                </span>
                              )}
                              {!location.isActive && (
                                <span className="inline-flex items-center justify-center min-w-[120px] px-3 py-1.5 rounded-full text-sm font-bold bg-gray-500 text-white">
                                  Đã xóa
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 overflow-hidden">
                            <div className="flex justify-end gap-2 min-w-0">
                              <Link
                                href={`/locations/${location.slug}`}
                                title="Xem"
                                className="w-9 h-9 flex items-center justify-center border border-blue-500 text-blue-500 bg-white rounded-lg hover:bg-blue-50 transition-colors flex-shrink-0"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </Link>
                              <button
                                onClick={() => router.push(`/admin/locations/${location.id}/edit`)}
                                title="Sửa"
                                className="w-9 h-9 flex items-center justify-center border border-amber-500 text-amber-500 bg-white rounded-lg hover:bg-amber-50 transition-colors flex-shrink-0"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              {location.isActive ? (
                                <button
                                  onClick={() => setDeleteConfirm(location.id)}
                                  title="Xóa"
                                  className="w-9 h-9 flex items-center justify-center border border-red-500 text-red-500 bg-white rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleRestore(location.id)}
                                    disabled={restoringId === location.id}
                                    title="Khôi phục"
                                    className="w-9 h-9 flex items-center justify-center border border-green-500 text-green-500 bg-white rounded-lg hover:bg-green-50 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => setHardDeleteConfirm(location.id)}
                                    title="Xóa vĩnh viễn"
                                    className="w-9 h-9 flex items-center justify-center bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex-shrink-0"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls - Always rendered to prevent layout shift */}
              <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0 flex justify-between items-center transition-opacity duration-200 ${tableLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="text-sm text-gray-600">
                  {response ? (
                    <>
                      Trang <span className="font-semibold">{response.pagination.page}</span> của{" "}
                      <span className="font-semibold">{response.pagination.totalPages}</span> ({response.pagination.total} tổng cộng)
                    </>
                  ) : (
                    <span className="text-transparent select-none">Trang 0 của 0 (0 tổng cộng)</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1 || tableLoading}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(response?.pagination.totalPages || 1, currentPage + 1))}
                    disabled={currentPage >= (response?.pagination.totalPages || 1) || tableLoading}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
              {/* Icon */}
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              
              {/* Header */}
              <h3 
                className="text-2xl font-bold text-gray-900 mb-3 text-center"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Xác nhận xóa
              </h3>
              <p className="text-gray-600 mb-8 text-center">
                Bạn có chắc chắn muốn xóa địa điểm này? Địa điểm sẽ bị ẩn và có thể khôi phục sau.
              </p>
              
              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={isDeleting}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={isDeleting}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Đang xóa...</span>
                    </>
                  ) : "Xóa"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hard Delete Confirmation Modal */}
        {hardDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
              {/* Icon */}
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              {/* Header */}
              <h3 
                className="text-2xl font-bold text-gray-900 mb-3 text-center"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Xóa vĩnh viễn
              </h3>
              <p className="text-gray-600 mb-4 text-center">
                Bạn có chắc chắn muốn <span className="font-semibold text-red-600">xóa vĩnh viễn</span> địa điểm này?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-red-700 text-center font-medium">
                  ⚠️ Hành động này không thể hoàn tác. Dữ liệu sẽ bị xóa hoàn toàn khỏi hệ thống.
                </p>
              </div>
              
              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setHardDeleteConfirm(null)}
                  disabled={isDeleting}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleHardDelete(hardDeleteConfirm)}
                  disabled={isDeleting}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Đang xóa...</span>
                    </>
                  ) : "Xóa vĩnh viễn"}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}