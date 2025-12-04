"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import NavBar from "@/components/nav-bar";
import AdminSidebar from "@/components/admin-sidebar";
import LocationForm from "@/components/location-form";
import { apiService, PlaceDetail } from "@/lib/api";
import { MdLightbulb, MdAutoAwesome } from "react-icons/md";

export default function AdminEditLocationPage() {
  const router = useRouter();
  const params = useParams();
  const locationId = params.id as string;
  const [token, setToken] = useState<string | null>(null);
  const [place, setPlace] = useState<PlaceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summaryMessage, setSummaryMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token");
    if (!savedToken) {
      router.push("/");
      return;
    }

    try {
      const payload = JSON.parse(atob(savedToken.split(".")[1]));
      if (payload.role !== "ADMIN") {
        router.push("/");
        return;
      }
    } catch {
      router.push("/");
      return;
    }

    setToken(savedToken);
  }, [router]);

  useEffect(() => {
    if (token && locationId) {
      fetchLocation();
    }
  }, [token, locationId]);

  const fetchLocation = async () => {
    try {
      setLoading(true);
      const data = await apiService.getPlaceById(locationId, token || undefined);
      setPlace(data);
    } catch (err) {
      console.error("Lỗi khi tải địa điểm:", err);
      setError("Không thể tải thông tin địa điểm. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!token || !place) return;
    
    setGeneratingSummary(true);
    setSummaryMessage(null);
    
    try {
      const result = await apiService.generatePlaceSummary(place.id, token);
      setPlace({ ...place, summary: result.summary });
      setSummaryMessage({ type: 'success', text: 'Đã tạo tổng hợp đánh giá thành công!' });
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Lỗi khi tạo summary:", err);
      setSummaryMessage({ 
        type: 'error', 
        text: error.message || 'Không thể tạo tổng hợp. Vui lòng thử lại sau.' 
      });
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleSuccess = (placeSlug: string) => {
    router.push(`/admin`);
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <NavBar />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-4">
            <Link href="/admin" className="hover:text-gray-900">
              Tổng quan
            </Link>
            <span>/</span>
            <span className="text-gray-900">Chỉnh sửa địa điểm</span>
          </div>
          <h1
            className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Chỉnh sửa địa điểm
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Cập nhật thông tin địa điểm trong hệ thống
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Form */}
          <div className="xl:col-span-2">
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Đang tải thông tin địa điểm...</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-900">Lỗi</h3>
                    <p className="text-red-700 mt-1">{error}</p>
                    <button
                      onClick={() => router.back()}
                      className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Quay lại
                    </button>
                  </div>
                </div>
              </div>
            ) : place ? (
              <LocationForm
                initialData={place}
                onSuccess={handleSuccess}
                isEditing={true}
              />
            ) : null}
          </div>

          {/* Tips Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* AI Summary Generator Card */}
            {place && (
              <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MdAutoAwesome className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Tổng hợp đánh giá AI</h3>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  Tự động tạo bản tổng hợp từ các đánh giá của người dùng sử dụng AI.
                </p>

                {place.summary ? (
                  <div className="mb-4 p-3 bg-white/70 rounded-lg border border-purple-100">
                    <p className="text-xs text-purple-600 font-medium mb-1">Tổng hợp hiện tại:</p>
                    <p className="text-sm text-gray-700 line-clamp-4">{place.summary}</p>
                  </div>
                ) : (
                  <div className="mb-4 p-3 bg-white/70 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500 italic">Chưa có tổng hợp đánh giá</p>
                  </div>
                )}

                {summaryMessage && (
                  <div className={`mb-4 p-3 rounded-lg text-sm ${
                    summaryMessage.type === 'success' 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {summaryMessage.text}
                  </div>
                )}

                <button
                  onClick={handleGenerateSummary}
                  disabled={generatingSummary}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingSummary ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Đang tạo...</span>
                    </>
                  ) : (
                    <>
                      <MdAutoAwesome className="w-4 h-4" />
                      <span>{place.summary ? 'Tạo lại tổng hợp' : 'Tạo tổng hợp'}</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Place Info Card */}
            {place && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Thông tin địa điểm</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">ID:</span>
                    <span className="text-gray-900 font-mono text-xs">{place.id?.slice(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Slug:</span>
                    <span className="text-gray-900">{place.slug}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Trạng thái:</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      place.is_featured ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {place.is_featured ? 'Nổi bật' : 'Thường'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Tips Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MdLightbulb className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-gray-900">Lưu ý khi chỉnh sửa</h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Tất cả thay đổi sẽ được lưu ngay lập tức</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Bạn có thể cập nhật tất cả thông tin bao gồm hình ảnh</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Slug sẽ không thay đổi khi sửa tên địa điểm</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Kiểm tra kỹ thông tin trước khi lưu</span>
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Liên kết nhanh</h3>
              <div className="space-y-2">
                {place && (
                  <Link
                    href={`/locations/${place.slug}`}
                    target="_blank"
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Xem trang địa điểm
                  </Link>
                )}
                <Link
                  href="/admin"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  Danh sách địa điểm
                </Link>
                <Link
                  href="/admin/locations/add"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Thêm địa điểm mới
                </Link>
              </div>
            </div>
          </div>
        </div>
        </main>
      </div>
    </div>
  );
}
