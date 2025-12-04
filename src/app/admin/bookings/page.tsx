"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import NavBar from "@/components/nav-bar";
import AdminSidebar from "@/components/admin-sidebar";
import { apiService, Booking } from "@/lib/api";
import { getImageUrl } from "@/lib/image-utils";

// Extended interface for admin bookings with place and user details
interface AdminBooking {
  id: string;
  placeId: string;
  userId: string;
  bookingDate: string;
  guestCount: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  note?: string | null;
  createdAt: string;
  place: {
    id: string;
    name: string;
    slug: string;
    coverImageUrl?: string | null;
    cover_image_url?: string | null;
    district?: string | null;
  };
  user: {
    id: string;
    fullName: string;
    full_name?: string;
    email: string;
  };
}

export default function AdminBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

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
    } catch (err) {
      router.push("/");
      return;
    }

    setToken(savedToken);
  }, [router]);

  useEffect(() => {
    if (token) {
      fetchBookings();
    }
  }, [token, page, statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllBookings({ page, limit: 20, status: statusFilter === "all" ? undefined : statusFilter }, token || undefined);

      const filtered =
        statusFilter === "all"
          ? response.data
          : response.data.filter((b) => b.status === statusFilter);

      setBookings(filtered as unknown as AdminBooking[]);
      setError(null);
    } catch (err) {
      setError("Không thể tải danh sách booking");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (bookingId: string) => {
    if (!token) return;

    setIsProcessing(bookingId);
    try {
      await apiService.confirmBooking(bookingId, token);

      setBookings(
        bookings.map((b) =>
          b.id === bookingId ? { ...b, status: "CONFIRMED" } : b
        )
      );
      setError(null);
    } catch (err) {
      setError("Lỗi khi xác nhận booking");
      console.error(err);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!token) return;

    setIsProcessing(bookingId);
    try {
      await apiService.cancelBookingAdmin(bookingId, token);

      setBookings(
        bookings.map((b) =>
          b.id === bookingId ? { ...b, status: "CANCELLED" } : b
        )
      );
      setError(null);
    } catch (err) {
      setError("Lỗi khi hủy booking");
      console.error(err);
    } finally {
      setIsProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">Chờ xác nhận</span>;
      case "CONFIRMED":
        return <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Đã xác nhận</span>;
      case "CANCELLED":
        return <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">Đã hủy</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">{status}</span>;
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <NavBar />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto bg-[rgb(252,252,252)]" style={{ scrollbarGutter: 'stable' }}>
          <div className="max-w-7xl mx-auto py-8 px-4 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 
                className="text-3xl md:text-4xl font-bold text-gray-900 mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Danh sách đặt chỗ
              </h1>
              <p className="text-gray-600">
                Quản lý các yêu cầu đặt chỗ từ khách hàng
              </p>
            </div>

            {/* Status Filter */}
            <div className="mb-6 flex gap-3">
              {["PENDING", "CONFIRMED", "CANCELLED"].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? "bg-gray-900 text-white"
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm"
                  }`}
                >
                  {status === "PENDING" && "Chờ xác nhận"}
                  {status === "CONFIRMED" && "Đã xác nhận"}
                  {status === "CANCELLED" && "Đã hủy"}
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300"></div>
                    <div className="animate-spin absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent border-t-gray-700 border-r-gray-700"></div>
                  </div>
                  <p className="mt-4 text-gray-600">Đang tải...</p>
                </div>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
                <svg className="mx-auto w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500">Không có đặt chỗ nào</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Khách hàng
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Địa điểm
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Ngày đặt
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Số người
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Trạng thái
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {booking.user?.fullName || booking.user?.full_name || "N/A"}
                              </p>
                              <p className="text-xs text-gray-500">{booking.user?.email || "N/A"}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                <Image
                                  src={getImageUrl(booking.place?.coverImageUrl || booking.place?.cover_image_url)}
                                  alt={booking.place?.name || "Place"}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {booking.place?.name || "N/A"}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {booking.place?.district || ""}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {new Date(booking.bookingDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {booking.guestCount} người
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(booking.status)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              {booking.status === "PENDING" && (
                                <>
                                  <button
                                    onClick={() => handleConfirm(booking.id)}
                                    disabled={isProcessing === booking.id}
                                    title="Xác nhận"
                                    className="w-9 h-9 flex items-center justify-center border border-green-500 text-green-500 bg-white rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleCancel(booking.id)}
                                    disabled={isProcessing === booking.id}
                                    title="Hủy"
                                    className="w-9 h-9 flex items-center justify-center border border-red-500 text-red-500 bg-white rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
