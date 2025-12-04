"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import NavBar from "@/components/nav-bar";
import ContributorSidebar from "@/components/contributor-sidebar";
import LocationForm from "@/components/location-form";
import { apiService, PlaceDetail } from "@/lib/api";
import { MdLightbulb, MdWarning } from "react-icons/md";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Bị từ chối",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

export default function ContributorEditLocationPage() {
  const router = useRouter();
  const params = useParams();
  const locationId = params.id as string;
  const [token, setToken] = useState<string | null>(null);
  const [place, setPlace] = useState<PlaceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);

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

  useEffect(() => {
    if (token && locationId) {
      fetchLocation();
    }
  }, [token, locationId]);

  const fetchLocation = async () => {
    try {
      setLoading(true);
      const data = await apiService.getPlaceById(locationId, token || undefined);
      setPlace(data);
      
      // Contributor can only edit PENDING or REJECTED places
      const placeData = data as { status?: string };
      const status = placeData.status;
      setCanEdit(status === "PENDING" || status === "REJECTED");
    } catch (err) {
      console.error("Lỗi khi tải địa điểm:", err);
      setError("Không thể tải thông tin địa điểm. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

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

  const placeStatus = place ? (place as { status?: string }).status : null;

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
            <span className="text-gray-900">Chỉnh sửa</span>
          </div>
          <h1
            className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Chỉnh sửa đóng góp
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Cập nhật thông tin địa điểm bạn đã đóng góp
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Form */}
          <div className="xl:col-span-2">
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-green-800 mx-auto"></div>
                <p className="mt-4 text-gray-600">Đang tải thông tin địa điểm...</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-900">Lỗi</h3>
                    <p className="text-red-700 mt-1">{error}</p>
                    <button
                      onClick={() => router.back()}
                      className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Quay lại
                    </button>
                  </div>
                </div>
              </div>
            ) : !canEdit && place ? (
              // Cannot edit - place is APPROVED
              <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                    <MdWarning className="w-8 h-8 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Không thể chỉnh sửa
                  </h3>
                  <p className="text-gray-600 mb-2 max-w-md">
                    Địa điểm này đã được <span className="font-medium text-green-600">duyệt</span> và không thể chỉnh sửa.
                  </p>
                  <p className="text-sm text-gray-500 mb-6 max-w-md">
                    Nếu bạn cần thay đổi thông tin, vui lòng liên hệ quản trị viên để được hỗ trợ.
                  </p>
                  <div className="flex gap-3">
                    <Link
                      href={`/locations/${place.slug}`}
                      className="px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-900 transition-colors"
                    >
                      Xem địa điểm
                    </Link>
                    <Link
                      href="/contributor/locations"
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Quay lại danh sách
                    </Link>
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

          {/* Tips Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Place Info Card */}
            {place && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Thông tin đóng góp</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Trạng thái:</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      placeStatus && STATUS_COLORS[placeStatus as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-600'
                    }`}>
                      {placeStatus && STATUS_LABELS[placeStatus as keyof typeof STATUS_LABELS] || 'Không xác định'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tên:</span>
                    <span className="text-gray-900 truncate ml-2">{place.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Slug:</span>
                    <span className="text-gray-900 truncate ml-2">{place.slug}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Rules Card */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <MdWarning className="w-5 h-5 text-amber-700" />
                </div>
                <h3 className="font-semibold text-amber-900">Quy định chỉnh sửa</h3>
              </div>
              <ul className="space-y-2 text-sm text-amber-800">
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Chỉ sửa được khi trạng thái <strong>Chờ duyệt</strong> hoặc <strong>Bị từ chối</strong></span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Địa điểm <strong>Đã duyệt</strong> không thể sửa - liên hệ admin</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Sau khi sửa, địa điểm bị từ chối sẽ được gửi duyệt lại</span>
                </li>
              </ul>
            </div>

            {/* Info Card */}
            {canEdit && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-green-900">Bạn có thể chỉnh sửa</h3>
                </div>
                <p className="text-sm text-green-800">
                  {placeStatus === "PENDING" 
                    ? "Địa điểm đang chờ duyệt. Bạn có thể cập nhật thông tin trước khi được duyệt."
                    : "Địa điểm đã bị từ chối. Cập nhật và gửi lại để được duyệt."
                  }
                </p>
              </div>
            )}

            {/* Tips Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MdLightbulb className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-gray-900">Mẹo hữu ích</h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Kiểm tra kỹ thông tin trước khi lưu</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Bổ sung hình ảnh chất lượng cao</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Mô tả chi tiết và chính xác</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Đảm bảo địa chỉ đúng trên bản đồ</span>
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Liên kết nhanh</h3>
              <div className="space-y-2">
                {place && (
                  <Link
                    href={`/locations/${place.slug}`}
                    target="_blank"
                    className="flex items-center gap-2 text-gray-600 hover:text-green-800 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Xem trang địa điểm
                  </Link>
                )}
                <Link
                  href="/contributor/locations"
                  className="flex items-center gap-2 text-gray-600 hover:text-green-800 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  Danh sách đóng góp
                </Link>
                <Link
                  href="/contributor/locations/add"
                  className="flex items-center gap-2 text-gray-600 hover:text-green-800 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Thêm đóng góp mới
                </Link>
              </div>
            </div>

            {/* Support Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Cần hỗ trợ?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Liên hệ với chúng tôi nếu bạn cần trợ giúp hoặc muốn sửa đổi địa điểm đã được duyệt.
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
