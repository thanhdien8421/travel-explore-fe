"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import NavBar from "@/components/nav-bar";
import PartnerSidebar from "@/components/partner-sidebar";
import LocationForm from "@/components/location-form";
import { apiService, PlaceDetail } from "@/lib/api";
import { MdLightbulb } from "react-icons/md";
import { formatRating } from "@/lib/rating-utils";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Bị từ chối",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

export default function PartnerEditLocationPage() {
  const router = useRouter();
  const params = useParams();
  const locationId = params.id as string;
  const [token, setToken] = useState<string | null>(null);
  const [place, setPlace] = useState<PlaceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token");
    if (!savedToken) {
      router.push("/");
      return;
    }

    try {
      const payload = JSON.parse(atob(savedToken.split(".")[1]));
      if (payload.role !== "PARTNER" && payload.role !== "ADMIN") {
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

  const handleSuccess = (placeSlug: string) => {
    router.push(`/partner/locations`);
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-800"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <NavBar />
      <div className="flex flex-1 overflow-hidden">
        <PartnerSidebar />

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-4">
            <Link href="/partner/dashboard" className="hover:text-blue-800">
              Tổng quan
            </Link>
            <span>/</span>
            <Link href="/partner/locations" className="hover:text-blue-800">
              Địa điểm
            </Link>
            <span>/</span>
            <span className="text-gray-900">Chỉnh sửa</span>
          </div>
          <h1
            className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Chỉnh sửa địa điểm
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Cập nhật thông tin địa điểm kinh doanh của bạn
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Form */}
          <div className="xl:col-span-2">
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-800 mx-auto"></div>
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
            {/* Place Info Card */}
            {place && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Thông tin địa điểm</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Trạng thái:</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      STATUS_COLORS[(place as { status?: string }).status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-600'
                    }`}>
                      {STATUS_LABELS[(place as { status?: string }).status as keyof typeof STATUS_LABELS] || 'Không xác định'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Slug:</span>
                    <span className="text-gray-900">{place.slug}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Đánh giá:</span>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-gray-900">{formatRating(Number(place.average_rating), "--")}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-blue-900">Lưu ý quan trọng</h3>
              </div>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Các thay đổi sẽ được lưu ngay lập tức</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Nếu địa điểm đang chờ duyệt, thay đổi có thể cần duyệt lại</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Kiểm tra kỹ thông tin trước khi lưu</span>
                </li>
              </ul>
            </div>

            {/* Tips Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MdLightbulb className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-gray-900">Mẹo hữu ích</h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Cập nhật hình ảnh mới để thu hút khách hàng</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Cập nhật giờ mở cửa khi có thay đổi</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Bổ sung thông tin liên hệ đầy đủ</span>
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
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-800 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Xem trang địa điểm
                  </Link>
                )}
                <Link
                  href="/partner/locations"
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-800 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  Danh sách địa điểm
                </Link>
                <Link
                  href="/partner/locations/add"
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-800 text-sm"
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
