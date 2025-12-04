"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NavBar from "@/components/nav-bar";
import ContributorSidebar from "@/components/contributor-sidebar";
import LocationForm from "@/components/location-form";
import { MdLightbulb } from "react-icons/md";

export default function ContributorAddLocationPage() {
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
      if (payload.role !== "CONTRIBUTOR" && payload.role !== "ADMIN") {
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
    router.push(`/contributor/locations`);
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-green-800"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <NavBar />
      <div className="flex flex-1 overflow-hidden">
        <ContributorSidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-4">
            <Link href="/contributor/dashboard" className="hover:text-green-800">
              Tổng quan
            </Link>
            <span>/</span>
            <Link href="/contributor/locations" className="hover:text-green-800">
              Đóng góp
            </Link>
            <span>/</span>
            <span className="text-gray-900">Thêm mới</span>
          </div>
          <h1
            className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Đóng góp địa điểm mới
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Chia sẻ địa điểm bạn biết để cộng đồng cùng khám phá
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
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
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-green-900">Lưu ý quan trọng</h3>
              </div>
              <ul className="space-y-2 text-sm text-green-800">
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
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Đóng góp được duyệt sẽ tích điểm cho tài khoản của bạn</span>
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
                  <span>Mô tả chi tiết về đặc điểm nổi bật của địa điểm</span>
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
                  <span>Chọn danh mục phù hợp nhất với địa điểm</span>
                </li>
              </ul>
            </div>

            {/* Categories Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Danh mục phổ biến</h3>
              <div className="flex flex-wrap gap-2">
                {["Nhà hàng", "Quán cà phê", "Khách sạn", "Homestay", "Spa", "Du lịch", "Giải trí", "Mua sắm", "Công viên", "Bảo tàng"].map((cat) => (
                  <span
                    key={cat}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* Guidelines Card */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <h3 className="font-semibold text-amber-900 mb-3">Nguyên tắc đóng góp</h3>
              <ul className="space-y-2 text-sm text-amber-800">
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Chỉ đóng góp địa điểm có thật và bạn đã biết</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Thông tin phải chính xác, không sai lệch</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Không đăng nội dung vi phạm pháp luật</span>
                </li>
              </ul>
            </div>

            {/* Support Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Cần hỗ trợ?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Liên hệ với chúng tôi nếu bạn cần trợ giúp trong quá trình đóng góp địa điểm.
              </p>
              <a
                href="mailto:support@travelexplore.vn"
                className="inline-flex items-center gap-2 text-green-800 hover:underline text-sm font-medium"
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
