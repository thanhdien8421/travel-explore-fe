"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import NavBar from "@/components/nav-bar";
import UserSidebar from "@/components/user-sidebar";
import { apiService, Booking as ApiBooking } from "@/lib/api";
import { getImageUrl } from "@/lib/image-utils";

interface Booking extends Omit<ApiBooking, 'place'> {
  place: {
    id: string;
    name: string;
    slug: string;
    coverImageUrl?: string | null;
    cover_image_url?: string | null;
  };
}

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Chờ xác nhận", className: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: { label: "Đã xác nhận", className: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Đã hủy", className: "bg-red-100 text-red-800" },
  COMPLETED: { label: "Hoàn thành", className: "bg-blue-100 text-blue-800" },
};

export default function UserBookingsPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
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
      if (payload.role !== "USER") {
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
    if (token) fetchBookings();
  }, [token]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserBookings({}, token!);
      // Filter bookings that have place data
      const validBookings = (response.data || []).filter(b => b.place) as Booking[];
      setBookings(validBookings);
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Error fetching bookings:", err);
      setError(error.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Bạn có chắc muốn hủy đặt chỗ này?")) return;
    try {
      await apiService.cancelBooking(bookingId, token!);
      fetchBookings();
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "Không thể hủy đặt chỗ");
    }
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
        <UserSidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>Đặt chỗ của tôi</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Quản lý các lượt đặt chỗ tại địa điểm</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có đặt chỗ nào</h3>
              <p className="text-gray-500 mb-6">Khám phá địa điểm và đặt chỗ cho chuyến đi của bạn</p>
              <Link
                href="/locations"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Khám phá địa điểm
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const status = statusConfig[booking.status] || statusConfig.PENDING;
                return (
                  <div key={booking.id} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex gap-4">
                      <Link href={`/locations/${booking.place.slug}`} className="flex-shrink-0">
                        <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={getImageUrl(booking.place.coverImageUrl || booking.place.cover_image_url)}
                            alt={booking.place.name}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </Link>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <Link href={`/locations/${booking.place.slug}`}>
                            <h3 className="font-semibold text-gray-900 hover:text-gray-700">
                              {booking.place.name}
                            </h3>
                          </Link>
                          <span className={`inline-flex items-center justify-center min-w-[120px] px-3 py-1.5 rounded-full text-sm font-bold ${status.className}`}>
                            {status.label}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            <span className="font-medium">Ngày:</span>{" "}
                            {new Date(booking.bookingDate).toLocaleDateString("vi-VN", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                          <p>
                            <span className="font-medium">Số khách:</span> {booking.guestCount} người
                          </p>
                          {booking.note && (
                            <p>
                              <span className="font-medium">Ghi chú:</span> {booking.note}
                            </p>
                          )}
                        </div>
                        {booking.status === "PENDING" && (
                          <div className="mt-3">
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                              Hủy đặt chỗ
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          </div>
        </main>
      </div>
    </div>
  );
}
