"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NavBar from "@/components/nav-bar";
import PartnerSidebar from "@/components/partner-sidebar";
import LocationForm from "@/components/location-form";
import { MdLightbulb } from "react-icons/md";

export default function PartnerAddLocationPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

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
        <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href="/partner/dashboard" className="hover:text-blue-800">
              Tổng quan
            </Link>
            <span>/</span>
            <Link href="/partner/locations" className="hover:text-blue-800">
              Địa điểm
            </Link>
            <span>/</span>
            <span className="text-gray-900">Thêm mới</span>
          </div>
          <h1
            className="text-3xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Thêm địa điểm mới
          </h1>
          <p className="text-gray-600">
            Đăng ký địa điểm kinh doanh của bạn để hiển thị trên Travel Explore
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Form */}
          <div className="xl:col-span-2">
            <LocationForm
              initialData={null}
              onSuccess={handleSuccess}
              isEditing={false}
            />
          </div>

          {/* Tips Sidebar */}
          <div className="xl:col-span-1 space-y-6">
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
                  <span>Địa điểm sẽ được kiểm duyệt trước khi hiển thị công khai</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Thời gian duyệt thường từ 1-3 ngày làm việc</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Bạn sẽ nhận thông báo khi địa điểm được duyệt</span>
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
                  <span>Đặt tên địa điểm ngắn gọn, dễ nhớ và chính xác</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Mô tả chi tiết về đặc điểm nổi bật, dịch vụ cung cấp</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Sử dụng ảnh chất lượng cao, rõ nét, thể hiện không gian thực tế</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Ghi rõ địa chỉ cụ thể để khách hàng dễ tìm kiếm</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Cung cấp thông tin liên hệ và giờ mở cửa chính xác</span>
                </li>
              </ul>
            </div>

            {/* Categories Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Danh mục phổ biến</h3>
              <div className="flex flex-wrap gap-2">
                {["Nhà hàng", "Quán cà phê", "Khách sạn", "Homestay", "Spa", "Du lịch", "Giải trí", "Mua sắm"].map((cat) => (
                  <span
                    key={cat}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* Support Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Cần hỗ trợ?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Liên hệ với chúng tôi nếu bạn cần trợ giúp trong quá trình đăng ký địa điểm.
              </p>
              <a
                href="mailto:support@travelexplore.vn"
                className="inline-flex items-center gap-2 text-blue-800 hover:underline text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                support@travelexplore.vn
              </a>
            </div>
          </div>
        </div>
        </main>
      </div>
    </div>
  );
}
