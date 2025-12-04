"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import NavBar from "@/components/nav-bar";
import LocationForm from "@/components/location-form";

export default function AddLocationPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/login?redirect=/locations/add");
    } else {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="relative w-12 h-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300"></div>
              <div className="animate-spin absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent border-t-gray-700 border-r-gray-700"></div>
            </div>
          </div>
          <p className="text-gray-600 mt-4">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Thêm Địa Điểm Mới
          </h1>
          <p className="text-gray-600 text-lg">
            Chia sẻ những địa điểm yêu thích của bạn với cộng đồng. 
            <br />
            Các địa điểm mới sẽ được duyệt bởi đội ngũ của chúng tôi trước khi công khai.
          </p>
        </div>

        {/* Info Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Hướng dẫn:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Điền đầy đủ thông tin cơ bản (tên, mô tả, phường)</li>
                <li>Chọn vị trí chính xác trên bản đồ để tăng tính xác thực</li>
                <li>Thêm hình ảnh chất lượng cao để làm nổi bật địa điểm</li>
                <li>Thời gian duyệt thường là 24-48 giờ</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Location Form */}
        <LocationForm
          onSuccess={(slug) => {
            router.push(`/locations/${slug}`);
          }}
        />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex-shrink-0">
                <Link href="/" className="flex items-center">
                  <Image src="/logo.png" alt="Travel Explore Logo" width={64} height={64} className="h-16 w-auto mr-3 mb-2 rounded-2xl" />
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
                <li><Link href="/locations/add" className="text-gray-400 hover:text-white transition-colors">Thêm địa điểm</Link></li>
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
