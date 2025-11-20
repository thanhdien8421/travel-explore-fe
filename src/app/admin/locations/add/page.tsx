"use client";

import { useRouter } from "next/navigation";
import NavBar from "@/components/nav-bar";
import LocationForm from "@/components/location-form";
import AdminRouteGuard from "@/components/admin-route-guard";
import { MdLightbulb } from "react-icons/md";

export default function AddLocation() {
  const router = useRouter();

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
            Thêm địa điểm mới
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Chia sẻ những địa điểm thú vị mà bạn biết với cộng đồng. Tọa độ sẽ được tự động xác định từ địa chỉ.
          </p>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <LocationForm 
              initialData={null}
              onSuccess={handleSuccess}
              isEditing={false}
            />
          </div>

          {/* Right Column - Tips & Illustrations */}
          <div className="lg:col-span-1 space-y-6">
            {/* Tips Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <MdLightbulb className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-gray-900">Mẹo hữu ích</h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Đặt tên địa điểm ngắn gọn, dễ nhớ và chính xác</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Mô tả chi tiết về lịch sử, đặc điểm nổi bật của địa điểm</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Sử dụng ảnh chất lượng cao, rõ nét</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Ghi rõ địa chỉ cụ thể để dễ tìm kiếm</span>
                </li>
              </ul>
            </div>

            {/* Illustration */}
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="mb-4">
                <svg className="mx-auto w-32 h-32 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p 
                className="text-lg font-semibold text-gray-900 mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Chia sẻ điểm đến yêu thích
              </p>
              <p className="text-sm text-gray-600">
                Giúp du khách khám phá những địa điểm tuyệt vời ở Việt Nam 
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </AdminRouteGuard>
  );
}
