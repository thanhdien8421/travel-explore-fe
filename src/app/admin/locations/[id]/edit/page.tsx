"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import NavBar from "@/components/nav-bar";
import LocationForm from "@/components/location-form";
import AdminRouteGuard from "@/components/admin-route-guard";
import { useAuth } from "@/contexts/auth-context";
import { apiService, PlaceDetail } from "@/lib/api";

export default function EditLocation() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  const locationId = params.id as string;

  const [place, setPlace] = useState<PlaceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

    fetchLocation();
  }, [locationId]);

  const handleSuccess = (placeSlug: string) => {
    router.push(`/locations/${placeSlug}`);
  };

  return (
    <AdminRouteGuard>
      <div className="min-h-screen bg-[rgb(252,252,252)]">
        <NavBar />
        
        <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Chỉnh sửa địa điểm
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Cập nhật thông tin địa điểm của bạn
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="inline-block">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700"></div>
                </div>
                <p className="mt-4 text-gray-600">Đang tải thông tin địa điểm...</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-red-800">Lỗi</h3>
                    <p className="mt-2 text-red-700">{error}</p>
                    <button
                      onClick={() => router.back()}
                      className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
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

          {/* Right Column - Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex gap-2">
                  <span className="text-gray-400 flex-shrink-0">•</span>
                  <span>Tất cả thay đổi sẽ được lưu ngay lập tức</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400 flex-shrink-0">•</span>
                  <span>Bạn có thể cập nhật tất cả thông tin bao gồm hình ảnh, vị trí, và mô tả</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400 flex-shrink-0">•</span>
                  <span>Nếu bạn không muốn lưu, hãy nhấn Hủy</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      </div>
    </AdminRouteGuard>
  );
}
