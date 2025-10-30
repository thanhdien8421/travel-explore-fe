"use client";

import NavBar from "@/components/nav-bar";
import VisitHistoryPage from "@/components/visit/visit-history";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-3xl">
              {user.fullName?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h1
                className="text-3xl font-bold text-gray-900"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {user.fullName}
              </h1>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                {user.role === "ADMIN" ? "Quản trị viên" : "Người dùng thường"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Visit History Section */}
          <section>
            <div className="mb-6">
              <h2
                className="text-2xl font-bold text-gray-900 mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Lịch sử ghé thăm
              </h2>
              <p className="text-gray-600">
                Danh sách các địa điểm bạn đã ghé thăm
              </p>
            </div>
            <VisitHistoryPage isModal={false} />
          </section>

          {/* Account Info Section */}
          <section className="bg-white rounded-2xl shadow-md p-8">
            <div className="mb-6">
              <h2
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Thông tin tài khoản
              </h2>
            </div>

            <div className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Họ và tên
                </label>
                <p className="text-gray-900">{user.fullName}</p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <p className="text-gray-900">{user.email}</p>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Vai trò
                </label>
                <p className="text-gray-900">
                  {user.role === "ADMIN" ? "Quản trị viên" : "Người dùng thường"}
                </p>
              </div>

              {/* Join Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ngày tham gia
                </label>
                <p className="text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
