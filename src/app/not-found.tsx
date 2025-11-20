"use client";

import Link from "next/link";
import NavBar from "@/components/nav-bar";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[rgb(250,250,250)]">
      <NavBar onSearchClick={() => {}} />

      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
        <div className="text-center space-y-8 max-w-2xl">
          {/* 404 Number */}
          <div className="space-y-3">
            <h1
              className="text-9xl md:text-10xl font-bold text-gray-900"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              404
            </h1>
            <div className="h-1 w-24 bg-blue-600 mx-auto"></div>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h2
              className="text-3xl md:text-4xl font-bold text-gray-900"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Trang không tìm thấy
            </h2>
            <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
              Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã được chuyển đi. Hãy quay lại trang chủ để tiếp tục khám phá.
            </p>
          </div>

          {/* Decorative Elements */}
          <div className="flex justify-center gap-4 py-6">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="px-8 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200 inline-flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12a9 9 0 1 1 18 0 9 9 0 0 1-18 0" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8l6 6m0-6l-6 6" />
              </svg>
              Quay lại trang chủ
            </Link>

            <Link
              href="/locations"
              className="px-8 py-3 bg-white border-2 border-gray-200 text-gray-900 font-medium rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors duration-200 inline-flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z" />
              </svg>
              Khám phá địa điểm
            </Link>
          </div>

          {/* Help Text */}
          <div className="pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Cần giúp đỡ?{" "}
              <Link href="/" className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
                Liên hệ chúng tôi
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
