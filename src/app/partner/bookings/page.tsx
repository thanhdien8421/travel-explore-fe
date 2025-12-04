"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NavBar from "@/components/nav-bar";
import PartnerSidebar from "@/components/partner-sidebar";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import { apiService } from "@/lib/api";

interface PartnerBooking {
  id: string;
  bookingDate: string;
  guestCount: number;
  note: string | null;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  createdAt: string;
  place: {
    id: string;
    name: string;
    slug: string;
    coverImageUrl: string | null;
  };
  user: {
    id: string;
    fullName: string | null;
    email: string;
  };
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  CANCELLED: "Đã hủy",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-100 text-gray-800",
};

export default function PartnerBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<PartnerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal
  const [confirmModal, setConfirmModal] = useState<{ booking: PartnerBooking; action: "CONFIRMED" | "CANCELLED" } | null>(null);

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
    if (token) {
      fetchBookings();
    }
  }, [token, page, statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPartnerBookings({
        page,
        limit: 10,
        status: statusFilter as "PENDING" | "CONFIRMED" | "CANCELLED" | undefined,
      }, token!);
      setBookings(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotal(response.pagination.total);
    } catch (err) {
      setError("Không thể tải danh sách đặt chỗ.");
      console.error("Error fetching partner bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!confirmModal || !token) return;

    setProcessingId(confirmModal.booking.id);
    try {
      await apiService.updatePartnerBookingStatus(confirmModal.booking.id, confirmModal.action, token);
      setConfirmModal(null);
      fetchBookings();
    } catch (err) {
      setError("Không thể cập nhật trạng thái. Vui lòng thử lại.");
      console.error("Error updating booking status:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
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
          <h1 
            className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Quản lý đặt chỗ
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Xem và xử lý các yêu cầu đặt chỗ từ khách hàng
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
          <CustomDropdown
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
            placeholder="Tất cả trạng thái"
            options={[
              { value: "", label: "Tất cả trạng thái" },
              { value: "PENDING", label: "Chờ xác nhận" },
              { value: "CONFIRMED", label: "Đã xác nhận" },
              { value: "CANCELLED", label: "Đã hủy" },
            ]}
          />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
            <button onClick={() => setError(null)} className="ml-2 underline">
              Đóng
            </button>
          </div>
        )}

        {/* Bookings List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-800"></div>
              <p className="mt-4 text-gray-600">Đang tải...</p>
            </div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có đặt chỗ nào</h3>
            <p className="text-gray-500">Khi có khách đặt chỗ, bạn sẽ thấy ở đây</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Booking Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{booking.user.fullName || booking.user.email}</h3>
                          <span className={`inline-flex items-center justify-center min-w-[120px] px-3 py-1.5 rounded-full text-sm font-bold ${STATUS_COLORS[booking.status]}`}>
                            {STATUS_LABELS[booking.status]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{booking.user.email}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                          <span className="text-gray-600">
                            <span className="font-medium">Địa điểm:</span>{" "}
                            <Link href={`/locations/${booking.place.slug}`} className="text-blue-800 hover:underline">
                              {booking.place.name}
                            </Link>
                          </span>
                          <span className="text-gray-600">
                            <span className="font-medium">Ngày:</span> {formatDate(booking.bookingDate)}
                          </span>
                          <span className="text-gray-600">
                            <span className="font-medium">Số khách:</span> {booking.guestCount}
                          </span>
                        </div>
                        {booking.note && (
                          <p className="mt-2 text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                            <span className="font-medium">Ghi chú:</span> {booking.note}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-gray-400">
                          Đặt lúc: {formatDateTime(booking.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {booking.status === "PENDING" && (
                    <div className="flex gap-2 lg:flex-col">
                      <button
                        onClick={() => setConfirmModal({ booking, action: "CONFIRMED" })}
                        disabled={processingId === booking.id}
                        className="flex-1 lg:flex-none px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Xác nhận
                      </button>
                      <button
                        onClick={() => setConfirmModal({ booking, action: "CANCELLED" })}
                        disabled={processingId === booking.id}
                        className="flex-1 lg:flex-none px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Từ chối
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Pagination */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Trang <span className="font-semibold">{page}</span> của{" "}
                <span className="font-semibold">{totalPages}</span> ({total} đặt chỗ)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        )}
        </main>
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
            {/* Icon */}
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
              confirmModal.action === "CONFIRMED" ? "bg-green-100" : "bg-red-100"
            }`}>
              {confirmModal.action === "CONFIRMED" ? (
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>

            {/* Header */}
            <h3
              className="text-2xl font-bold text-gray-900 mb-3 text-center"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {confirmModal.action === "CONFIRMED" ? "Xác nhận đặt chỗ" : "Từ chối đặt chỗ"}
            </h3>
            <p className="text-gray-600 mb-6 text-center">
              {confirmModal.action === "CONFIRMED"
                ? `Xác nhận đặt chỗ của ${confirmModal.booking.user.fullName || confirmModal.booking.user.email}?`
                : `Bạn có chắc muốn từ chối đặt chỗ này?`}
            </p>

            {/* Booking Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Địa điểm:</span> {confirmModal.booking.place.name}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Ngày:</span> {formatDate(confirmModal.booking.bookingDate)}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Số khách:</span> {confirmModal.booking.guestCount}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setConfirmModal(null)}
                disabled={processingId !== null}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={processingId !== null}
                className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 ${
                  confirmModal.action === "CONFIRMED"
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                {processingId ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Đang xử lý...</span>
                  </>
                ) : confirmModal.action === "CONFIRMED" ? (
                  "Xác nhận"
                ) : (
                  "Từ chối"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
